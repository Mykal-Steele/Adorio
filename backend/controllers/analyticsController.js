import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import {
  recordVisit,
  getPageViewStats,
  getRecentVisits,
  getVisitorStats,
  getVisitorDetails,
} from '../services/analyticsService.js';
import {
  monitor,
  rateLimiter,
  validateFingerprint,
  validateVisitorId,
  monitoredFunction,
} from '../utils/monitoring.js';

const extractIpAddress = (req) => {
  const ip =
    req.headers['cf-connecting-ip'] ||
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.ip ||
    req.connection?.remoteAddress ||
    'unknown';
  return ip.replace(/^::ffff:/, '');
};

const trackVisit = asyncHandler(async (req, res) => {
  const startTime = Date.now();
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
    fingerprint,
  } = req.body || {};

  const visitorId = req.visitor?.id || visitorIdFromBody;
  const sessionId = req.visitor?.sessionId || sessionIdFromBody;
  const userId = req.user?.id || userIdFromBody || null;
  const clientIp = extractIpAddress(req);

  if (!rateLimiter.isAllowed(clientIp)) {
    monitor.recordError();
    throw ApiError.tooManyRequests('Too many analytics requests. Please slow down.');
  }

  if (!path) {
    monitor.recordError();
    throw ApiError.badRequest('Path is required for tracking.');
  }

  const visitorValidation = validateVisitorId(visitorId);
  if (!visitorValidation.isValid) {
    monitor.recordError();
    throw ApiError.badRequest(`Invalid visitor ID: ${visitorValidation.error}`);
  }

  if (fingerprint) {
    const fingerprintValidation = validateFingerprint(fingerprint);
    if (!fingerprintValidation.isValid && process.env.NODE_ENV === 'development') {
      console.warn('Invalid fingerprint:', fingerprintValidation.errors);
    }
  }

  const monitoredRecordVisit = monitoredFunction('recordVisit', recordVisit);
  await monitoredRecordVisit({
    visitorId,
    userId,
    sessionId,
    path,
    fullUrl,
    referrer,
    userAgent: req.headers['user-agent'],
    ipAddress: clientIp,
    locale,
    timezoneOffset,
    durationMs,
    metadata,
    fingerprint: req.visitor?.fingerprint || fingerprint,
    fingerprintData: req.visitor?.fingerprintData,
  });

  monitor.recordSuccess();
  res.status(201).json({
    ok: true,
    visitorId,
    sessionId,
    processingTime: Date.now() - startTime,
    remainingRequests: rateLimiter.getRemainingRequests(clientIp),
  });
});

const getPageViewSummary = asyncHandler(async (req, res) => {
  const stats = await getPageViewStats(req.query);
  res.json({ ok: true, count: stats.length, results: stats });
});

const getRecentVisitEntries = asyncHandler(async (req, res) => {
  const visits = await getRecentVisits(req.query);
  res.json({ ok: true, count: visits.length, results: visits });
});

const getVisitorSummary = asyncHandler(async (req, res) => {
  const monitoredGetVisitorStats = monitoredFunction('getVisitorStats', getVisitorStats);
  const stats = await monitoredGetVisitorStats(req.query);
  monitor.recordSuccess();

  res.json({
    ok: true,
    count: stats.length,
    results: stats,
    metadata: {
      deduplicated: req.query.deduplicate !== 'false',
      cached: false,
      generatedAt: new Date().toISOString(),
    },
  });
});

const getHealthStatus = asyncHandler(async (req, res) => {
  const healthStatus = await monitor.performHealthCheck();
  const stats = monitor.getHealthStatus();
  res.status(healthStatus.status === 'healthy' ? 200 : 503).json({
    status: healthStatus.status,
    timestamp: new Date().toISOString(),
    ...stats,
    version: '2.0.1',
    proxy: {
      trustProxy: req.app.get('trust proxy'),
      clientIp: extractIpAddress(req),
      headers: {
        xForwardedFor: req.headers['x-forwarded-for'],
        xRealIp: req.headers['x-real-ip'],
        cfConnectingIp: req.headers['cf-connecting-ip'],
      },
      remoteAddress: req.socket?.remoteAddress,
    },
  });
});

const getSystemStats = asyncHandler(async (req, res) => {
  const stats = monitor.getStats();
  res.json({ ok: true, ...stats, timestamp: new Date().toISOString() });
});

const getVisitorDetailsInfo = asyncHandler(async (req, res) => {
  const { visitorId } = req.params;
  if (!visitorId) throw ApiError.badRequest('Visitor ID is required');

  const visitorValidation = validateVisitorId(visitorId);
  if (!visitorValidation.isValid) {
    throw ApiError.badRequest(`Invalid visitor ID: ${visitorValidation.error}`);
  }

  const monitoredGetVisitorDetails = monitoredFunction('getVisitorDetails', getVisitorDetails);
  const details = await monitoredGetVisitorDetails(visitorId);
  if (!details) throw ApiError.notFound('Visitor not found');

  monitor.recordSuccess();
  res.json({ ok: true, result: details, generatedAt: new Date().toISOString() });
});

export {
  trackVisit,
  getPageViewSummary,
  getRecentVisitEntries,
  getVisitorSummary,
  getVisitorDetailsInfo,
  getHealthStatus,
  getSystemStats,
};
