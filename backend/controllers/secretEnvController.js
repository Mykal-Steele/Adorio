import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import {
  createSecretMessage,
  retrieveSecretMessage,
  retrieveNamedSecretMessage,
} from '../services/secretEnvService.js';

const storeSecretMessage = asyncHandler(async (req, res) => {
  const result = await createSecretMessage({ userId: req.user.id, rawBody: req.body });

  if (result.name) {
    res.status(201).json({
      message: 'Secret message stored successfully',
      name: result.name,
      retrievalCommand: 'curl -fsSL https://env.adorio.space | sh',
    });
    return;
  }

  res.status(201).json({
    message: 'Secret message stored successfully',
    retrievalCommand: `curl -H "Authorization: ${result.realPassword}" https://adorio.space/api/secretenv`,
  });
});

const retrieveSecretMessageHandler = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw ApiError.unauthorized('Authorization header is required');

  const name = req.params.name || req.query.name;
  const decryptedMessage = name
    ? await retrieveNamedSecretMessage({
        name,
        passphrase: authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader,
      })
    : await retrieveSecretMessage(authHeader);

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(decryptedMessage);
});

export { storeSecretMessage, retrieveSecretMessageHandler };
