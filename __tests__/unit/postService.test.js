import { mock, beforeEach } from 'bun:test';

// ── module mocks ───────────────────────────────────────────────────────────────

mock.module('../../backend/utils/imageFormatter.js', () => ({
  normalizeExistingImage: (img) => img || null,
}));

const mockCreatePost = mock(() => Promise.resolve(null));
const mockCountPosts = mock(() => Promise.resolve(0));
const mockFindPostsPaginated = mock(() => Promise.resolve([]));
const mockFindPostById = mock(() => Promise.resolve(null));
const mockFindPostLikesById = mock(() => Promise.resolve(null));
const mockUpdatePostById = mock(() => Promise.resolve(null));
const mockPushCommentToPost = mock(() => Promise.resolve(null));
const mockDeletePostById = mock(() => Promise.resolve());

mock.module('../../backend/models/index.js', () => ({
  createPost: mockCreatePost,
  countPosts: mockCountPosts,
  findPostsPaginated: mockFindPostsPaginated,
  findPostById: mockFindPostById,
  findPostLikesById: mockFindPostLikesById,
  updatePostById: mockUpdatePostById,
  pushCommentToPost: mockPushCommentToPost,
  deletePostById: mockDeletePostById,
}));

const { createPost, getPaginatedPosts, getPostById, togglePostLike, deletePost, addCommentToPost } =
  await import('../../backend/services/postService.js');

const makePost = (overrides = {}) => ({
  _id: 'post1',
  title: 'Test',
  content: 'Content',
  user: { _id: 'user1', username: 'alice' },
  likes: [],
  comments: [],
  image: null,
  createdAt: new Date().toISOString(),
  ...overrides,
});

// ── createPost ─────────────────────────────────────────────────────────────────

describe('createPost', () => {
  test('throws 400 when title is empty', async () => {
    let caught;
    try {
      await createPost({ userId: 'u1', title: '', content: 'content' });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(400);
  });

  test('throws 400 when content is missing', async () => {
    let caught;
    try {
      await createPost({ userId: 'u1', title: 'Title', content: '' });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(400);
  });

  test('creates and returns the normalized post', async () => {
    const post = makePost({ title: 'Hello', content: 'World' });
    mockCreatePost.mockImplementation(() => Promise.resolve(post));
    const result = await createPost({ userId: 'u1', title: 'Hello', content: 'World' });
    expect(result).toHaveProperty('title', 'Hello');
    expect(result).toHaveProperty('content', 'World');
  });
});

// ── getPaginatedPosts ──────────────────────────────────────────────────────────

describe('getPaginatedPosts', () => {
  beforeEach(() => {
    mockFindPostsPaginated.mockImplementation(() => Promise.resolve([]));
  });

  test('hasMore is true when more posts exist beyond the current page', async () => {
    mockCountPosts.mockImplementation(() => Promise.resolve(20));
    const result = await getPaginatedPosts({ page: '1', limit: '5' });
    expect(result.hasMore).toBe(true);
  });

  test('hasMore is false on the last page', async () => {
    mockCountPosts.mockImplementation(() => Promise.resolve(5));
    const result = await getPaginatedPosts({ page: '1', limit: '5' });
    expect(result.hasMore).toBe(false);
  });

  test('totalPages rounds up correctly', async () => {
    mockCountPosts.mockImplementation(() => Promise.resolve(11));
    const result = await getPaginatedPosts({ page: '1', limit: '5' });
    expect(result.totalPages).toBe(3);
  });

  test('totalPages is at least 1 even when no posts exist', async () => {
    mockCountPosts.mockImplementation(() => Promise.resolve(0));
    const result = await getPaginatedPosts({});
    expect(result.totalPages).toBe(1);
  });

  test('returns correct currentPage', async () => {
    mockCountPosts.mockImplementation(() => Promise.resolve(100));
    const result = await getPaginatedPosts({ page: '3', limit: '5' });
    expect(result.currentPage).toBe(3);
  });
});

// ── getPostById ────────────────────────────────────────────────────────────────

describe('getPostById', () => {
  test('throws 404 when the post does not exist', async () => {
    mockFindPostById.mockImplementation(() => Promise.resolve(null));
    let caught;
    try {
      await getPostById('nonexistent');
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(404);
  });

  test('returns the post when found', async () => {
    const post = makePost();
    mockFindPostById.mockImplementation(() => Promise.resolve(post));
    const result = await getPostById('post1');
    expect(result).toHaveProperty('_id', 'post1');
  });
});

// ── togglePostLike ─────────────────────────────────────────────────────────────

describe('togglePostLike', () => {
  test('throws 404 when post does not exist', async () => {
    mockFindPostLikesById.mockImplementation(() => Promise.resolve(null));
    let caught;
    try {
      await togglePostLike({ postId: 'missing', userId: 'u1' });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(404);
  });

  test('adds a like ($addToSet) when the user has not yet liked the post', async () => {
    mockFindPostLikesById.mockImplementation(() => Promise.resolve({ likes: [] }));
    mockUpdatePostById.mockImplementation(() => Promise.resolve(makePost()));
    const result = await togglePostLike({ postId: 'post1', userId: 'user1' });
    expect(mockUpdatePostById).toHaveBeenCalledWith(
      'post1',
      { $addToSet: { likes: 'user1' } },
      { new: true },
    );
    expect(result.action).toBe('liked');
  });

  test('removes a like ($pull) when the user already liked the post', async () => {
    mockFindPostLikesById.mockImplementation(() =>
      Promise.resolve({ likes: [{ toString: () => 'user1' }] }),
    );
    mockUpdatePostById.mockImplementation(() => Promise.resolve(makePost()));
    const result = await togglePostLike({ postId: 'post1', userId: 'user1' });
    expect(mockUpdatePostById).toHaveBeenCalledWith(
      'post1',
      { $pull: { likes: 'user1' } },
      { new: true },
    );
    expect(result.action).toBe('unliked');
  });
});

// ── deletePost ─────────────────────────────────────────────────────────────────

describe('deletePost', () => {
  test('throws 404 when post does not exist', async () => {
    mockFindPostById.mockImplementation(() => Promise.resolve(null));
    let caught;
    try {
      await deletePost({ postId: 'nope', userId: 'u1' });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(404);
  });

  test('throws 403 when requester is not the post author', async () => {
    mockFindPostById.mockImplementation(() =>
      Promise.resolve(makePost({ user: { _id: { toString: () => 'owner' } } })),
    );
    let caught;
    try {
      await deletePost({ postId: 'post1', userId: 'intruder' });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(403);
  });

  test('deletes without error when requester is the author', async () => {
    mockFindPostById.mockImplementation(() =>
      Promise.resolve(makePost({ user: { _id: { toString: () => 'owner' } } })),
    );
    mockDeletePostById.mockImplementation(() => Promise.resolve());
    await expect(deletePost({ postId: 'post1', userId: 'owner' })).resolves.toBeUndefined();
  });
});

// ── addCommentToPost ───────────────────────────────────────────────────────────

describe('addCommentToPost', () => {
  test('throws 400 when comment text is empty', async () => {
    let caught;
    try {
      await addCommentToPost({ postId: 'p1', userId: 'u1', text: '' });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(400);
  });

  test('throws 404 when post does not exist', async () => {
    mockPushCommentToPost.mockImplementation(() => Promise.resolve(null));
    let caught;
    try {
      await addCommentToPost({ postId: 'missing', userId: 'u1', text: 'hi' });
    } catch (e) {
      caught = e;
    }
    expect(caught?.statusCode).toBe(404);
  });

  test('returns comments sorted newest first', async () => {
    const old = { text: 'old comment', createdAt: new Date('2024-01-01') };
    const recent = { text: 'recent comment', createdAt: new Date('2024-06-01') };
    mockPushCommentToPost.mockImplementation(() =>
      Promise.resolve({ _id: 'p1', comments: [old, recent], image: null }),
    );
    const result = await addCommentToPost({ postId: 'p1', userId: 'u1', text: 'hi' });
    expect(result.comments[0].text).toBe('recent comment');
    expect(result.comments[1].text).toBe('old comment');
  });
});
