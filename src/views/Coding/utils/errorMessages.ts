// Known-flaky failure modes that aren't the user's fault, a JWT clock-skew
// hiccup, or the Piston sandbox getting SIGKILL'd under load (autoscaling
// cold start, host memory pressure). Both clear up on their own; there's no
// code-side fix yet, so just point people at the workaround instead of
// leaving them staring at a raw stack-trace-looking message.
const FLAKY_PATTERNS = [/token is not valid/i, /terminated by signal/i, /sigkill/i];

const FRIENDLY_NOTE =
  "It does that sometimes, I'll fix it later. Try running again or refreshing the page.";

export const withFriendlyRetryNote = (message: string | undefined | null): string | undefined => {
  if (!message) return message ?? undefined;
  if (!FLAKY_PATTERNS.some((pattern) => pattern.test(message))) return message;
  return `${message}\n\n${FRIENDLY_NOTE}`;
};
