import { environment } from '../config/environment.js';

const { siteKey, secretKey } = environment.turnstile;

// Needs both keys. Without them the check is skipped (local dev, CI, the
// failover copy) and the upload form shows no widget.
export const turnstileConfigured = Boolean(siteKey && secretKey);
export const turnstileSiteKey = siteKey || '';

// siteverify usually answers in well under a second. Without a limit a stalled call
// holds the upload request open until the platform times it out.
const SITEVERIFY_TIMEOUT_MS = 5000;

// A network error or timeout counts as a failed check, so a bot can't get in by
// making verification time out.
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
