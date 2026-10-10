export const RESET_CONFIRM_MESSAGE =
  "Reset the editor to the default shader? Unsaved edits will be lost.";

/** True when the editor holds changes that haven't been applied yet. */
export function isDirty(editorSource: string, compiledShader: string): boolean {
  return editorSource !== compiledShader;
}

/**
 * Asks for reset confirmation when there is something to lose. Clean resets
 * don't prompt. `confirmFn` is injectable for tests.
 */
export function confirmReset(
  editorSource: string,
  compiledShader: string,
  confirmFn: (message: string) => boolean
): boolean {
  if (!isDirty(editorSource, compiledShader)) {
    return true;
  }
  return confirmFn(RESET_CONFIRM_MESSAGE);
}
