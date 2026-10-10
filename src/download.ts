/**
 * Browser download helpers shared by the shader and screenshot exporters.
 */

/** Triggers a browser download for an existing href (data: or blob: URL). */
export function triggerDownload(filename: string, href: string): void {
  const anchor = document.createElement("a");
  anchor.download = filename;
  anchor.href = href;
  anchor.click();
}

/** Encodes text as a data URL (matching the historical exporter format). */
export function textToDataUrl(text: string): string {
  return "data:text/plain," + encodeURIComponent(text);
}

/** Downloads a UTF-8 text file with the given filename. */
export function downloadTextFile(filename: string, text: string): void {
  triggerDownload(filename, textToDataUrl(text));
}

/** Downloads an already-encoded data URL under the given filename. */
export function downloadDataUrlFile(filename: string, dataUrl: string): void {
  triggerDownload(filename, dataUrl);
}
