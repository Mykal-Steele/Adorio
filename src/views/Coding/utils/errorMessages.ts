// Flaky failures that aren't the user's fault, like Piston getting SIGKILL'd
// under load (cold start, memory pressure). They go away on retry and there's
// no fix yet, so add a note instead of a scary raw message. Expired tokens
// used to be here too, the refresh interceptor in src/api/index.ts covers them now.
const FLAKY_PATTERNS = [/terminated by signal/i, /sigkill/i];

const FRIENDLY_NOTE =
  'Something went wrong while running your code. Try again, or refresh the page.';

export const withFriendlyRetryNote = (message: string | undefined | null): string | undefined => {
  if (!message) return message ?? undefined;
  if (!FLAKY_PATTERNS.some((pattern) => pattern.test(message))) return message;
  return `${message}\n\n${FRIENDLY_NOTE}`;
};
