// Where each page was scrolled to. The page scrolls inside <main>, not the window, so the
// browser and Next.js don't restore it. sessionStorage keeps it across a refresh in the same tab.
export const SCROLL_KEY = 'portfolio-scroll';

export type ScrollPositions = Record<string, number>;

const usable = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

export function loadScrollPositions(storage: Pick<Storage, 'getItem'> | null): ScrollPositions {
  try {
    const saved: unknown = JSON.parse(storage?.getItem(SCROLL_KEY) ?? 'null');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
    return Object.fromEntries(Object.entries(saved).filter(([, top]) => usable(top)));
  } catch {
    return {};
  }
}

export function saveScrollPositions(
  storage: Pick<Storage, 'setItem'> | null,
  positions: ScrollPositions,
) {
  try {
    storage?.setItem(SCROLL_KEY, JSON.stringify(positions));
  } catch {
    // Storage blocked: positions last until the page is refreshed
  }
}

export const scrollPositionFor = (positions: ScrollPositions, path: string) =>
  usable(positions[path]) ? positions[path] : 0;

export function forgetPosition(positions: ScrollPositions, path: string) {
  const { [path]: _forgotten, ...rest } = positions;
  return rest;
}

export const keepOnlyPosition = (positions: ScrollPositions, path: string): ScrollPositions =>
  path in positions ? { [path]: positions[path] } : {};

type MemoryStorage = Pick<Storage, 'getItem' | 'setItem'>;

// The positions for one tab session. A page whose tab was closed keeps scrolling for a moment
// until the next page replaces it, so its scrolling is ignored until the page is shown again.
export function createScrollMemory(storage: MemoryStorage | null) {
  let positions = loadScrollPositions(storage);
  const closed = new Set<string>();

  return {
    // Call when a page is shown. Returns where to scroll it to.
    visit(path: string) {
      closed.delete(path);
      return scrollPositionFor(positions, path);
    },
    record(path: string, top: number) {
      if (usable(top) && !closed.has(path)) positions[path] = top;
    },
    forget(path: string) {
      positions = forgetPosition(positions, path);
      closed.add(path);
    },
    forgetExcept(path: string) {
      positions = keepOnlyPosition(positions, path);
    },
    persist() {
      saveScrollPositions(storage, positions);
    },
  };
}
