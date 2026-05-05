import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BounceLoader } from "react-spinners";

const SharedPageNote = () => {
  const { noteId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedNote = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/notes/shared/${noteId}`
        );
        if (!response.ok) {
          throw new Error("Note not found or not public");
        }
        const data = await response.json();
        setNote(data.note);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedNote();
  }, [noteId]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <BounceLoader color="blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl">
        <div className="navbar mb-6">
          <div className="flex-1">
            <div className="flex flex-row items-center">
              <img
                src="../../notes.png"
                alt="Notes Logo"
                className="w-10 h-10"
              />
              <a className="mx-2 normal-case text-2xl font-bold">Notes App</a>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <p className="text-error text-center font-bold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="navbar mb-6">
        <div className="flex-1">
          <div className="flex flex-row items-center">
            <img src="../notes.png" alt="Notes Logo" className="w-10 h-10" />
            <a className="mx-2 normal-case text-2xl font-bold">Notes App</a>
          </div>
        </div>
      </div>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-start mb-4">
            <h2 className="card-title text-xl">Shared Note</h2>
            <div className="badge badge-success">Public</div>
          </div>
          <p className="whitespace-pre-wrap font-caveat text-xl leading-relaxed">
            {note.note}
          </p>
          <div className="card-actions justify-end mt-6">
            <div className="text-sm opacity-60">
              Last updated: {new Date(note.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedPageNote;
