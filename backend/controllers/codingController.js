import asyncHandler from '../utils/asyncHandler.js';
import { runSubmission } from '../services/codingService.js';
import {
  getRunnerStatus,
  holdRunner,
  requestRunnerSession,
} from '../services/codeRunnerService.js';

export const runCodingSubmissionHandler = asyncHandler(async (req, res) => {
  const result = await runSubmission(req.body);
  res.status(200).json(result);
});

export const getCodeRunnerStatusHandler = asyncHandler(async (_req, res) => {
  res.status(200).json(await getRunnerStatus());
});

export const requestCodeRunnerSessionHandler = asyncHandler(async (_req, res) => {
  res.status(200).json(await requestRunnerSession());
});

export const holdCodeRunnerHandler = asyncHandler(async (req, res) => {
  res.status(200).json(await holdRunner(req.body));
});
