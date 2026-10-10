export const MIN_ZOOM = 25;
export const MAX_ZOOM = 400;
export const ZOOM_STEP = 25;
export const FIT_ZOOM = 100;

/** Clamps a zoom percentage to the supported range. */
export function clampZoom(percent: number): number {
  if (!Number.isFinite(percent)) {
    return FIT_ZOOM;
  }
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(percent)));
}

/** Zoom in one step. */
export function zoomIn(percent: number): number {
  return clampZoom(percent + ZOOM_STEP);
}

/** Zoom out one step. */
export function zoomOut(percent: number): number {
  return clampZoom(percent - ZOOM_STEP);
}
