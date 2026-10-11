const axios = require('axios');
const { BASE_URL, waitForBackend, makeCredentials } = require('./helpers');

// The test stack never sets PISTON_VM_RESOURCE_ID, so the backend here can
// report on the code runner but not start or stop it. Whether the real runner
// happens to be on is outside this suite's control, so the state itself is
// only checked against the allowed values.
describe('Code runner API', () => {
  const creds = makeCredentials();
  let accessToken = null;
  let userId = null;

  const authHeaders = () => ({ Authorization: `Bearer ${accessToken}` });

  beforeAll(async () => {
    await waitForBackend();
    const res = await axios.post(`${BASE_URL}/api/users/register`, creds);
    accessToken = res.data.token;
    userId = res.data.user._id;
  }, 60_000);

  afterAll(async () => {
    if (userId && accessToken) {
      await axios.delete(`${BASE_URL}/api/users/me`, {
        headers: authHeaders(),
        validateStatus: null,
      });
    }
  });

  test('should reject a status request without a token', async () => {
    const res = await axios.get(`${BASE_URL}/api/coding/runner`, { validateStatus: null });
    expect(res.status).toBe(401);
  });

  test('should reject a session request without a token', async () => {
    const res = await axios.post(`${BASE_URL}/api/coding/runner/sessions`, null, {
      validateStatus: null,
    });
    expect(res.status).toBe(401);
  });

  test('should report the runner state to a logged-in user', async () => {
    const res = await axios.get(`${BASE_URL}/api/coding/runner`, { headers: authHeaders() });
    expect(res.status).toBe(200);
    expect(['ready', 'offline']).toContain(res.data.state);
    expect(res.data.managed).toBe(false);
    expect(res.data.dailyLimitReached).toBe(false);
  });

  test('should answer a session request with the state when it cannot start the runner', async () => {
    const res = await axios.post(`${BASE_URL}/api/coding/runner/sessions`, null, {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    expect(['ready', 'offline']).toContain(res.data.state);
  });

  test('should refuse a hold from a user who is not an admin', async () => {
    const res = await axios.post(
      `${BASE_URL}/api/coding/runner/holds`,
      { minutes: 60 },
      { headers: authHeaders(), validateStatus: null },
    );
    expect(res.status).toBe(403);
  });
});
