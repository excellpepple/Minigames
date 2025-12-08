import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";


// Mongo models
import User from "./models/User.js";
import PlayerStats from "./models/PlayerStats.js";


// Cognito
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GetUserCommand
} from "@aws-sdk/client-cognito-identity-provider";


// Fix dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();
const app = express();


// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());


// ------------------ MongoDB Connection ------------------
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));


// ------------------ Cognito Config ------------------
const REGION = process.env.COGNITO_REGION;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;


const cognito = new CognitoIdentityProviderClient({ region: REGION });


// ------------------ Cognito Login Route ------------------
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


    const response = await cognito.send(command);
    if (!response.AuthenticationResult) {
      return res.status(400).json({ error: "Authentication failed" });
    }


    const userData = await cognito.send(
      new GetUserCommand({
        AccessToken: response.AuthenticationResult.AccessToken,
      })
    );


    const subAttr = userData.UserAttributes.find(attr => attr.Name === "sub");
    const cognitoSub = subAttr ? subAttr.Value : null;


    res.json({
      AccessToken: response.AuthenticationResult.AccessToken,
      IdToken: response.AuthenticationResult.IdToken,
      RefreshToken: response.AuthenticationResult.RefreshToken,
      cognitoSub,
    });
  } catch (err) {
    console.error("Login backend error:", err);
    res.status(400).json({ error: err.message || "Login failed" });
  }
});

