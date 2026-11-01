import postSchema from '../../backend/schemas/db/postSchema.js';

describe('post schema indexes', () => {
  const ttl = postSchema.indexes().find(([, options]) => options.expireAfterSeconds !== undefined);

  test('should delete a post when its expiresAt time passes', () => {
    expect(ttl).toBeDefined();
    const [keys, options] = ttl;
    expect(keys).toEqual({ expiresAt: 1 });
    expect(options.expireAfterSeconds).toBe(0);
  });

  test('should not match posts by title or any other user chosen field', () => {
    expect(ttl[1].partialFilterExpression).toBeUndefined();
  });

  test('should leave posts without expiresAt alone', () => {
    expect(postSchema.path('expiresAt').options.required).toBeFalsy();
    expect(postSchema.path('expiresAt').options.default).toBeUndefined();
  });
});
