import { describe, test, expect, mock } from 'bun:test';

// R2 keys present but no public URL, Turnstile on
mock.module('../../backend/config/environment.js', () => ({
  environment: {
    r2: {
      accountId: 'acct',
      accessKeyId: 'key',
      secretAccessKey: 'secret',
      bucket: 'bucket',
      publicUrl: undefined,
    },
    turnstile: { siteKey: 'site', secretKey: 'turnstile-secret' },
  },
}));

// The service imports all of these; only the storage ones matter here
const noop = async () => null;
mock.module('../../backend/models/index.js', () => ({
  createHostedFile: noop,
  findHostedFileBySlug: noop,
  findHostedFilesByUserId: noop,
  findStalePendingHostedFiles: async () => [],
  deleteHostedFileBySlug: noop,
  deletePendingHostedFile: noop,
  incrementFileViews: noop,
  markHostedFileConfirmed: noop,
  findAllHostedFiles: noop,
  slugExists: noop,
  reserveStorage: noop,
  releaseStorage: noop,
  storageLedgerExists: async () => true,
  initStorageLedger: async () => {},
  sumHostedR2Bytes: async () => 0,
  getStorageTotal: async () => 0,
}));

const r2 = await import('../../backend/utils/r2.js');
const { getStorageUsage } = await import('../../backend/services/hostedFileService.js');
const { verifyTurnstile } = await import('../../backend/utils/turnstile.js');

describe('R2 config', () => {
  test('should not count as configured without a public URL to send visitors to', () => {
    expect(r2.r2Configured).toBe(false);
  });

  // The failover worker reads 5xx as the backend being down
  test('should answer 409, not 500, when hosting is not configured', async () => {
    let caught;
    try {
      await r2.headObject('h/x.pdf');
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(409);
    expect(caught?.details?.code).toBe('HOSTING_NOT_CONFIGURED');
  });
});

describe('getStorageUsage', () => {
  // So the page can say uploads are off instead of letting someone pick a file first
  test('should tell the page uploads are off when R2 is not set up', async () => {
    const usage = await getStorageUsage();
    expect(usage.uploadsEnabled).toBe(false);
  });
});

describe('verifyTurnstile', () => {
  test('should give up on a siteverify call that hangs instead of holding the request', async () => {
    const realFetch = globalThis.fetch;
    let signal;
    globalThis.fetch = (_url, init) => {
      signal = init?.signal;
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      });
    };
    try {
      const result = await verifyTurnstile('token', '1.2.3.4');
      expect(signal).toBeDefined();
      expect(result).toBe(false);
    } finally {
      globalThis.fetch = realFetch;
    }
  }, 15000);
});
