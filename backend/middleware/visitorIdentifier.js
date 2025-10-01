import crypto from 'crypto';
import { isProduction } from '../config/environment.js';

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
  const bodyVisitorId = req.body?.visitorId;
  const headerVisitorId = headers[VISITOR_ID_HEADER];

  let visitorId =
    cookies[VISITOR_COOKIE_NAME] || headerVisitorId || bodyVisitorId;

  if (!visitorId) {
    visitorId = generateVisitorId();
  }

  const visitorSessionId =
    headers[VISITOR_SESSION_HEADER] || req.body?.sessionId || null;

  if (cookies[VISITOR_COOKIE_NAME] !== visitorId) {
    res.cookie(VISITOR_COOKIE_NAME, visitorId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
    });
  }

  req.visitor = {
    id: visitorId,
    sessionId: visitorSessionId,
    cookieName: VISITOR_COOKIE_NAME,
  };

  res.locals.visitorId = visitorId;

  next();
};

export default visitorIdentifier;
export { VISITOR_COOKIE_NAME };
