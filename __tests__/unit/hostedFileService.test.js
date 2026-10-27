import { describe, test, expect, mock, beforeEach } from 'bun:test';

const MB = 1024 * 1024;

const models = {
  createHostedFile: mock(async (data) => ({ ...data, _id: 'f1' })),
  findHostedFileBySlug: mock(async () => null),
  findHostedFilesByUserId: mock(async () => []),
  findStalePendingHostedFiles: mock(async () => []),
  deleteHostedFileBySlug: mock(async () => null),
  deletePendingHostedFile: mock(async () => null),
  incrementFileViews: mock(async () => {}),
  markHostedFileConfirmed: mock(async () => null),
  findAllHostedFiles: mock(async () => []),
  slugExists: mock(async () => false),
  sumHostedR2Bytes: mock(async () => 0),
  storageLedgerExists: mock(async () => true),
  initStorageLedger: mock(async () => {}),
  reserveStorage: mock(async () => ({ totalBytes: 1 })),
  releaseStorage: mock(async () => {}),
  getStorageTotal: mock(async () => 0),
};
mock.module('../../backend/models/index.js', () => models);

const r2 = {
  r2Configured: true,
  createUploadUrl: mock(async () => 'https://r2.example/upload'),
  headObject: mock(async () => ({ ContentLength: 1000 })),
  deleteObject: mock(async () => {}),
  setObjectCacheControl: mock(async () => {}),
  publicUrlFor: (key) => `https://files.example/${key}`,
};
mock.module('../../backend/utils/r2.js', () => r2);

mock.module('../../backend/utils/turnstile.js', () => ({
  verifyTurnstile: async () => true,
  turnstileSiteKey: '',
}));

const { presignUpload, confirmUpload, getFileTarget, removeFile } =
  await import('../../backend/services/hostedFileService.js');

const pendingFile = (overrides = {}) => ({
  _id: 'f1',
  slug: 'report',
  userId: { toString: () => 'u1' },
  originalFilename: 'report.pdf',
  contentType: 'application/pdf',
  size: 1000,
  r2Key: 'h/report.pdf',
  pending: true,
  toObject() {
    return { ...this };
  },
  ...overrides,
});

beforeEach(() => {
  for (const fn of [
    ...Object.values(models),
    r2.createUploadUrl,
    r2.headObject,
    r2.deleteObject,
    r2.setObjectCacheControl,
  ]) {
    if (typeof fn?.mockClear === 'function') fn.mockClear();
  }
  models.reserveStorage.mockImplementation(async () => ({ totalBytes: 1 }));
  models.findStalePendingHostedFiles.mockImplementation(async () => []);
  r2.headObject.mockImplementation(async () => ({ ContentLength: 1000 }));
  r2.deleteObject.mockImplementation(async () => {});
});

const statusOf = async (promise) => {
  try {
    await promise;
    return 'resolved';
  } catch (e) {
    return e.statusCode;
  }
};

describe('presignUpload', () => {
  test('should keep uploads under their own prefix so they cannot overwrite other files in the bucket', async () => {
    await presignUpload({
      userId: 'u1',
      rawBody: { filename: 'learn-korean.html', contentType: 'text/html', size: 1000 },
    });
    const { key } = r2.createUploadUrl.mock.calls.at(-1)[0];
    expect(key.startsWith('h/')).toBe(true);
  });

  test('should only release a stale upload when the sweep actually removed it', async () => {
    models.findStalePendingHostedFiles.mockImplementation(async () => [
      { slug: 'gone', r2Key: 'h/gone.pdf', size: 500 },
    ]);
    // Confirmed between the lookup and the delete, so there is nothing to remove
    models.deletePendingHostedFile.mockImplementation(async () => null);
    await presignUpload({
      userId: 'u1',
      rawBody: { filename: 'a.pdf', contentType: 'application/pdf', size: 1000 },
    });
    expect(models.releaseStorage.mock.calls.some(([bytes]) => bytes === 500)).toBe(false);
  });
});

describe('confirmUpload', () => {
  test('should not touch the ledger when another request already confirmed the upload', async () => {
    models.findHostedFileBySlug.mockImplementation(async () => pendingFile());
    r2.headObject.mockImplementation(async () => ({ ContentLength: 600 }));
    models.markHostedFileConfirmed.mockImplementation(async () => null);
    await confirmUpload({ userId: 'u1', rawBody: { slug: 'report' } });
    expect(models.releaseStorage).not.toHaveBeenCalled();
    expect(models.reserveStorage).not.toHaveBeenCalled();
  });

  test('should give back extra bytes it reserved when it loses the confirm race', async () => {
    models.findHostedFileBySlug.mockImplementation(async () => pendingFile());
    r2.headObject.mockImplementation(async () => ({ ContentLength: 1500 }));
    models.markHostedFileConfirmed.mockImplementation(async () => null);
    await confirmUpload({ userId: 'u1', rawBody: { slug: 'report' } });
    const reserved = models.reserveStorage.mock.calls.map(([b]) => b).reduce((a, b) => a + b, 0);
    const released = models.releaseStorage.mock.calls.map(([b]) => b).reduce((a, b) => a + b, 0);
    expect(reserved).toBe(released);
  });

  // Cloudflare caches files.adorio.space. Without a short max-age a deleted file stays
  // downloadable from the cache for the default two hours.
  test('should give the object a short cache lifetime before publishing it', async () => {
    const order = [];
    models.findHostedFileBySlug.mockImplementation(async () => pendingFile());
    r2.setObjectCacheControl.mockImplementation(async (...args) => order.push(['cache', ...args]));
    models.markHostedFileConfirmed.mockImplementation(async () => {
      order.push(['confirm']);
      return pendingFile({ pending: false });
    });
    await confirmUpload({ userId: 'u1', rawBody: { slug: 'report' } });
    expect(order[0]).toEqual(['cache', 'h/report.pdf', 'application/pdf']);
    expect(order[1]).toEqual(['confirm']);
  });

  test('should reject and remove an object bigger than the 100 MB limit', async () => {
    models.findHostedFileBySlug.mockImplementation(async () => pendingFile());
    models.deletePendingHostedFile.mockImplementation(async () => pendingFile());
    r2.headObject.mockImplementation(async () => ({ ContentLength: 150 * MB }));
    expect(await statusOf(confirmUpload({ userId: 'u1', rawBody: { slug: 'report' } }))).toBe(400);
    expect(r2.deleteObject).toHaveBeenCalledWith('h/report.pdf');
    expect(models.releaseStorage).toHaveBeenCalledWith(1000);
    expect(models.markHostedFileConfirmed).not.toHaveBeenCalled();
  });
});

describe('getFileTarget', () => {
  test('should not serve or count an upload that was never confirmed', async () => {
    models.findHostedFileBySlug.mockImplementation(async () => pendingFile());
    expect(await statusOf(getFileTarget('report'))).toBe(404);
    expect(models.incrementFileViews).not.toHaveBeenCalled();
  });
});

describe('removeFile', () => {
  test('should release storage only when this request deleted the record', async () => {
    models.findHostedFileBySlug.mockImplementation(async () => pendingFile({ pending: false }));
    // A concurrent delete got there first
    models.deleteHostedFileBySlug.mockImplementation(async () => null);
    await removeFile({ slug: 'report', userId: 'u1', isAdmin: false });
    expect(models.releaseStorage).not.toHaveBeenCalled();
  });

  test('should keep the record and its storage when the R2 delete fails', async () => {
    models.findHostedFileBySlug.mockImplementation(async () => pendingFile({ pending: false }));
    r2.deleteObject.mockImplementation(async () => {
      throw new Error('R2 down');
    });
    expect(await statusOf(removeFile({ slug: 'report', userId: 'u1', isAdmin: false }))).not.toBe(
      'resolved',
    );
    expect(models.deleteHostedFileBySlug).not.toHaveBeenCalled();
    expect(models.releaseStorage).not.toHaveBeenCalled();
  });
});
