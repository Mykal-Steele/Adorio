export type ZoomView = { scale: number; x: number; y: number };

type StageSize = {
  stageWidth: number;
  stageHeight: number;
  imageWidth: number;
  imageHeight: number;
};

type Point = { x: number; y: number };

// Post images are stored at 1000px at most, so going much past 5x only shows pixels.
export const MAX_SCALE = 5;
const ZOOM_STEP = 1.5;
const DOUBLE_CLICK_SCALE = 2.5;

export const clampScale = (value: number) =>
  Number.isFinite(value) ? Math.min(MAX_SCALE, Math.max(1, value)) : 1;

const limit = (value: number, max: number) => {
  const clamped = Math.min(max, Math.max(-max, value));
  return clamped === 0 ? 0 : clamped;
};

// The image can move until its edge meets the stage edge. An image that fits on an
// axis stays centered on it.
export function clampPan({ view, ...size }: { view: ZoomView } & StageSize): ZoomView {
  const maxX = Math.max(0, (size.imageWidth * view.scale - size.stageWidth) / 2);
  const maxY = Math.max(0, (size.imageHeight * view.scale - size.stageHeight) / 2);
  return { scale: view.scale, x: limit(view.x, maxX), y: limit(view.y, maxY) };
}

// `point` is measured from the center of the stage. It stays under the cursor.
export function zoomAt({
  view,
  factor,
  point,
  ...size
}: { view: ZoomView; factor: number; point: Point } & StageSize): ZoomView {
  const scale = clampScale(view.scale * factor);
  if (scale === view.scale) return view;
  const ratio = scale / view.scale;
  return clampPan({
    view: {
      scale,
      x: point.x - (point.x - view.x) * ratio,
      y: point.y - (point.y - view.y) * ratio,
    },
    ...size,
  });
}

export const stepScale = (scale: number, direction: 'in' | 'out') =>
  clampScale(direction === 'in' ? scale * ZOOM_STEP : scale / ZOOM_STEP);

export const doubleClickScale = (scale: number) => (scale > 1.05 ? 1 : DOUBLE_CLICK_SCALE);

export const formatZoom = (scale: number) => `${Math.round(scale * 100)}%`;
