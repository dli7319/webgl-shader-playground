export interface ShortcutHandlers {
  onRun: () => void;
  onDownload: () => void;
}

/** Ctrl/Cmd+Enter — run the shader. */
export function isRunShortcut(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && event.key === "Enter";
}

/** Ctrl/Cmd+S — download the shader (prevents the browser's save dialog). */
export function isDownloadShortcut(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && (event.key === "s" || event.key === "S");
}

/**
 * Routes a keydown event to the matching handler. Returns true when a
 * shortcut was handled (the event is prevented in that case).
 */
export function handleShortcutEvent(
  event: KeyboardEvent,
  handlers: ShortcutHandlers
): boolean {
  if (isRunShortcut(event)) {
    event.preventDefault();
    handlers.onRun();
    return true;
  }
  if (isDownloadShortcut(event)) {
    event.preventDefault();
    handlers.onDownload();
    return true;
  }
  return false;
}
