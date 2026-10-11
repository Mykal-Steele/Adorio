import ApiError from '../utils/ApiError.js';
import validate from '../utils/validate.js';
import { codeRunnerHoldSchema } from '../schemas/index.js';
import { environment } from '../config/environment.js';
import { deallocateVm, getVmPowerState, startVm } from '../utils/azureVmPower.js';
import {
  addRunnerUsageMinute,
  claimRunnerTick,
  extendRunnerKeepUntil,
  findRunnerState,
  markRunnerReady,
  markRunnerStartRequested,
} from '../models/index.js';

// The Piston VM is deallocated whenever nobody is running code, because a
// deallocated VM costs nothing for compute. This service decides when it is
// on: any run (or opening a practice page) keeps it on for PISTON_IDLE_MINUTES
// more, an admin can hold it on for a class, and a check every minute turns
// it off once that time has passed.
//
// Two modes. Where PISTON_VM_RESOURCE_ID is set (the Azure Container App) the
// backend controls the VM. Everywhere else (local dev, CI, the Northflank
// failover copy) it cannot, so it only reports whether Piston answers.
const RUNNER_KEY = 'piston';
const REQUIRED_RUNTIMES = ['java', 'python'];
const PROBE_TIMEOUT_MS = 1500;
const STATE_CACHE_MS = 3000;
const STOP_CHECK_INTERVAL_MS = 60000;

const NOT_READY_MESSAGES = {
  starting:
    'The code runner is starting up. It takes about 30 seconds, then you can run your code.',
  stopping: 'The code runner is restarting. Try again in a minute.',
  off: 'The code runner could not be started. Try again in a minute.',
  offline:
    'The code runner is offline right now because the main server is in maintenance. Please try again later.',
};
const DAILY_LIMIT_MESSAGE =
  'The code runner has reached its limit for today. It will be back tomorrow.';

export const isRunnerManaged = () => Boolean(environment.piston.vmResourceId);

// One JSON object per line, all tagged scope "code-runner", so the whole life
// of the runner can be pulled out of the Container App logs with one filter
// and charted: how often it starts, what triggered it, how long a start takes,
// how long it stays on, and every time someone was told to wait.
const logRunnerEvent = (event, fields = {}) => {
  console.info(JSON.stringify({ scope: 'code-runner', event, ...fields }));
};
const logRunnerError = (event, error, fields = {}) => {
  console.error(
    JSON.stringify({
      scope: 'code-runner',
      event,
      level: 'error',
      message: error.message,
      ...fields,
    }),
  );
};
const secondsBetween = (from, to) => Math.round((to.getTime() - from.getTime()) / 1000);

const utcDay = (date) => date.toISOString().slice(0, 10);
const minutesFrom = (date, minutes) => new Date(date.getTime() + minutes * 60000);

const isDailyLimitReached = (doc, now) =>
  doc?.usageDay === utcDay(now) && doc.usageMinutes >= environment.piston.dailyLimitMinutes;

// A running VM is not a ready runner: after a start, Docker and Piston need a
// while longer before both runtimes answer. Any failure here just means "not
// yet", so it is reported as false rather than thrown.
const pistonHasRuntimes = async () => {
  if (!environment.piston.url) return false;
  try {
    const res = await fetch(`${environment.piston.url}/api/v2/runtimes`, {
      headers: { 'X-Auth-Token': environment.piston.token },
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    if (!res.ok) return false;
    const runtimes = await res.json();
    return REQUIRED_RUNTIMES.every((language) => runtimes.some((r) => r.language === language));
  } catch {
    return false;
  }
};

const readRunnerState = async () => {
  if (!isRunnerManaged()) return (await pistonHasRuntimes()) ? 'ready' : 'offline';

  let power;
  try {
    power = await getVmPowerState();
  } catch (error) {
    logRunnerError('power_state_failed', error);
    return 'offline';
  }
  if (power === 'running') return (await pistonHasRuntimes()) ? 'ready' : 'starting';
  if (power === 'starting') return 'starting';
  if (power === 'stopping' || power === 'deallocating') return 'stopping';
  return 'off';
};

// Everyone waiting on a start polls this, and every run checks it. A short
// shared cache keeps that from turning into one Azure call per request.
let stateCache = { at: 0, promise: null };
const setCachedState = (state) => {
  stateCache = { at: Date.now(), promise: Promise.resolve(state) };
};
const getRunnerState = () => {
  if (!stateCache.promise || Date.now() - stateCache.at >= STATE_CACHE_MS) {
    stateCache = { at: Date.now(), promise: readRunnerState() };
  }
  return stateCache.promise;
};

// `cause` says who or what wanted the runner: { trigger: 'session' | 'run' |
// 'hold', userId }. It is only used for the log line.
const startIfOff = async (cause) => {
  const state = await getRunnerState();
  if (state !== 'off') return state;
  const requestedAt = new Date();
  try {
    await startVm();
  } catch (error) {
    // Usually two people asking at the same moment: Azure rejects the second
    // start while the first is in progress. Report whatever is true now.
    logRunnerError('start_failed', error, cause);
    stateCache = { at: 0, promise: null };
    return getRunnerState();
  }
  await markRunnerStartRequested(RUNNER_KEY, requestedAt);
  logRunnerEvent('start_requested', cause);
  setCachedState('starting');
  return 'starting';
};

// Logs how long the start took, the first time anyone sees the runner ready.
const noteIfJustReady = async (state, doc, now) => {
  if (state !== 'ready' || !doc?.lastStartAt || doc.lastReadyAt) return;
  const first = await markRunnerReady(RUNNER_KEY, now);
  if (first) logRunnerEvent('ready', { startupSeconds: secondsBetween(first.lastStartAt, now) });
};

const buildStatus = (state, doc, now) => ({
  state,
  managed: isRunnerManaged(),
  keepUntil: doc?.keepUntil ?? null,
  dailyLimitReached: isDailyLimitReached(doc, now),
});

export const getRunnerStatus = async () => {
  const [state, doc] = await Promise.all([
    getRunnerState(),
    isRunnerManaged() ? findRunnerState(RUNNER_KEY) : null,
  ]);
  const now = new Date();
  await noteIfJustReady(state, doc, now);
  return buildStatus(state, doc, now);
};

// Keeps the runner on for another idle window and starts it if it is off.
// Once the day's limit is used up this stops extending and stops starting,
// which is what caps the cost of someone (or some script) keeping it awake.
const keepRunnerWarm = async (cause) => {
  const now = new Date();
  const doc = await findRunnerState(RUNNER_KEY);
  if (isDailyLimitReached(doc, now)) {
    logRunnerEvent('daily_limit_blocked', { ...cause, usageMinutes: doc.usageMinutes });
    return buildStatus(await getRunnerState(), doc, now);
  }

  const extended = await extendRunnerKeepUntil(
    RUNNER_KEY,
    minutesFrom(now, environment.piston.idleMinutes),
  );
  const state = await startIfOff(cause);
  await noteIfJustReady(state, extended, now);
  return buildStatus(state, extended, now);
};

export const requestRunnerSession = (userId, trigger = 'session') =>
  isRunnerManaged() ? keepRunnerWarm({ trigger, userId }) : getRunnerStatus();

// Admin only (enforced at the route). Not subject to the daily limit: holding
// the runner on for a class is a deliberate choice, not background usage.
export const holdRunner = async (userId, rawBody) => {
  const { minutes } = validate(codeRunnerHoldSchema, rawBody);
  if (!isRunnerManaged()) {
    throw ApiError.conflict('This server cannot start or stop the code runner');
  }
  const now = new Date();
  const extended = await extendRunnerKeepUntil(RUNNER_KEY, minutesFrom(now, minutes));
  logRunnerEvent('hold', { userId, minutes, keepUntil: extended.keepUntil });
  return buildStatus(await startIfOff({ trigger: 'hold', userId }), extended, now);
};

// Called before every submission. A 409 (not a 5xx) on purpose: the Cloudflare
// failover worker counts any 5xx from this backend as the primary being down,
// and "the runner is still booting" must never fail the whole site over.
export const prepareRunnerForSubmission = async (userId) => {
  const status = await requestRunnerSession(userId, 'run');
  if (status.state === 'ready') return;
  logRunnerEvent('run_rejected', {
    userId,
    state: status.state,
    dailyLimitReached: status.dailyLimitReached,
  });
  const message = status.dailyLimitReached ? DAILY_LIMIT_MESSAGE : NOT_READY_MESSAGES[status.state];
  throw ApiError.conflict(message, {
    code: 'RUNNER_NOT_READY',
    runner: status,
  });
};

// The stop check can only claim a tick on a document that exists, and none
// does until someone first starts the runner through this backend. Creating
// it here (with a keepUntil in the past) means a VM that was started some
// other way, such as from the Azure portal, still gets turned off.
let stateDocumentEnsured = false;
const ensureStateDocument = async () => {
  if (stateDocumentEnsured) return;
  await extendRunnerKeepUntil(RUNNER_KEY, new Date(0));
  stateDocumentEnsured = true;
};

export const runRunnerStopCheck = async (now = new Date()) => {
  await ensureStateDocument();
  const claimed = await claimRunnerTick(RUNNER_KEY, Math.floor(now.getTime() / 60000));
  if (!claimed) return;

  const power = await getVmPowerState();
  if (power === 'running' || power === 'starting') {
    await addRunnerUsageMinute(RUNNER_KEY, utcDay(now));
  }
  // "stopped" is included: an OS-level shutdown leaves the VM allocated and
  // billed until it is deallocated.
  if (power !== 'running' && power !== 'stopped') return;

  // Read again right before acting, so a run that arrived while Azure was
  // answering above is not cut off.
  const latest = await findRunnerState(RUNNER_KEY);
  if (latest.keepUntil > new Date()) return;

  await deallocateVm();
  setCachedState('stopping');
  logRunnerEvent('stopped', {
    reason: 'idle',
    powerState: power,
    keepUntil: latest.keepUntil,
    onSeconds: latest.lastStartAt ? secondsBetween(latest.lastStartAt, now) : null,
    usageDay: latest.usageDay,
    usageMinutes: latest.usageMinutes,
  });
};

export const startRunnerStopChecks = () => {
  if (!isRunnerManaged()) return;
  const timer = setInterval(() => {
    runRunnerStopCheck().catch((error) => logRunnerError('stop_check_failed', error));
  }, STOP_CHECK_INTERVAL_MS);
  timer.unref();
};
