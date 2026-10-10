import defaultFragmentShader from "./shaders/fragment_shader.frag";

export const DRAFT_KEY = "shader-playground:draft";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * Loads the auto-saved editor draft. Returns null when there is nothing to
 * restore: no draft, a corrupt payload, or a draft equal to the default
 * shader (restoring it would be a no-op).
 */
export function loadDraft(storage: StorageLike, key: string = DRAFT_KEY): string | null {
  const raw = storage.getItem(key);
  if (typeof raw !== "string" || raw.length === 0) {
    return null;
  }
  if (raw === defaultFragmentShader) {
    return null;
  }
  return raw;
}

/** Saves the draft; identical-to-default sources clear it instead. */
export function saveDraft(
  storage: StorageLike,
  source: string,
  key: string = DRAFT_KEY
): void {
  if (source === defaultFragmentShader) {
    clearDraft(storage, key);
    return;
  }
  try {
    storage.setItem(key, source);
  } catch {
    // Storage unavailable — auto-save is best-effort.
  }
}

export function clearDraft(storage: StorageLike, key: string = DRAFT_KEY): void {
  try {
    storage.removeItem(key);
  } catch {
    // Best-effort.
  }
}
