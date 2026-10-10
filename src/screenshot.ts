import * as THREE from "three";
import { mimeTypeForImageFilename } from "./files";
import { downloadDataUrlFile } from "./download";
import { createLogger } from "./logger";

const logger = createLogger("screenshot");

export type ScreenshotResult =
  { ok: true; dataUrl: string } | { ok: false; error: string };

export interface ScreenshotOptions {
  filename: string;
  width: number;
  height: number;
}

/** Creates the offscreen renderer used for high-resolution captures. */
export function createScreenshotRenderer(): THREE.WebGLRenderer {
  return new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
}

let sharedRenderer: THREE.WebGLRenderer | null = null;

/**
 * Returns the shared offscreen renderer, creating it on first use. WebGL
 * contexts are expensive and limited, so captures share one renderer and
 * resize it per request instead of allocating a context each time.
 */
export function getScreenshotRenderer(
  factory: () => THREE.WebGLRenderer = createScreenshotRenderer
): THREE.WebGLRenderer {
  if (!sharedRenderer) {
    sharedRenderer = factory();
  }
  return sharedRenderer;
}

/** Disposes and forgets the shared renderer (used by tests). */
export function resetScreenshotRenderer(): void {
  sharedRenderer?.dispose();
  sharedRenderer = null;
}

/**
 * Renders `scene` through `camera` at the requested size and encodes the
 * result under the MIME type implied by the filename, using the shared
 * offscreen renderer.
 */
export function captureSceneToDataUrl(
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: ScreenshotOptions
): ScreenshotResult {
  const mimeType = mimeTypeForImageFilename(options.filename);
  if (!mimeType) {
    return {
      ok: false,
      error: `Unsupported screenshot format: "${options.filename}" (use .png, .jpg or .jpeg)`,
    };
  }

  const renderer = getScreenshotRenderer();
  renderer.setSize(options.width, options.height);
  renderer.render(scene, camera);
  const dataUrl = renderer.domElement.toDataURL(mimeType);
  if (!dataUrl) {
    return { ok: false, error: "Screenshot encoding produced no image data" };
  }
  return { ok: true, dataUrl };
}

/**
 * Captures the scene and triggers a browser download. Returns false and logs
 * when the capture failed (unsupported filename, encoding failure).
 */
export function captureAndDownloadSceneScreenshot(
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: ScreenshotOptions
): boolean {
  const result = captureSceneToDataUrl(scene, camera, options);
  if (!result.ok) {
    logger.error(result.error);
    return false;
  }
  logger.debug(`Captured ${options.filename} at ${options.width}x${options.height}`);
  downloadDataUrlFile(options.filename, result.dataUrl);
  return true;
}
