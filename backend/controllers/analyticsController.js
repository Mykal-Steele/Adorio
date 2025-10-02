import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import {
  recordVisit,
  getPageViewStats,
  getRecentVisits,
  getVisitorStats,
} from '../services/analyticsService.js';

const extractIpAddress = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || null;
};

const trackVisit = asyncHandler(async (req, res) => {
  const {
    path,
    fullUrl,
    referrer,
    durationMs,
    locale,
    timezoneOffset,
    sessionId: sessionIdFromBody,
    metadata,
    visitorId: visitorIdFromBody,
    userId: userIdFromBody,
  } = req.body || {};

  const visitorId = req.visitor?.id || visitorIdFromBody;
  const sessionId = req.visitor?.sessionId || sessionIdFromBody;
  const userId = req.user?.id || userIdFromBody || null;

  if (!path) {
    throw ApiError.badRequest('Path is required for tracking.');
  }

  await recordVisit({
    visitorId,
    userId,
    sessionId,
    path,
    fullUrl,
    referrer,
    userAgent: req.headers['user-agent'],
    ipAddress: extractIpAddress(req),
    locale,
    timezoneOffset,
    durationMs,
    metadata,
  });

  res.status(201).json({
    ok: true,
    visitorId,
    sessionId,
  });
});

const getPageViewSummary = asyncHandler(async (req, res) => {
  const stats = await getPageViewStats({
    start: req.query.start,
    end: req.query.end,
    path: req.query.path,
    limit: req.query.limit,
    timezone: req.query.timezone,
  });

  res.json({
    ok: true,
    count: stats.length,
    results: stats,
  });
});

const getRecentVisitEntries = asyncHandler(async (req, res) => {
  const visits = await getRecentVisits({
    limit: req.query.limit,
    visitorId: req.query.visitorId,
  });

  res.json({
    ok: true,
    count: visits.length,
    results: visits,
  });
});

const getVisitorSummary = asyncHandler(async (req, res) => {
  const stats = await getVisitorStats({
    limit: req.query.limit,
  });

  res.json({
    ok: true,
    count: stats.length,
    results: stats,
  });
});

export {
  trackVisit,
  getPageViewSummary,
  getRecentVisitEntries,
  getVisitorSummary,
};
