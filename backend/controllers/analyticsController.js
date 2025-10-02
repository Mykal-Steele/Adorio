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
  // Try multiple headers in order of preference
  const potentialIps = [
    // Cloudflare
    req.headers['cf-connecting-ip'],
    // Standard proxy headers
    req.headers['x-real-ip'],
    req.headers['x-forwarded-for']?.split(',')[0]?.trim(),
    // AWS load balancer
    req.headers['x-client-ip'],
    // Other common headers
    req.headers['x-cluster-client-ip'],
    req.headers['x-forwarded'],
    req.headers['forwarded-for'],
    req.headers['forwarded'],
    // Direct connection
    req.connection?.remoteAddress,
    req.socket?.remoteAddress,
    req.ip,
  ].filter(Boolean);

  for (const ip of potentialIps) {
    if (ip) {
      // Clean up IPv6-mapped IPv4 addresses (::ffff:192.168.1.1 -> 192.168.1.1)
      const cleanIp = ip.replace(/^::ffff:/, '');

      // Skip localhost addresses in production
      if (process.env.NODE_ENV === 'production') {
        if (
          cleanIp === '127.0.0.1' ||
          cleanIp === '::1' ||
          cleanIp === 'localhost'
        ) {
          continue;
        }
      }

      // Return the first valid IP
      if (isValidIp(cleanIp)) {
        return cleanIp;
      }
    }
  }

  // Fallback: return raw IP even if it's localhost (for development)
  return potentialIps[0] || 'unknown';
};

// Helper function to validate IP addresses
const isValidIp = (ip) => {
  if (!ip || typeof ip !== 'string') return false;

  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 regex (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

  if (ipv4Regex.test(ip)) {
    // Validate IPv4 octets are 0-255
    const octets = ip.split('.');
    return octets.every((octet) => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  if (ipv6Regex.test(ip)) {
    return true;
  }

  return false;
};

const trackVisit = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  try {
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

    // Rate limiting
    if (!rateLimiter.isAllowed(clientIp)) {
      monitor.recordError();
      throw ApiError.tooManyRequests(
        'Too many analytics requests. Please slow down.'
      );
    }

    // Validation
    if (!path) {
      monitor.recordError();
      throw ApiError.badRequest('Path is required for tracking.');
    }

    const visitorValidation = validateVisitorId(visitorId);
    if (!visitorValidation.isValid) {
      monitor.recordError();
      throw ApiError.badRequest(
        `Invalid visitor ID: ${visitorValidation.error}`
      );
    }

    // Validate fingerprint if provided
    if (fingerprint) {
      const fingerprintValidation = validateFingerprint(fingerprint);
      if (!fingerprintValidation.isValid) {
        // Log but don't fail - fingerprint is optional
        if (process.env.NODE_ENV === 'development') {
          console.warn('Invalid fingerprint:', fingerprintValidation.errors);
        }
      }
    }

    // Record visit with monitoring
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
  } catch (error) {
    monitor.recordError();
    throw error;
  }
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
  const monitoredGetVisitorStats = monitoredFunction(
    'getVisitorStats',
    getVisitorStats
  );

  const stats = await monitoredGetVisitorStats({
    limit: req.query.limit,
    deduplicate: req.query.deduplicate !== 'false', // Default to true
  });

  monitor.recordSuccess();

  res.json({
    ok: true,
    count: stats.length,
    results: stats,
    metadata: {
      deduplicated: req.query.deduplicate !== 'false',
      cached: false, // Could implement caching later
      generatedAt: new Date().toISOString(),
    },
  });
});

// Health check endpoint
const getHealthStatus = asyncHandler(async (req, res) => {
  const healthStatus = await monitor.performHealthCheck();
  const stats = monitor.getHealthStatus();

  res.status(healthStatus.status === 'healthy' ? 200 : 503).json({
    status: healthStatus.status,
    timestamp: new Date().toISOString(),
    ...stats,
    version: '2.0.0',
  });
});

// Analytics system stats endpoint
const getSystemStats = asyncHandler(async (req, res) => {
  const stats = monitor.getStats();

  res.json({
    ok: true,
    ...stats,
    timestamp: new Date().toISOString(),
  });
});

// Get detailed information about a specific visitor
const getVisitorDetailsInfo = asyncHandler(async (req, res) => {
  const { visitorId } = req.params;

  if (!visitorId) {
    throw ApiError.badRequest('Visitor ID is required');
  }

  const visitorValidation = validateVisitorId(visitorId);
  if (!visitorValidation.isValid) {
    throw ApiError.badRequest(`Invalid visitor ID: ${visitorValidation.error}`);
  }

  const monitoredGetVisitorDetails = monitoredFunction(
    'getVisitorDetails',
    getVisitorDetails
  );

  const details = await monitoredGetVisitorDetails(visitorId);

  if (!details) {
    throw ApiError.notFound('Visitor not found');
  }

  monitor.recordSuccess();

  res.json({
    ok: true,
    result: details,
    generatedAt: new Date().toISOString(),
  });
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
