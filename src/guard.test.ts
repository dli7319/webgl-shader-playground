import { describe, expect, it, vi } from "vitest";
import { confirmReset, isDirty, RESET_CONFIRM_MESSAGE } from "./guard";

describe("isDirty", () => {
  it("is false when editor and compiled shader match", () => {
    expect(isDirty("same", "same")).toBe(false);
    expect(isDirty("", "")).toBe(false);
  });

  it("is true when the editor diverged", () => {
    expect(isDirty("edited", "same")).toBe(true);
    expect(isDirty("", "same")).toBe(true);
  });
});

describe("confirmReset", () => {
  it("does not prompt when there is nothing to lose", () => {
    const confirmFn = vi.fn(() => false);
    expect(confirmReset("same", "same", confirmFn)).toBe(true);
    expect(confirmFn).not.toHaveBeenCalled();
  });

  it("prompts when dirty and respects the answer", () => {
    const yes = vi.fn(() => true);
    expect(confirmReset("edited", "same", yes)).toBe(true);
    expect(yes).toHaveBeenCalledWith(RESET_CONFIRM_MESSAGE);

    const no = vi.fn(() => false);
    expect(confirmReset("edited", "same", no)).toBe(false);
    expect(no).toHaveBeenCalledWith(RESET_CONFIRM_MESSAGE);
  });
});
