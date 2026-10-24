import { describe, test, expect, mock, beforeEach } from 'bun:test';

const mockFindUserById = mock();
const mockCreateSecretEnv = mock();
const mockFindSecretByPasswordHash = mock();
const mockFindSecretByName = mock();
const mockUpsertSecretByName = mock();

mock.module('../../backend/models/index.js', () => ({
  findUserById: mockFindUserById,
  createSecretEnv: mockCreateSecretEnv,
  findSecretByPasswordHash: mockFindSecretByPasswordHash,
  findSecretByName: mockFindSecretByName,
  upsertSecretByName: mockUpsertSecretByName,
}));

process.env.JWT_SECRET = 'test-secret';

const { createSecretMessage, retrieveNamedSecretMessage } =
  await import('../../backend/services/secretEnvService.js');

const user = { _id: 'user-1', email: 'person@example.test' };

beforeEach(() => {
  mockFindUserById.mockReset();
  mockUpsertSecretByName.mockReset();
  mockFindSecretByName.mockReset();

  mockFindUserById.mockImplementation(() => Promise.resolve(user));
  mockUpsertSecretByName.mockImplementation(() => Promise.resolve({}));
});

describe('createSecretMessage with a project name', () => {
  test('stores a v1 envelope and returns the normalized name', async () => {
    const result = await createSecretMessage({
      userId: 'user-1',
      rawBody: {
        name: ' My-Env ',
        message: 'DATABASE_URL=postgres://example',
        password: 'correct horse',
      },
    });

    expect(result).toEqual({ name: 'my-env' });
    expect(mockUpsertSecretByName).toHaveBeenCalledTimes(1);

    const [name, userId, envelope] = mockUpsertSecretByName.mock.calls[0];
    expect(name).toBe('my-env');
    expect(userId).toBe('user-1');
    expect(envelope.startsWith('v1:')).toBe(true);
  });

  test('returns 409 when another user already owns the name', async () => {
    mockUpsertSecretByName.mockImplementation(() => Promise.reject({ code: 11000 }));

    await expect(
      createSecretMessage({
        userId: 'user-1',
        rawBody: { name: 'taken-name', message: 'x', password: 'correct horse' },
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test('rejects invalid names and short passphrases', async () => {
    await expect(
      createSecretMessage({
        userId: 'user-1',
        rawBody: { name: 'Bad Name', message: 'x', password: 'correct horse' },
      }),
    ).rejects.toMatchObject({ statusCode: 400 });

    await expect(
      createSecretMessage({
        userId: 'user-1',
        rawBody: { name: 'good-name', message: 'x', password: 'short' },
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('retrieveNamedSecretMessage', () => {
  test('decrypts with the correct passphrase', async () => {
    await createSecretMessage({
      userId: 'user-1',
      rawBody: { name: 'my-env', message: 'A=1\nB=2', password: 'correct horse' },
    });
    const [, , envelope] = mockUpsertSecretByName.mock.calls[0];
    mockFindSecretByName.mockImplementation(() =>
      Promise.resolve({ encryptedMessage: envelope, userId: 'user-1' }),
    );

    await expect(
      retrieveNamedSecretMessage({ name: 'my-env', passphrase: 'correct horse' }),
    ).resolves.toBe('A=1\nB=2');
  });

  test('returns 404 for a wrong passphrase or unknown name', async () => {
    await createSecretMessage({
      userId: 'user-1',
      rawBody: { name: 'my-env', message: 'A=1', password: 'correct horse' },
    });
    const [, , envelope] = mockUpsertSecretByName.mock.calls[0];
    mockFindSecretByName.mockImplementation(() =>
      Promise.resolve({ encryptedMessage: envelope, userId: 'user-1' }),
    );

    await expect(
      retrieveNamedSecretMessage({ name: 'my-env', passphrase: 'wrong passphrase' }),
    ).rejects.toMatchObject({ statusCode: 404 });

    mockFindSecretByName.mockImplementation(() => Promise.resolve(null));

    await expect(
      retrieveNamedSecretMessage({ name: 'missing-env', passphrase: 'correct horse' }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
