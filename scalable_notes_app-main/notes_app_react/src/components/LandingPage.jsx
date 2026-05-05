import { useAuth } from "react-oidc-context";

const LandingPage = () => {
  const auth = useAuth();
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="hero bg-base-100 p-8 rounded-xl shadow-xl max-w-md">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <img
              className="h-36 w-36 mx-auto mb-4"
              src="./notes.png"
              alt="Notes App"
            ></img>
            <h1 className="text-5xl font-bold">Notes App</h1>
            <p className="py-6">
              Securely store and manage your personal notes with AWS DynamoDB.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                className="btn btn-primary"
                onClick={() => auth.signinRedirect()}
              >
                Sign In
              </button>
              <button
                className="btn btn-outline"
                onClick={() =>
                  auth.signinRedirect({
                    extraQueryParams: "signup",
                  })
                }
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
