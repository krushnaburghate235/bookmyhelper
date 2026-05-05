import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import NotesPage from "./components/NotesPage";
import SharedPageNote from "./components/SharedPageNote";
import { BounceLoader } from "react-spinners";

function App() {
  const auth = useAuth();

  // After successful sign-in, remove ?code&state from the URL so refresh won't break
  useEffect(() => {
    if (!auth.isAuthenticated) return;
    const params = new URLSearchParams(window.location.search);
    if (params.has("code") || params.has("state")) {
      // Replace current history entry with clean root route
      window.history.replaceState({}, document.title, "/");
    }
  }, [auth.isAuthenticated]);
  return (
    <Router>
      <Routes>
        <Route path="/shared/:noteId" element={<SharedPageNote />} />
        <Route
          path="/"
          element={
            <>
              {auth.isLoading && (
                <div className="w-screen h-screen flex items-center justify-center">
                  <BounceLoader color="blue" />
                </div>
              )}
              {auth.error && <p>Error {auth.error}</p>}
              {auth.isAuthenticated && <NotesPage auth={auth} />}
              {!auth.isAuthenticated && !auth.error && !auth.isLoading && (
                <LandingPage />
              )}
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
