/**
 * Helpers for working with image filenames and their MIME types.
 */

export const imageExtensionToMime = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
} as const;

export type ImageExtension = keyof typeof imageExtensionToMime;

/**
 * Returns the MIME type for a supported image filename (case-insensitive),
 * or null when the filename has no extension or an unsupported one.
 */
export function mimeTypeForImageFilename(filename: string): string | null {
  const dot = filename.lastIndexOf(".");
  if (dot <= 0 || dot === filename.length - 1) {
    return null;
  }
  const extension = filename.slice(dot + 1).toLowerCase();
  return imageExtensionToMime[extension as ImageExtension] ?? null;
}

/** True when {@link mimeTypeForImageFilename} finds a supported type. */
export function isSupportedImageFilename(filename: string): boolean {
  return mimeTypeForImageFilename(filename) !== null;
}
