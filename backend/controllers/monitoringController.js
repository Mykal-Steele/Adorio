import asyncHandler from '../utils/asyncHandler.js';
import { getServerMetrics, getUptimeMonitors } from '../services/monitoringService.js';

export const getMetrics = asyncHandler(async (_req, res) => {
  const data = await getServerMetrics();
  res.json(data);
});

export const getUptime = asyncHandler(async (_req, res) => {
  const data = await getUptimeMonitors();
  res.json(data);
});
