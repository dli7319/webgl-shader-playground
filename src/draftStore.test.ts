import { describe, expect, it } from "vitest";
import { clearDraft, DRAFT_KEY, loadDraft, saveDraft } from "./draftStore";
import defaultFragmentShader from "./shaders/fragment_shader.frag";

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}

describe("draftStore", () => {
  it("round-trips a modified draft", () => {
    const storage = fakeStorage();
    saveDraft(storage, "void main() { /* edit */ }");
    expect(loadDraft(storage)).toBe("void main() { /* edit */ }");
  });

  it("returns null when there is no draft", () => {
    expect(loadDraft(fakeStorage())).toBeNull();
  });

  it("treats a default-identical draft as nothing to restore", () => {
    const storage = fakeStorage();
    saveDraft(storage, defaultFragmentShader);
    expect(storage.data.has(DRAFT_KEY)).toBe(false);
    expect(loadDraft(storage)).toBeNull();
  });

  it("clearDraft removes the draft", () => {
    const storage = fakeStorage();
    saveDraft(storage, "edit");
    clearDraft(storage);
    expect(loadDraft(storage)).toBeNull();
  });

  it("tolerates storage failures on write", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
      removeItem: () => {
        throw new Error("quota");
      },
    };
    expect(() => saveDraft(storage, "edit")).not.toThrow();
    expect(() => clearDraft(storage)).not.toThrow();
  });

  it("uses a custom key when provided", () => {
    const storage = fakeStorage();
    saveDraft(storage, "edit", "other:key");
    expect(loadDraft(storage, "other:key")).toBe("edit");
    expect(loadDraft(storage)).toBeNull();
  });
});
