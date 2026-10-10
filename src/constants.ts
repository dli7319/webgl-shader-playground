/**
 * Shared defaults and scene geometry. Keep playground state, the preview
 * renderer, and the UI reading from one place so values can't drift apart.
 */

export const DEFAULT_SCREENSHOT_FILENAME = "screenshot.png";
export const DEFAULT_DOWNLOAD_SHADER_FILENAME = "fragment.frag";
export const DEFAULT_TEXTURE_PATH = "cat-7738210_1920.jpg";
export const DEFAULT_SCREENSHOT_WIDTH = 1920;
export const DEFAULT_SCREENSHOT_HEIGHT = 1080;

/** Edge length of the preview plane (world units). */
export const PREVIEW_PLANE_SIZE = 10;

/**
 * Orthographic camera framing exactly the preview plane, with the mesh one
 * unit in front of the camera's origin plane.
 */
export const PREVIEW_CAMERA = {
  left: -PREVIEW_PLANE_SIZE / 2,
  right: PREVIEW_PLANE_SIZE / 2,
  top: PREVIEW_PLANE_SIZE / 2,
  bottom: -PREVIEW_PLANE_SIZE / 2,
  near: 0.1,
  far: 1000,
  positionZ: 1,
  meshZ: -1,
} as const;
