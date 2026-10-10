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

/**
 * Renders `scene` through `camera` at the requested size and encodes the
 * result under the MIME type implied by the filename. The renderer is created
 * via `createRenderer` (injectable for tests) and disposed before returning.
 */
export function captureSceneToDataUrl(
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: ScreenshotOptions,
  createRenderer: () => THREE.WebGLRenderer = createScreenshotRenderer
): ScreenshotResult {
  const mimeType = mimeTypeForImageFilename(options.filename);
  if (!mimeType) {
    return {
      ok: false,
      error: `Unsupported screenshot format: "${options.filename}" (use .png, .jpg or .jpeg)`,
    };
  }

  const renderer = createRenderer();
  try {
    renderer.setSize(options.width, options.height);
    renderer.render(scene, camera);
    const dataUrl = renderer.domElement.toDataURL(mimeType);
    if (!dataUrl) {
      return { ok: false, error: "Screenshot encoding produced no image data" };
    }
    return { ok: true, dataUrl };
  } finally {
    renderer.dispose();
  }
}

/**
 * Captures the scene and triggers a browser download. Returns false and logs
 * when the capture failed (unsupported filename, encoding failure).
 */
export function captureAndDownloadSceneScreenshot(
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: ScreenshotOptions,
  createRenderer: () => THREE.WebGLRenderer = createScreenshotRenderer
): boolean {
  const result = captureSceneToDataUrl(scene, camera, options, createRenderer);
  if (!result.ok) {
    logger.error(result.error);
    return false;
  }
  logger.debug(`Captured ${options.filename} at ${options.width}x${options.height}`);
  downloadDataUrlFile(options.filename, result.dataUrl);
  return true;
}
