const axios = require('axios');
const { BASE_URL, waitForBackend, makeCredentials } = require('./helpers');

describe('Auth API', () => {
  const creds = makeCredentials();
  const user = {
    ...creds,
    userId: null,
    accessToken: null,
    refreshToken: null,
  };

  beforeAll(async () => {
    await waitForBackend();
  }, 60_000);

  afterAll(async () => {
    if (user.userId && user.accessToken) {
      await axios.delete(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
        validateStatus: null,
      });
    }
  });

  // ── Registration ──────────────────────────────────────────────────────────

  describe('Registration', () => {
    test('register creates a new user and returns access and refresh tokens', async () => {
      const res = await axios.post(`${BASE_URL}/api/users/register`, {
        username: user.username,
        email: user.email,
        password: user.password,
      });
      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('token');
      expect(res.data).toHaveProperty('refreshToken');
      expect(typeof res.data.refreshToken).toBe('string');
      expect(res.data.refreshToken.length).toBeGreaterThan(0);
      expect(res.data.refreshToken).not.toBe(res.data.token);
      expect(res.data).toHaveProperty('user');
      expect(res.data.user.username).toBe(user.username);
      user.userId = res.data.user._id;
      user.accessToken = res.data.token;
      user.refreshToken = res.data.refreshToken;
    });

    test('refresh token issued at registration exchanges for a new access token', async () => {
      const res = await axios.post(`${BASE_URL}/api/users/refresh-token`, {
        refreshToken: user.refreshToken,
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('token');
      expect(typeof res.data.token).toBe('string');
      expect(res.data.token).not.toBe(user.refreshToken);
      user.accessToken = res.data.token;
    });

    test('registering with a duplicate email returns 400', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/users/register`,
        { username: `oth_${Date.now()}`, email: user.email, password: user.password },
        { validateStatus: null },
      );
      expect(res.status).toBe(400);
    });

    test('registering with a duplicate username returns 400', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/users/register`,
        {
          username: user.username,
          email: `oth_${Date.now()}@integration.test`,
          password: user.password,
        },
        { validateStatus: null },
      );
      expect(res.status).toBe(400);
    });

    test('registering with missing fields returns 400', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/users/register`,
        { email: `missing_${Date.now()}@integration.test` },
        { validateStatus: null },
      );
      expect(res.status).toBe(400);
    });
  });

  // ── Login ─────────────────────────────────────────────────────────────────

  describe('Login', () => {
    test('login returns access and refresh tokens', async () => {
      const res = await axios.post(`${BASE_URL}/api/users/login`, {
        email: user.email,
        password: user.password,
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('token');
      expect(res.data).toHaveProperty('refreshToken');
      user.accessToken = res.data.token;
      user.refreshToken = res.data.refreshToken;
    });

    test('login with wrong password returns 401', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/users/login`,
        { email: user.email, password: 'wrong_password' },
        { validateStatus: null },
      );
      expect(res.status).toBe(401);
    });

    test('login with non-existent email returns 401', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/users/login`,
        { email: 'ghost@nowhere.test', password: 'whatever' },
        { validateStatus: null },
      );
      expect(res.status).toBe(401);
    });

    test('login with missing password returns 400', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/users/login`,
        { email: user.email },
        { validateStatus: null },
      );
      expect(res.status).toBe(400);
    });
  });

  // ── Token validation ──────────────────────────────────────────────────────

  describe('Token validation', () => {
    test('GET /api/users/me without token returns 401 with message', async () => {
      const res = await axios.get(`${BASE_URL}/api/users/me`, { validateStatus: null });
      expect(res.status).toBe(401);
      expect(typeof res.data.message).toBe('string');
      expect(res.data.message.length).toBeGreaterThan(0);
    });

    test('GET /api/users/me with valid token returns user without sensitive fields', async () => {
      const res = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      expect(res.status).toBe(200);
      expect(res.data.username).toBe(user.username);
      expect(res.data).not.toHaveProperty('password');
    });

    test('GET /api/users/me with a tampered token returns 4xx', async () => {
      const res = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.tampered.signature' },
        validateStatus: null,
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    test('refresh-token returns a new access token', async () => {
      const res = await axios.post(`${BASE_URL}/api/users/refresh-token`, {
        refreshToken: user.refreshToken,
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('token');
      user.accessToken = res.data.token;
    });

    test('access token from refresh-token authenticates to /users/me', async () => {
      const res = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      expect(res.status).toBe(200);
      expect(res.data.username).toBe(user.username);
    });

    test('refresh-token with an invalid token returns 401', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/users/refresh-token`,
        { refreshToken: 'not.a.valid.jwt' },
        { validateStatus: null },
      );
      expect(res.status).toBe(401);
    });

    test('refresh-token with no body returns 401', async () => {
      const res = await axios.post(
        `${BASE_URL}/api/users/refresh-token`,
        {},
        { validateStatus: null },
      );
      expect(res.status).toBe(401);
    });
  });
});
