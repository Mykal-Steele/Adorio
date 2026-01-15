import asyncHandler from "../utils/asyncHandler.js";
import {
  createSecretMessage,
  retrieveSecretMessage,
} from "../services/secretEnvService.js";

const storeSecretMessage = asyncHandler(async (req, res) => {
  const { message, password } = req.body;
  const userId = req.user.id;

  const { realPassword } = await createSecretMessage({
    userId,
    message,
    password,
  });

  res.status(201).json({
    message: "Secret message stored successfully",
    retrievalCommand: `curl -H "Authorization: ${realPassword}" https://adorio.space/api/secretenv`,
  });
});

const retrieveSecretMessageHandler = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: "Authorization header is required" });
    return;
  }

  const decryptedMessage = await retrieveSecretMessage(authHeader);
  res.setHeader("Content-Type", "text/plain");
  res.send(decryptedMessage);
});

export { storeSecretMessage, retrieveSecretMessageHandler };
