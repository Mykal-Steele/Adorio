import {
  MAX_SCALE,
  clampPan,
  clampScale,
  doubleClickScale,
  formatZoom,
  stepScale,
  zoomAt,
} from '../../src/components/PostCard/utils/imageZoom.ts';

// A 1000x800 stage showing an image that fits it exactly at 100%.
const stage = { stageWidth: 1000, stageHeight: 800, imageWidth: 1000, imageHeight: 800 };
const start = { scale: 1, x: 0, y: 0 };

describe('clampScale', () => {
  test('should never go below 100% or above the maximum', () => {
    expect(clampScale(0.2)).toBe(1);
    expect(clampScale(MAX_SCALE + 3)).toBe(MAX_SCALE);
    expect(clampScale(2.5)).toBe(2.5);
  });

  test('should fall back to 100% for a value that is not a number', () => {
    expect(clampScale(NaN)).toBe(1);
  });
});

describe('zoomAt', () => {
  test('should keep the point under the cursor still when zooming in', () => {
    const next = zoomAt({ view: start, factor: 2, point: { x: 100, y: 50 }, ...stage });
    expect(next).toEqual({ scale: 2, x: -100, y: -50 });
  });

  test('should not zoom past the maximum, and leave the view where it was', () => {
    const view = { scale: MAX_SCALE, x: -40, y: 10 };
    expect(zoomAt({ view, factor: 2, point: { x: 0, y: 0 }, ...stage })).toEqual(view);
  });

  test('should recenter when zooming all the way back out to 100%', () => {
    const view = { scale: 2, x: -300, y: -120 };
    expect(zoomAt({ view, factor: 0.1, point: { x: 0, y: 0 }, ...stage })).toEqual({
      scale: 1,
      x: 0,
      y: 0,
    });
  });

  test('should not let the image slide off the stage when zooming near an edge', () => {
    // At 2x the image is 2000 wide, so it can move at most 500 either way.
    const next = zoomAt({ view: start, factor: 2, point: { x: 490, y: 390 }, ...stage });
    expect(next.x).toBe(-490);
    expect(next.y).toBe(-390);
    const farther = zoomAt({ view: next, factor: 1, point: { x: 490, y: 390 }, ...stage });
    expect(Math.abs(farther.x)).toBeLessThanOrEqual(500);
  });
});

describe('clampPan', () => {
  test('should stop the image edge at the stage edge', () => {
    const view = clampPan({ view: { scale: 2, x: -900, y: 900 }, ...stage });
    expect(view).toEqual({ scale: 2, x: -500, y: 400 });
  });

  test('should keep a small image centered, because it never overflows the stage', () => {
    const small = { stageWidth: 1000, stageHeight: 800, imageWidth: 400, imageHeight: 300 };
    const view = clampPan({ view: { scale: 2, x: 120, y: -80 }, ...small });
    expect(view).toEqual({ scale: 2, x: 0, y: 0 });
  });

  test('should only lock the axis that fits', () => {
    // Wide image: at 2x it is 2000 wide (overflows) but 400 tall (fits the 800 stage).
    const wide = { stageWidth: 1000, stageHeight: 800, imageWidth: 1000, imageHeight: 200 };
    const view = clampPan({ view: { scale: 2, x: -300, y: 90 }, ...wide });
    expect(view).toEqual({ scale: 2, x: -300, y: 0 });
  });
});

describe('stepScale', () => {
  test('should zoom in and out by a fixed step', () => {
    expect(stepScale(1, 'in')).toBe(1.5);
    expect(stepScale(3, 'out')).toBe(2);
  });

  test('should stop at the limits', () => {
    expect(stepScale(1, 'out')).toBe(1);
    expect(stepScale(MAX_SCALE, 'in')).toBe(MAX_SCALE);
  });
});

describe('doubleClickScale', () => {
  test('should zoom in from 100% and go back to 100% when already zoomed', () => {
    expect(doubleClickScale(1)).toBe(2.5);
    expect(doubleClickScale(2.5)).toBe(1);
    expect(doubleClickScale(1.02)).toBe(2.5);
  });
});

describe('formatZoom', () => {
  test('should show whole percentages', () => {
    expect(formatZoom(1)).toBe('100%');
    expect(formatZoom(2.5)).toBe('250%');
    expect(formatZoom(1.5)).toBe('150%');
  });
});
