import ApiError from '../../backend/utils/ApiError.js';

describe('ApiError', () => {
  describe('static factories', () => {
    test('badRequest creates a 400 error with the given message', () => {
      const err = ApiError.badRequest('invalid input');
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('invalid input');
    });

    test('unauthorized creates a 401 error with default message', () => {
      const err = ApiError.unauthorized();
      expect(err.statusCode).toBe(401);
      expect(typeof err.message).toBe('string');
      expect(err.message.length).toBeGreaterThan(0);
    });

    test('unauthorized accepts a custom message', () => {
      const err = ApiError.unauthorized('token expired');
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe('token expired');
    });

    test('forbidden creates a 403 error', () => {
      const err = ApiError.forbidden('access denied');
      expect(err.statusCode).toBe(403);
      expect(err.message).toBe('access denied');
    });

    test('notFound creates a 404 error', () => {
      const err = ApiError.notFound('post not found');
      expect(err.statusCode).toBe(404);
      expect(err.message).toBe('post not found');
    });

    test('tooManyRequests creates a 429 error', () => {
      const err = ApiError.tooManyRequests('slow down');
      expect(err.statusCode).toBe(429);
      expect(err.message).toBe('slow down');
    });

    test('internalServerError creates a 500 error', () => {
      const err = ApiError.internalServerError('something broke');
      expect(err.statusCode).toBe(500);
      expect(err.message).toBe('something broke');
    });
  });

  describe('instanceof checks', () => {
    test('every factory returns an instance of Error', () => {
      expect(ApiError.badRequest('x')).toBeInstanceOf(Error);
      expect(ApiError.unauthorized()).toBeInstanceOf(Error);
      expect(ApiError.notFound('x')).toBeInstanceOf(Error);
    });

    test('factory result is catchable as a standard Error', () => {
      expect(() => {
        throw ApiError.notFound('missing');
      }).toThrow('missing');
    });
  });
});
