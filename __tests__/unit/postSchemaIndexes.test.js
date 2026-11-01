import postSchema from '../../backend/schemas/db/postSchema.js';

describe('post schema indexes', () => {
  const ttl = postSchema.indexes().find(([, options]) => options.expireAfterSeconds !== undefined);

  test('should expire integration test posts after 60 seconds', () => {
    expect(ttl).toBeDefined();
    const [keys, options] = ttl;
    expect(keys).toEqual({ createdAt: 1 });
    expect(options.expireAfterSeconds).toBe(60);
  });

  test('should only expire posts titled Integration Test Post, never real ones', () => {
    expect(ttl[1].partialFilterExpression).toEqual({ title: 'Integration Test Post' });
  });
});
