const axios = require('axios');

const BASE_URL = process.env.TEST_TARGET_URL || 'http://localhost:80';

const waitForBackend = async (retries = 30, interval = 2000) => {
  let lastError = 'no response';
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(`${BASE_URL}/api/health`);
      if (res.status === 200) return;
    } catch (err) {
      lastError = err?.message || 'unknown error';
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error(
    `Backend at ${BASE_URL} not ready after ${(retries * interval) / 1000}s. Last error: ${lastError}`,
  );
};

// Creates a unique user credential set. A monotonic counter is appended so
// two calls within the same millisecond (e.g. a test file registering two
// users back to back) never collide on username/email.
let credentialCounter = 0;

const makeCredentials = () => {
  const id = `${Date.now().toString(36)}${(credentialCounter++).toString(36)}`;
  return {
    username: `u${id}`.slice(0, 20),
    email: `u${id}@integration.test`,
    password: 'Integration_Test_123!',
  };
};

module.exports = { BASE_URL, waitForBackend, makeCredentials };
