import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { createSecretMessage, retrieveSecretMessage } from '../services/secretEnvService.js';

const storeSecretMessage = asyncHandler(async (req, res) => {
  const { realPassword } = await createSecretMessage({ userId: req.user.id, rawBody: req.body });
  res.status(201).json({
    message: 'Secret message stored successfully',
    retrievalCommand: `curl -H "Authorization: ${realPassword}" https://adorio.space/api/secretenv`,
  });
});

const retrieveSecretMessageHandler = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw ApiError.unauthorized('Authorization header is required');

  const decryptedMessage = await retrieveSecretMessage(authHeader);
  res.setHeader('Content-Type', 'text/plain');
  res.send(decryptedMessage);
});

export { storeSecretMessage, retrieveSecretMessageHandler };
