import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

const region = "ap-south-1";

const cognitoClient = new CognitoIdentityProviderClient({ region });

export default cognitoClient;
