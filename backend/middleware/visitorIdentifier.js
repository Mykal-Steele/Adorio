import crypto from 'crypto';
import { isProduction } from '../config/environment.js';
import { createVisitorFingerprint, createStableVisitorId } from '../utils/fingerprinting.js';

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

  const fingerprintData = body.fingerprint || {};

  // trust proxy already resolves req.ip
  const ipAddress = req.ip || 'unknown';

  const fingerprint = createVisitorFingerprint({
    screen: fingerprintData.screen,
    locale: fingerprintData.locale,
    browser: fingerprintData.browser,
    network: fingerprintData.network,
    ipAddress,
    behavior: fingerprintData.behavior,
  });

  let cookieVisitorId = cookies[VISITOR_COOKIE_NAME] || headerVisitorId || bodyVisitorId;

  const stableVisitorId = createStableVisitorId(cookieVisitorId, fingerprint, ipAddress);

  let visitorId = stableVisitorId;

  if (!cookieVisitorId) {
    cookieVisitorId = generateVisitorId();
  }

  const visitorSessionId = headers[VISITOR_SESSION_HEADER] || body.sessionId || null;

  if (cookies[VISITOR_COOKIE_NAME] !== cookieVisitorId) {
    res.cookie(VISITOR_COOKIE_NAME, cookieVisitorId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
    });
  }

  req.visitor = {
    id: visitorId,
    cookieId: cookieVisitorId,
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
