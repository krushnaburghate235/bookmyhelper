import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App.jsx";
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority:
    "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_9wws0IpNi",
  client_id: "1v6mehug6e7kmshsmqjq5035c0",
  redirect_uri: `${import.meta.env.VITE_FRONTEND_URL}/`,
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email openid phone",
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>
);
