import { environment } from '../config/environment.js';

const { siteKey, secretKey } = environment.turnstile;

// Turnstile is optional as a pair: with no keys the check is skipped entirely
// (local dev, CI, the failover copy) and the upload form renders no widget.
export const turnstileConfigured = Boolean(siteKey && secretKey);
export const turnstileSiteKey = siteKey || '';

// Siteverify normally answers in well under a second. Without a limit a stalled call
// would hold the upload request open until the platform timed it out.
const SITEVERIFY_TIMEOUT_MS = 5000;

// Verifies a widget token against Cloudflare's siteverify endpoint. A network
// failure or timeout is treated as a failed check rather than an open door — a bot
// can't use "make verification time out" to get in.
export const verifyTurnstile = async (token, remoteIp) => {
  if (!turnstileConfigured) return true;
  if (!token) return false;

  const body = new URLSearchParams({ secret: secretKey, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
    });
    const data = await res.json();
    return data?.success === true;
  } catch (error) {
    console.error('Turnstile verification failed', { message: error.message });
    return false;
  }
};
