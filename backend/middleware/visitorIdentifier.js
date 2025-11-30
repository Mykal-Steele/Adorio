import crypto from 'crypto';
import { isProduction } from '../config/environment.js';
import {
  createVisitorFingerprint,
  createStableVisitorId,
} from '../utils/fingerprinting.js';

const VISITOR_COOKIE_NAME = 'adorio_vid';
const VISITOR_SESSION_HEADER = 'x-adorio-session-id';
const VISITOR_ID_HEADER = 'x-adorio-visitor-id';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 365 * 2; // two years

const generateVisitorId = () => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return crypto.randomBytes(16).toString('hex');
};

const visitorIdentifier = (req, res, next) => {
  const cookies = req.cookies || {};
  const headers = req.headers || {};
  const body = req.body || {};
  const bodyVisitorId = body.visitorId;
  const headerVisitorId = headers[VISITOR_ID_HEADER];

  // Extract fingerprint data from request
  const fingerprintData = body.fingerprint || {};

  // Improved IP extraction with multiple fallbacks
  const extractBestIp = (req) => {
    const potentialIps = [
      req.headers['cf-connecting-ip'],
      req.headers['x-real-ip'],
      req.headers['x-forwarded-for']?.split(',')[0]?.trim(),
      req.headers['x-client-ip'],
      req.connection?.remoteAddress,
      req.socket?.remoteAddress,
      req.ip,
    ].filter(Boolean);

    for (const ip of potentialIps) {
      if (ip) {
        const cleanIp = ip.replace(/^::ffff:/, '');
        if (
          process.env.NODE_ENV === 'production' &&
          (cleanIp === '127.0.0.1' ||
            cleanIp === '::1' ||
            cleanIp === 'localhost')
        ) {
          continue;
        }
        return cleanIp;
      }
    }
    return potentialIps[0] || 'unknown';
  };

  const ipAddress = extractBestIp(req);

  // Create fingerprint
  const fingerprint = createVisitorFingerprint({
    screen: fingerprintData.screen,
    locale: fingerprintData.locale,
    browser: fingerprintData.browser,
    network: fingerprintData.network,
    ipAddress,
    behavior: fingerprintData.behavior,
  });

  let cookieVisitorId =
    cookies[VISITOR_COOKIE_NAME] || headerVisitorId || bodyVisitorId;

  // Create stable visitor ID using cookie and fingerprint
  const stableVisitorId = createStableVisitorId(
    cookieVisitorId,
    fingerprint,
    ipAddress
  );

  // Use stable ID as the primary visitor ID
  let visitorId = stableVisitorId;

  if (!cookieVisitorId) {
    cookieVisitorId = generateVisitorId();
  }

  const visitorSessionId =
    headers[VISITOR_SESSION_HEADER] || body.sessionId || null;

  // Set cookie with the original cookie ID (for consistency)
  if (cookies[VISITOR_COOKIE_NAME] !== cookieVisitorId) {
    res.cookie(VISITOR_COOKIE_NAME, cookieVisitorId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
    });
  }

  req.visitor = {
    id: visitorId, // Use stable fingerprint-based ID
    cookieId: cookieVisitorId, // Keep original cookie ID
    sessionId: visitorSessionId,
    fingerprint,
    fingerprintData,
    ipAddress,
    cookieName: VISITOR_COOKIE_NAME,
  };

  res.locals.visitorId = visitorId;

  next();
};

export default visitorIdentifier;
export { VISITOR_COOKIE_NAME };
