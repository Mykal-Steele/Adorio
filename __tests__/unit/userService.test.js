import { mock, beforeEach } from 'bun:test';

// ── module mocks (must be set up before any dynamic imports) ───────────────────

const mockHash = mock(() => Promise.resolve('$2b$10$hashed_password'));
const mockCompare = mock(() => Promise.resolve(false));

mock.module('bcryptjs', () => ({
  default: { hash: mockHash, compare: mockCompare },
  hash: mockHash,
  compare: mockCompare,
}));

const mockFindUserByEmailOrUsername = mock(() => Promise.resolve(null));
const mockCreateUser = mock(() =>
  Promise.resolve({
    _id: '507f1f77bcf86cd799439011',
    username: 'alice',
    email: 'alice@b.com',
    password: '$hashed$',
    isAdmin: false,
  }),
);
const mockFindUserByEmail = mock(() => Promise.resolve(null));
const mockFindUserByIdModel = mock(() => Promise.resolve(null));
const mockDeleteUserById = mock(() => Promise.resolve());

mock.module('../../backend/models/index.js', () => ({
  findUserByEmailOrUsername: mockFindUserByEmailOrUsername,
  createUser: mockCreateUser,
  findUserByEmail: mockFindUserByEmail,
  findUserById: mockFindUserByIdModel,
  deleteUserById: mockDeleteUserById,
}));

mock.module('../../backend/config/environment.js', () => ({
  environment: {
    jwtSecret: 'unit-test-secret',
    refreshTokenSecret: 'unit-test-secret',
    port: 3000,
  },
  isProduction: false,
}));

const { sanitizeUser, createUserAccount, authenticateUser } =
  await import('../../backend/services/userService.js');

// ── sanitizeUser ───────────────────────────────────────────────────────────────

describe('sanitizeUser', () => {
  test('returns only the safe fields', () => {
    const user = {
      _id: '123',
      username: 'bob',
      email: 'b@b.com',
      password: 'secret',
      isAdmin: false,
    };
    expect(sanitizeUser(user)).toEqual({
      _id: '123',
      username: 'bob',
      email: 'b@b.com',
      isAdmin: false,
    });
  });

  test('never includes the password field', () => {
    const result = sanitizeUser({
      _id: '1',
      username: 'x',
      email: 'x@x.com',
      password: 'topsecret',
      isAdmin: false,
    });
    expect(result).not.toHaveProperty('password');
  });

  test('preserves isAdmin=true', () => {
    const result = sanitizeUser({
      _id: '1',
      username: 'x',
      email: 'x@x.com',
      password: 'h',
      isAdmin: true,
    });
    expect(result.isAdmin).toBe(true);
  });

  test('defaults isAdmin to false when undefined', () => {
    const result = sanitizeUser({ _id: '1', username: 'x', email: 'x@x.com', password: 'h' });
    expect(result.isAdmin).toBe(false);
  });

  test('does not include extra DB fields like createdAt', () => {
    const result = sanitizeUser({
      _id: '1',
      username: 'x',
      email: 'x@x.com',
      password: 'h',
      isAdmin: false,
      createdAt: new Date(),
    });
    expect(result).not.toHaveProperty('createdAt');
  });
});

// ── createUserAccount ──────────────────────────────────────────────────────────

describe('createUserAccount', () => {
  beforeEach(() => {
    mockFindUserByEmailOrUsername.mockImplementation(() => Promise.resolve(null));
  });

  test('throws 400 for a username shorter than 3 chars', async () => {
    let caught;
    try {
      await createUserAccount({ username: 'ab', email: 'a@b.com', password: 'pass' });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(400);
  });

  test('throws 400 for an invalid email format', async () => {
    let caught;
    try {
      await createUserAccount({ username: 'validuser', email: 'not-email', password: 'pass' });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(400);
  });

  test('throws 400 with "Email" message when email already taken', async () => {
    mockFindUserByEmailOrUsername.mockImplementation(() =>
      Promise.resolve({ email: 'alice@b.com', username: 'other' }),
    );
    let caught;
    try {
      await createUserAccount({ username: 'newuser', email: 'alice@b.com', password: 'pass' });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(400);
    expect(caught?.message).toMatch(/email/i);
  });

  test('throws 400 with "Username" message when username already taken', async () => {
    mockFindUserByEmailOrUsername.mockImplementation(() =>
      Promise.resolve({ email: 'other@b.com', username: 'alice' }),
    );
    let caught;
    try {
      await createUserAccount({ username: 'alice', email: 'new@b.com', password: 'pass' });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(400);
    expect(caught?.message).toMatch(/username/i);
  });

  test('returns a user object without the password field', async () => {
    const result = await createUserAccount({
      username: 'alice',
      email: 'alice@b.com',
      password: 'pass123',
    });
    expect(result).not.toHaveProperty('password');
    expect(result).toHaveProperty('username', 'alice');
    expect(result).toHaveProperty('email', 'alice@b.com');
  });
});

// ── authenticateUser ───────────────────────────────────────────────────────────

describe('authenticateUser', () => {
  const fakeUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'alice',
    email: 'alice@b.com',
    password: '$hashed$',
    isAdmin: false,
  };

  beforeEach(() => {
    mockFindUserByEmail.mockImplementation(() => Promise.resolve(null));
    mockCompare.mockImplementation(() => Promise.resolve(false));
  });

  test('throws 400 when email is empty', async () => {
    let caught;
    try {
      await authenticateUser({ email: '', password: 'pass' });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(400);
  });

  test('throws 400 when password is empty', async () => {
    let caught;
    try {
      await authenticateUser({ email: 'a@b.com', password: '' });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(400);
  });

  test('throws 401 when user does not exist', async () => {
    mockFindUserByEmail.mockImplementation(() => Promise.resolve(null));
    let caught;
    try {
      await authenticateUser({ email: 'ghost@b.com', password: 'pass' });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(401);
  });

  test('throws 401 when password does not match', async () => {
    mockFindUserByEmail.mockImplementation(() => Promise.resolve(fakeUser));
    mockCompare.mockImplementation(() => Promise.resolve(false));
    let caught;
    try {
      await authenticateUser({ email: 'alice@b.com', password: 'wrongpass' });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(401);
  });

  test('returns user and sanitizedUser on correct credentials', async () => {
    mockFindUserByEmail.mockImplementation(() => Promise.resolve(fakeUser));
    mockCompare.mockImplementation(() => Promise.resolve(true));
    const result = await authenticateUser({ email: 'alice@b.com', password: 'correctpass' });
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('sanitizedUser');
    expect(result.sanitizedUser).not.toHaveProperty('password');
  });
});
