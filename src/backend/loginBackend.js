// This is the file that needs to be running on port 4000,
// in order for the login page to call Cognito

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

const REGION = process.env.COGNITO_REGION;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const COGNITO_PORT = process.env.COGNITO_CONNECTION_PORT || 4000;

const client = new CognitoIdentityProviderClient({ region: REGION });

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: username, 
        PASSWORD: password,
        },
    });

    const response = await client.send(command);

    if (!response.AuthenticationResult) {
      return res.status(400).json({ error: "Authentication failed" });
    }

    res.json(response.AuthenticationResult);
  } catch (err) {
    console.error("Login backend error:", err);
    res.status(400).json({ error: err.message || "Login failed" });
  }
});

app.listen(COGNITO_PORT, () => console.log("Cognito backend running on http://localhost:", COGNITO_PORT));
