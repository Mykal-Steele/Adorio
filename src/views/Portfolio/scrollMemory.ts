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
