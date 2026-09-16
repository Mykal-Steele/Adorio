import asyncHandler from '../utils/asyncHandler.js';
import { runSubmission } from '../services/codingService.js';

export const runCodingSubmissionHandler = asyncHandler(async (req, res) => {
  const result = await runSubmission(req.body);
  res.status(200).json(result);
});
