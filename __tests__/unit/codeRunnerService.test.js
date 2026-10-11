import { mock, beforeEach, afterAll, describe, test, expect, setSystemTime } from 'bun:test';

// ── module mocks (must be set up before any dynamic imports) ───────────────────

const environment = {
  piston: {
    url: 'https://piston.test:2358',
    token: 'unit-test-token',
    vmResourceId:
      '/subscriptions/x/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm',
    idleMinutes: 30,
    dailyLimitMinutes: 480,
  },
};

mock.module('../../backend/config/environment.js', () => ({ environment, isProduction: false }));

const mockGetVmPowerState = mock(() => Promise.resolve('deallocated'));
const mockStartVm = mock(() => Promise.resolve());
const mockDeallocateVm = mock(() => Promise.resolve());

mock.module('../../backend/utils/azureVmPower.js', () => ({
  getVmPowerState: mockGetVmPowerState,
  startVm: mockStartVm,
  deallocateVm: mockDeallocateVm,
}));

const mockFindRunnerState = mock(() => Promise.resolve(null));
const mockExtendRunnerKeepUntil = mock((key, keepUntil) => Promise.resolve({ key, keepUntil }));
const mockClaimRunnerTick = mock(() => Promise.resolve(null));
const mockAddRunnerUsageMinute = mock(() => Promise.resolve());

mock.module('../../backend/models/index.js', () => ({
  findRunnerState: mockFindRunnerState,
  extendRunnerKeepUntil: mockExtendRunnerKeepUntil,
  claimRunnerTick: mockClaimRunnerTick,
  addRunnerUsageMinute: mockAddRunnerUsageMinute,
}));

const {
  getRunnerStatus,
  requestRunnerSession,
  holdRunner,
  prepareRunnerForSubmission,
  runRunnerStopCheck,
} = await import('../../backend/services/codeRunnerService.js');

// ── helpers ────────────────────────────────────────────────────────────────────

const RUNTIMES = [{ language: 'java' }, { language: 'python' }];
const originalFetch = globalThis.fetch;
const mockFetch = mock(() => Promise.resolve({ ok: true, json: () => Promise.resolve(RUNTIMES) }));

// The service caches the runner state for a few seconds. Each test starts a
// minute after the previous one, so none of them sees another test's state.
let clock = new Date('2026-10-12T08:00:00Z').getTime();
const now = () => new Date(clock);

beforeEach(() => {
  clock += 60000;
  setSystemTime(now());
  globalThis.fetch = mockFetch;
  environment.piston.vmResourceId =
    '/subscriptions/x/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm';
  for (const fn of [
    mockFetch,
    mockGetVmPowerState,
    mockStartVm,
    mockDeallocateVm,
    mockFindRunnerState,
    mockExtendRunnerKeepUntil,
    mockClaimRunnerTick,
    mockAddRunnerUsageMinute,
  ]) {
    fn.mockClear();
  }
  mockFetch.mockImplementation(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(RUNTIMES) }),
  );
  mockGetVmPowerState.mockImplementation(() => Promise.resolve('deallocated'));
  mockStartVm.mockImplementation(() => Promise.resolve());
  mockFindRunnerState.mockImplementation(() => Promise.resolve(null));
  mockClaimRunnerTick.mockImplementation(() => Promise.resolve(null));
});

afterAll(() => {
  setSystemTime();
  globalThis.fetch = originalFetch;
});

// ── getRunnerStatus ────────────────────────────────────────────────────────────

describe('getRunnerStatus', () => {
  test('should report off when the VM is deallocated', async () => {
    const status = await getRunnerStatus();
    expect(status.state).toBe('off');
    expect(status.managed).toBe(true);
  });

  test('should report ready when the VM is running and both runtimes answer', async () => {
    mockGetVmPowerState.mockImplementation(() => Promise.resolve('running'));
    expect((await getRunnerStatus()).state).toBe('ready');
  });

  test('should report starting when the VM is running but Piston is not answering yet', async () => {
    mockGetVmPowerState.mockImplementation(() => Promise.resolve('running'));
    mockFetch.mockImplementation(() => Promise.reject(new Error('ECONNREFUSED')));
    expect((await getRunnerStatus()).state).toBe('starting');
  });

  test('should report starting when a required runtime is missing', async () => {
    mockGetVmPowerState.mockImplementation(() => Promise.resolve('running'));
    mockFetch.mockImplementation(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve([{ language: 'java' }]) }),
    );
    expect((await getRunnerStatus()).state).toBe('starting');
  });

  test('should report stopping while the VM is deallocating', async () => {
    mockGetVmPowerState.mockImplementation(() => Promise.resolve('deallocating'));
    expect((await getRunnerStatus()).state).toBe('stopping');
  });

  test('should report offline, not throw, when Azure cannot be reached', async () => {
    mockGetVmPowerState.mockImplementation(() => Promise.reject(new Error('timeout')));
    expect((await getRunnerStatus()).state).toBe('offline');
  });

  test('should never call Azure when the backend does not control the VM', async () => {
    environment.piston.vmResourceId = undefined;
    mockFetch.mockImplementation(() => Promise.reject(new Error('ECONNREFUSED')));
    const status = await getRunnerStatus();
    expect(status).toMatchObject({ state: 'offline', managed: false });
    expect(mockGetVmPowerState).not.toHaveBeenCalled();
  });
});

// ── requestRunnerSession ───────────────────────────────────────────────────────

describe('requestRunnerSession', () => {
  test('should start the VM and keep it on for the idle window when it is off', async () => {
    const status = await requestRunnerSession();
    expect(mockStartVm).toHaveBeenCalledTimes(1);
    expect(status.state).toBe('starting');
    expect(mockExtendRunnerKeepUntil.mock.calls[0][1]).toEqual(new Date(clock + 30 * 60000));
  });

  test('should not start the VM again when it is already running', async () => {
    mockGetVmPowerState.mockImplementation(() => Promise.resolve('running'));
    const status = await requestRunnerSession();
    expect(status.state).toBe('ready');
    expect(mockStartVm).not.toHaveBeenCalled();
  });

  test('should neither start nor extend once the daily limit is used up', async () => {
    mockFindRunnerState.mockImplementation(() =>
      Promise.resolve({ usageDay: now().toISOString().slice(0, 10), usageMinutes: 480 }),
    );
    const status = await requestRunnerSession();
    expect(status).toMatchObject({ state: 'off', dailyLimitReached: true });
    expect(mockStartVm).not.toHaveBeenCalled();
    expect(mockExtendRunnerKeepUntil).not.toHaveBeenCalled();
  });

  test("should ignore yesterday's usage", async () => {
    mockFindRunnerState.mockImplementation(() =>
      Promise.resolve({ usageDay: '2026-10-11', usageMinutes: 480 }),
    );
    const status = await requestRunnerSession();
    expect(status.dailyLimitReached).toBe(false);
    expect(mockStartVm).toHaveBeenCalledTimes(1);
  });

  test('should report the real state when Azure rejects the start', async () => {
    mockStartVm.mockImplementation(() => Promise.reject(new Error('Conflict')));
    const status = await requestRunnerSession();
    expect(status.state).toBe('off');
  });
});

// ── holdRunner ─────────────────────────────────────────────────────────────────

describe('holdRunner', () => {
  test('should keep the runner on for the requested minutes and start it', async () => {
    const status = await holdRunner({ minutes: 120 });
    expect(mockExtendRunnerKeepUntil.mock.calls[0][1]).toEqual(new Date(clock + 120 * 60000));
    expect(mockStartVm).toHaveBeenCalledTimes(1);
    expect(status.state).toBe('starting');
  });

  test('should reject a hold longer than 4 hours', async () => {
    await expect(holdRunner({ minutes: 241 })).rejects.toMatchObject({ statusCode: 400 });
    expect(mockStartVm).not.toHaveBeenCalled();
  });

  test('should reject unknown fields', async () => {
    await expect(holdRunner({ minutes: 60, force: true })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  test('should refuse with 409 where the backend does not control the VM', async () => {
    environment.piston.vmResourceId = undefined;
    await expect(holdRunner({ minutes: 60 })).rejects.toMatchObject({ statusCode: 409 });
  });
});

// ── prepareRunnerForSubmission ─────────────────────────────────────────────────

describe('prepareRunnerForSubmission', () => {
  test('should resolve when the runner is ready', async () => {
    mockGetVmPowerState.mockImplementation(() => Promise.resolve('running'));
    await expect(prepareRunnerForSubmission()).resolves.toBeUndefined();
  });

  test('should start the runner and answer 409, never a 5xx, when it is off', async () => {
    await expect(prepareRunnerForSubmission()).rejects.toMatchObject({
      statusCode: 409,
      details: { code: 'RUNNER_NOT_READY', runner: { state: 'starting' } },
    });
    expect(mockStartVm).toHaveBeenCalledTimes(1);
  });
});

// ── runRunnerStopCheck ─────────────────────────────────────────────────────────

describe('runRunnerStopCheck', () => {
  const claimTick = (keepUntil) => {
    mockClaimRunnerTick.mockImplementation(() => Promise.resolve({ keepUntil }));
    mockFindRunnerState.mockImplementation(() => Promise.resolve({ keepUntil }));
  };

  test('should do nothing when another replica already has this minute', async () => {
    await runRunnerStopCheck(now());
    expect(mockGetVmPowerState).not.toHaveBeenCalled();
    expect(mockDeallocateVm).not.toHaveBeenCalled();
  });

  test('should deallocate a running VM once keepUntil has passed', async () => {
    claimTick(new Date(clock - 1000));
    mockGetVmPowerState.mockImplementation(() => Promise.resolve('running'));
    await runRunnerStopCheck(now());
    expect(mockDeallocateVm).toHaveBeenCalledTimes(1);
  });

  test('should leave a running VM alone while keepUntil is in the future, and count the minute', async () => {
    claimTick(new Date(clock + 60000));
    mockGetVmPowerState.mockImplementation(() => Promise.resolve('running'));
    await runRunnerStopCheck(now());
    expect(mockDeallocateVm).not.toHaveBeenCalled();
    expect(mockAddRunnerUsageMinute).toHaveBeenCalledTimes(1);
  });

  test('should not stop a VM that a run extended while the check was in flight', async () => {
    mockClaimRunnerTick.mockImplementation(() =>
      Promise.resolve({ keepUntil: new Date(clock - 1000) }),
    );
    mockFindRunnerState.mockImplementation(() =>
      Promise.resolve({ keepUntil: new Date(clock + 30 * 60000) }),
    );
    mockGetVmPowerState.mockImplementation(() => Promise.resolve('running'));
    await runRunnerStopCheck(now());
    expect(mockDeallocateVm).not.toHaveBeenCalled();
  });

  test('should deallocate a VM that is stopped but still allocated', async () => {
    claimTick(new Date(clock - 1000));
    mockGetVmPowerState.mockImplementation(() => Promise.resolve('stopped'));
    await runRunnerStopCheck(now());
    expect(mockDeallocateVm).toHaveBeenCalledTimes(1);
    expect(mockAddRunnerUsageMinute).not.toHaveBeenCalled();
  });

  test('should do nothing when the VM is already deallocated', async () => {
    claimTick(new Date(clock - 1000));
    await runRunnerStopCheck(now());
    expect(mockDeallocateVm).not.toHaveBeenCalled();
    expect(mockAddRunnerUsageMinute).not.toHaveBeenCalled();
  });
});
