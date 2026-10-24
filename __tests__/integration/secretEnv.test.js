const axios = require('axios');
const { BASE_URL, waitForBackend, makeCredentials } = require('./helpers');

describe('SecretEnv API', () => {
  const creds = makeCredentials();
  const user = { ...creds, userId: null, accessToken: null };
  const name = `it-env-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const message = 'DATABASE_URL=postgres://integration\nSECOND=line';
  const passphrase = 'integration test passphrase';

  const getText = (url, pass) =>
    axios.get(url, {
      headers: { Authorization: `Bearer ${pass}` },
      responseType: 'text',
      transformResponse: [(data) => data],
    });

  beforeAll(async () => {
    await waitForBackend();
    const res = await axios.post(`${BASE_URL}/api/users/register`, {
      username: user.username,
      email: user.email,
      password: user.password,
    });
    user.userId = res.data.user._id;
    user.accessToken = res.data.token;
  }, 60_000);

  afterAll(async () => {
    if (user.userId && user.accessToken) {
      await axios.delete(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
        validateStatus: null,
      });
    }
  });

  test('requires an Authorization header for named retrieval', async () => {
    const res = await axios.get(`${BASE_URL}/api/secretenv/${name}`, {
      validateStatus: null,
    });
    expect(res.status).toBe(401);
  });

  test('stores and retrieves a named env with a bearer passphrase', async () => {
    const store = await axios.post(
      `${BASE_URL}/api/secretenv`,
      { name, message, password: passphrase },
      { headers: { Authorization: `Bearer ${user.accessToken}` } },
    );

    expect(store.status).toBe(201);
    expect(store.data.name).toBe(name);
    expect(store.data.retrievalCommand).toContain('env.adorio.space');

    const queryGet = await getText(`${BASE_URL}/api/secretenv?name=${name}`, passphrase);
    expect(queryGet.status).toBe(200);
    expect(queryGet.headers['cache-control']).toBe('no-store');
    expect(queryGet.data).toBe(message);

    const pathGet = await getText(`${BASE_URL}/api/secretenv/${name}`, passphrase);
    expect(pathGet.status).toBe(200);
    expect(pathGet.data).toBe(message);
  });

  test('returns 404 for a wrong passphrase', async () => {
    const res = await axios.get(`${BASE_URL}/api/secretenv?name=${name}`, {
      headers: { Authorization: 'Bearer wrong passphrase' },
      validateStatus: null,
    });
    expect(res.status).toBe(404);
  });
});
