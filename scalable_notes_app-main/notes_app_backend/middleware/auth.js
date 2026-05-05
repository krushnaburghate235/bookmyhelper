import { GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import cognitoClient from "../config/cognito.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const command = new GetUserCommand({
      AccessToken: token,
    });

    const result = await cognitoClient.send(command);

    const attributes = result.UserAttributes.reduce((acc, attr) => {
      acc[attr.Name] = attr.Value;
      return acc;
    }, {});

    req.user = {
      clientId: attributes.sub,
      attributes,
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
