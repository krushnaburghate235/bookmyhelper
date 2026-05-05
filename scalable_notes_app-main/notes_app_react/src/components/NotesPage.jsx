import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Edit, Trash2, Share2 } from "lucide-react";

const NotesPage = ({ auth }) => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [noteToView, setNoteToView] = useState(null);
  const [isPublic, setIsPublic] = useState(false);

  // Pagination state
  const [nextKey, setNextKey] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);
  // Refs to avoid stale closures and observer recreation loops
  const nextKeyRef = useRef(nextKey);
  const isLoadingRef = useRef(isLoading);

  const signOutRedirect = () => {
    const clientId = "1v6mehug6e7kmshsmqjq5035c0";
    const logoutUri = `${import.meta.env.VITE_FRONTEND_URL}/`;
    const cognitoDomain =
      "https://ap-south-19wws0ipni.auth.ap-south-1.amazoncognito.com";
    auth.removeUser();
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
      logoutUri
    )}`;
  };

  const deleteNote = async (noteId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${auth.user.access_token}`,
        },
      });
      if (response.ok) {
        // Reload from the beginning to reflect deletion
        setNextKey(null);
        nextKeyRef.current = null;
        setHasMore(true);
        await fetchNotes({ append: false, useKey: null });
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const openModalForNew = () => {
    setNoteToEdit(null);
    setCurrentNote("");
    setIsPublic(false);
    setIsModalOpen(true);
  };
  const openModalForEdit = (note) => {
    setNoteToEdit(note);
    setCurrentNote(note.note);
    setIsPublic(note.isPublic || false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setNoteToEdit(null);
    setCurrentNote("");
    setIsPublic(false);
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      deleteNote(noteToDelete.noteId);
      setNoteToDelete(null);
    }
  };

  const fetchNotes = useCallback(
    async ({ append = false, useKey = null } = {}) => {
      if (!auth.user?.access_token) return;
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setIsLoading(true);
      try {
        const qs = new URLSearchParams();
        qs.set("limit", "12");
        if (useKey) qs.set("nextKey", useKey);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/notes?${qs.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${auth.user.access_token}`,
            },
          }
        );
        const data = await response.json();
        setNotes((prev) =>
          append ? [...prev, ...(data.notes || [])] : data.notes || []
        );
        setNextKey(data.nextKey || null);
        nextKeyRef.current = data.nextKey || null;
        setHasMore(Boolean(data.nextKey));
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [auth.user?.access_token]
  );

  const handleSaveNote = async () => {
    if (!currentNote.trim()) return;

    const method = noteToEdit ? "PUT" : "POST";
    const url = noteToEdit
      ? `${import.meta.env.VITE_BACKEND_URL}/notes/${noteToEdit.noteId}`
      : `${import.meta.env.VITE_BACKEND_URL}/notes`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.user.access_token}`,
        },
        body: JSON.stringify({ note: currentNote, isPublic }),
      });

      if (response.ok) {
        closeModal();
        // Reload from the beginning to include the latest changes
        setNextKey(null);
        nextKeyRef.current = null;
        setHasMore(true);
        await fetchNotes({ append: false, useKey: null });
      }
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };
  // Infinite scroll: create a stable observer that doesn't recreate on state changes
  useEffect(() => {
    if (!loaderRef.current) return;
    const el = loaderRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          nextKeyRef.current &&
          !isLoadingRef.current
        ) {
          fetchNotes({ append: true, useKey: nextKeyRef.current });
        }
      },
      { root: null, rootMargin: "0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [loaderRef, fetchNotes]);

  // Window scroll fallback: if near bottom and there's a next page, load it
  useEffect(() => {
    const onScroll = () => {
      if (!nextKeyRef.current || isLoadingRef.current) return;
      const scrollPos = window.innerHeight + window.scrollY;
      const docHeight = document.body.offsetHeight;
      if (docHeight - scrollPos < 400) {
        fetchNotes({ append: true, useKey: nextKeyRef.current });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [fetchNotes]);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.access_token) {
      // initial load from start
      fetchNotes({ append: false, useKey: null });
    }
  }, [auth.isAuthenticated, auth.user?.access_token, fetchNotes]);

  // Keep refs in sync with state
  useEffect(() => {
    nextKeyRef.current = nextKey;
  }, [nextKey]);
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const copyShareUrl = async (note) => {
    if (note.shareUrl) {
      try {
        await navigator.clipboard.writeText(note.shareUrl);
        // Could add a toast notification here
        alert("Share URL copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy URL:", err);
        alert("Failed to copy URL. Please copy manually: " + note.shareUrl);
      }
    }
  };

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="navbar mb-6">
        <div className="flex-1 flex justify-between">
          <div className="flex flex-row items-center">
            <img src="./notes.png" alt="Notes Logo" className="w-10 h-10" />
            <a className="mx-2 normal-case text-2xl font-bold">My Notes</a>
          </div>
          <div className="flex-none">
            <button
              className="btn btn-outline"
              onClick={() => signOutRedirect()}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-20">
        {notes.map((note) => (
          <div
            key={note.noteId}
            className="card note-card cursor-pointer"
            onClick={() => setNoteToView(note)}
          >
            <div className="card-body">
              <div className="flex justify-between items-start mb-2">
                <p className="line-clamp-3 flex-grow font-caveat text-2xl">
                  {note.note}
                </p>
                {note.isPublic && (
                  <div className="badge badge-success badge-sm">Public</div>
                )}
              </div>
              <div className="card-actions justify-between items-center mt-4">
                <div className="text-sm opacity-60">
                  {new Date(note.lastUpdated).toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-xs btn-ghost btn-circle">
                    <Edit
                      size={16}
                      onClick={(e) => {
                        e.stopPropagation();
                        openModalForEdit(note);
                      }}
                    />
                  </button>
                  <button className="btn btn-xs btn-ghost btn-circle text-error">
                    <Trash2
                      size={16}
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteToDelete(note);
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        className="btn btn-primary btn-lg rounded-lg fixed bottom-10 right-10 shadow-lg"
        onClick={openModalForNew}
      >
        <Plus size={24} />
        <p>New Note</p>
      </button>
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {noteToEdit ? "Edit Note" : "Add New Note"}
            </h3>
            <textarea
              className="textarea textarea-bordered w-full mt-4 h-48 font-caveat text-xl"
              placeholder="Write your note here..."
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
            ></textarea>
            <div className="form-control mt-4">
              <label className="label cursor-pointer">
                <span className="label-text">
                  Make this note public (shareable)
                </span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
              </label>
            </div>
            <div className="modal-action">
              <button className="btn" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveNote}>
                {noteToEdit ? "Save Changes" : "Add Note"}
              </button>
            </div>
          </div>
        </div>
      )}
      {noteToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p className="py-4">Are you sure you want to delete this note?</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setNoteToDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {noteToView && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              View Note
              {noteToView.isPublic && (
                <div className="badge badge-success">Public</div>
              )}
            </h3>
            <p className="py-4 whitespace-pre-wrap font-caveat text-xl">
              {noteToView.note}
            </p>
            {noteToView.isPublic && noteToView.shareUrl && (
              <div className="mt-4 p-3 bg-base-200 rounded-lg">
                <p className="text-sm font-medium mb-2">Share URL:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteToView.shareUrl}
                    readOnly
                    className="input input-bordered input-sm flex-1"
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => copyShareUrl(noteToView)}
                  >
                    <Share2 size={16} />
                    Copy
                  </button>
                </div>
              </div>
            )}
            <div className="modal-action">
              <button className="btn" onClick={() => setNoteToView(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div ref={loaderRef} className="py-6 text-center opacity-70">
        {isLoading ? (
          "Loading more…"
        ) : hasMore ? (
          <button
            className="btn btn-sm"
            onClick={() =>
              nextKeyRef.current &&
              fetchNotes({ append: true, useKey: nextKeyRef.current })
            }
          >
            Scroll for more (or click to load)
          </button>
        ) : (
          "No more notes"
        )}
      </div>
    </div>
  );
};

export default NotesPage;
