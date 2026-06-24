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

// Creates a unique user credential set per test file invocation
const makeCredentials = () => {
  const ts = Date.now();
  return {
    username: `user_${ts}`,
    email: `user_${ts}@integration.test`,
    password: 'Integration_Test_123!',
  };
};

module.exports = { BASE_URL, waitForBackend, makeCredentials };
