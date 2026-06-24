import { mock } from 'bun:test';
import asyncHandler from '../../backend/utils/asyncHandler.js';

describe('asyncHandler', () => {
  test('calls next(error) when the handler throws synchronously', async () => {
    const error = new Error('boom');
    const next = mock(() => {});
    const handler = asyncHandler(async () => {
      throw error;
    });
    await handler({}, {}, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });

  test('calls next(error) when the handler returns a rejected promise', async () => {
    const error = new Error('async fail');
    const next = mock(() => {});
    const handler = asyncHandler(() => Promise.reject(error));
    await handler({}, {}, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  test('does not call next when the handler resolves successfully', async () => {
    const next = mock(() => {});
    const res = { json: mock(() => {}) };
    const handler = asyncHandler(async (_req, res) => {
      res.json({ ok: true });
    });
    await handler({}, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  test('passes req, res, and next through to the inner handler', async () => {
    const req = { body: { test: 1 } };
    const res = { json: mock(() => {}) };
    const next = mock(() => {});
    let received;
    const handler = asyncHandler(async (req, res, next) => {
      received = { req, res, next };
    });
    await handler(req, res, next);
    expect(received.req).toBe(req);
    expect(received.res).toBe(res);
    expect(received.next).toBe(next);
  });

  test('wraps a non-async function without breaking it', async () => {
    const next = mock(() => {});
    const res = { send: mock(() => {}) };
    const handler = asyncHandler((_req, res) => {
      res.send('ok');
    });
    await handler({}, res, next);
    expect(res.send).toHaveBeenCalledWith('ok');
    expect(next).not.toHaveBeenCalled();
  });
});
