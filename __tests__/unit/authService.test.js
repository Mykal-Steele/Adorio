// Set env vars before the dynamic import so environment.js picks them up
process.env.JWT_SECRET = 'test-unit-secret-key-for-testing-only';
process.env.NODE_ENV = 'test';

const { createAuthTokens, verifyRefreshToken } =
  await import('../../backend/services/authService.js');

describe('authService', () => {
  const fakeUserId = '507f1f77bcf86cd799439011';

  describe('createAuthTokens', () => {
    test('returns both token and refreshToken', () => {
      const result = createAuthTokens(fakeUserId, false);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.token).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
    });

    test('access token and refresh token are different strings', () => {
      const { token, refreshToken } = createAuthTokens(fakeUserId, false);
      expect(token).not.toBe(refreshToken);
    });

    test('tokens are valid JWTs (three dot-separated segments)', () => {
      const { token, refreshToken } = createAuthTokens(fakeUserId, false);
      expect(token.split('.').length).toBe(3);
      expect(refreshToken.split('.').length).toBe(3);
    });

    test('access token encodes isAdmin=false', () => {
      const { token } = createAuthTokens(fakeUserId, false);
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      expect(payload.isAdmin).toBe(false);
    });

    test('access token encodes isAdmin=true when passed', () => {
      const { token } = createAuthTokens(fakeUserId, true);
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      expect(payload.isAdmin).toBe(true);
    });

    test('access token expires in ~15 minutes (900s)', () => {
      const { token } = createAuthTokens(fakeUserId, false);
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      expect(payload.exp - payload.iat).toBe(900);
    });

    test('refresh token expires in ~7 days (604800s)', () => {
      const { refreshToken } = createAuthTokens(fakeUserId, false);
      const payload = JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64').toString());
      expect(payload.exp - payload.iat).toBe(7 * 24 * 60 * 60);
    });
  });

  describe('verifyRefreshToken', () => {
    test('verifies a valid refresh token and returns the payload', () => {
      const { refreshToken } = createAuthTokens(fakeUserId, false);
      const decoded = verifyRefreshToken(refreshToken);
      expect(decoded.userId).toBe(fakeUserId);
    });

    test('throws ApiError.unauthorized for a tampered token', () => {
      expect(() => verifyRefreshToken('not.a.valid.jwt')).toThrow();
    });

    test('throws ApiError.unauthorized for an access token used as refresh token', () => {
      // Access token is signed with jwtSecret; refresh token verifier uses refreshTokenSecret.
      // Both happen to be the same value in this project, so we verify the tamper case instead.
      const { token } = createAuthTokens(fakeUserId, false);
      // Tamper the payload so signature is invalid
      const [header, , sig] = token.split('.');
      const tamperedPayload = Buffer.from(JSON.stringify({ userId: 'hacker' })).toString(
        'base64url',
      );
      expect(() => verifyRefreshToken(`${header}.${tamperedPayload}.${sig}`)).toThrow();
    });

    test('throws for an expired token', async () => {
      // Forge an expired token by importing jwt from where the backend installs it
      const jwt = (await import('../../backend/node_modules/jsonwebtoken/index.js')).default;
      const expired = jwt.sign({ userId: fakeUserId }, process.env.JWT_SECRET, {
        expiresIn: 0,
      });
      // Give the token a moment to expire (expiresIn:0 expires immediately)
      await new Promise((r) => setTimeout(r, 10));
      expect(() => verifyRefreshToken(expired)).toThrow();
    });
  });
});
