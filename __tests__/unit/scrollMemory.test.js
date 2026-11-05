import {
  SCROLL_KEY,
  createScrollMemory,
  forgetPosition,
  keepOnlyPosition,
  loadScrollPositions,
  saveScrollPositions,
  scrollPositionFor,
} from '../../src/views/Portfolio/scrollMemory.ts';

const fakeStorage = (initial = {}) => ({
  data: { ...initial },
  getItem(key) {
    return key in this.data ? this.data[key] : null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
});

const blockedStorage = {
  getItem() {
    throw new Error('blocked');
  },
  setItem() {
    throw new Error('blocked');
  },
};

describe('loading saved scroll positions', () => {
  test('should start empty when nothing was saved', () => {
    expect(loadScrollPositions(fakeStorage())).toEqual({});
  });

  test('should start empty when there is no storage', () => {
    expect(loadScrollPositions(null)).toEqual({});
  });

  test('should start empty when the saved text is not valid JSON', () => {
    expect(loadScrollPositions(fakeStorage({ [SCROLL_KEY]: '{oops' }))).toEqual({});
  });

  test('should start empty when the saved value is not an object of positions', () => {
    for (const saved of ['5', 'null', '[1,2]', '"text"']) {
      expect(loadScrollPositions(fakeStorage({ [SCROLL_KEY]: saved }))).toEqual({});
    }
  });

  test('should drop positions that are not whole or fractional numbers from 0 up', () => {
    const saved = JSON.stringify({ '/a': 120, '/b': 'far', '/c': -5, '/d': 0, '/e': 33.5 });
    expect(loadScrollPositions(fakeStorage({ [SCROLL_KEY]: saved }))).toEqual({
      '/a': 120,
      '/d': 0,
      '/e': 33.5,
    });
  });

  test('should not throw when storage is blocked', () => {
    expect(loadScrollPositions(blockedStorage)).toEqual({});
  });
});

describe('saving scroll positions', () => {
  test('should give back what was saved', () => {
    const storage = fakeStorage();
    saveScrollPositions(storage, { '/': 640, '/projects/adorio': 80 });
    expect(loadScrollPositions(storage)).toEqual({ '/': 640, '/projects/adorio': 80 });
  });

  test('should not throw when storage is blocked', () => {
    expect(() => saveScrollPositions(blockedStorage, { '/': 10 })).not.toThrow();
  });

  test('should not throw when there is no storage', () => {
    expect(() => saveScrollPositions(null, { '/': 10 })).not.toThrow();
  });
});

describe('finding where a page was left', () => {
  test('should return the saved position for a page', () => {
    expect(scrollPositionFor({ '/': 640 }, '/')).toBe(640);
  });

  test('should start a page that was never visited at the top', () => {
    expect(scrollPositionFor({ '/': 640 }, '/contact')).toBe(0);
  });

  test('should start a page at the top when its saved position is not a usable number', () => {
    expect(scrollPositionFor({ '/': Number.NaN }, '/')).toBe(0);
    expect(scrollPositionFor({ '/': -20 }, '/')).toBe(0);
  });
});

describe('forgetting positions when tabs close', () => {
  const positions = { '/': 640, '/projects': 200, '/contact': 30 };

  test('should forget one page and keep the rest', () => {
    expect(forgetPosition(positions, '/projects')).toEqual({ '/': 640, '/contact': 30 });
  });

  test('should keep only the page that stays open', () => {
    expect(keepOnlyPosition(positions, '/contact')).toEqual({ '/contact': 30 });
  });

  test('should keep nothing when the open page has no saved position', () => {
    expect(keepOnlyPosition(positions, '/skills/bun')).toEqual({});
  });

  test('should not change the object it was given', () => {
    forgetPosition(positions, '/');
    keepOnlyPosition(positions, '/');
    expect(positions).toEqual({ '/': 640, '/projects': 200, '/contact': 30 });
  });
});

describe('scroll memory for one tab session', () => {
  test('should hand back where a page was left, also in a new session', () => {
    const storage = fakeStorage();
    const first = createScrollMemory(storage);
    first.record('/', 640);
    first.persist();
    expect(createScrollMemory(storage).visit('/')).toBe(640);
  });

  test('should start a page that was never visited at the top', () => {
    expect(createScrollMemory(fakeStorage()).visit('/contact')).toBe(0);
  });

  test('should not keep positions that are not usable numbers', () => {
    const memory = createScrollMemory(fakeStorage());
    memory.record('/', -5);
    memory.record('/', Number.NaN);
    expect(memory.visit('/')).toBe(0);
  });

  test('should save a position only when asked to persist', () => {
    const storage = fakeStorage();
    createScrollMemory(storage).record('/', 300);
    expect(loadScrollPositions(storage)).toEqual({});
  });

  test('should ignore scrolling on a page whose tab was closed until it is shown again', () => {
    const memory = createScrollMemory(fakeStorage());
    memory.record('/projects/adorio', 400);
    memory.forget('/projects/adorio');
    // the page can still scroll for a moment before the next page replaces it
    memory.record('/projects/adorio', 120);
    expect(memory.visit('/projects/adorio')).toBe(0);
    memory.record('/projects/adorio', 90);
    expect(memory.visit('/projects/adorio')).toBe(90);
  });

  test('should keep recording other pages after one tab is closed', () => {
    const memory = createScrollMemory(fakeStorage());
    memory.forget('/projects/adorio');
    memory.record('/', 700);
    expect(memory.visit('/')).toBe(700);
  });

  test('should keep only the open page when the other tabs are closed', () => {
    const memory = createScrollMemory(fakeStorage());
    memory.record('/', 700);
    memory.record('/contact', 50);
    memory.forgetExcept('/contact');
    expect(memory.visit('/')).toBe(0);
    expect(memory.visit('/contact')).toBe(50);
  });

  test('should not throw when storage is blocked', () => {
    const memory = createScrollMemory(blockedStorage);
    memory.record('/', 10);
    expect(() => memory.persist()).not.toThrow();
    expect(memory.visit('/')).toBe(10);
  });
});
