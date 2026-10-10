import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDebouncer } from "./debounce";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("createDebouncer", () => {
  it("runs the function once after the delay", () => {
    const debouncer = createDebouncer(600);
    const fn = vi.fn();

    debouncer.schedule(fn);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(599);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("collapses bursts into the trailing call", () => {
    const debouncer = createDebouncer(600);
    const fn = vi.fn();

    for (let i = 0; i < 10; i++) {
      debouncer.schedule(fn);
      vi.advanceTimersByTime(100);
    }
    vi.advanceTimersByTime(600);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("cancel prevents the pending call", () => {
    const debouncer = createDebouncer(600);
    const fn = vi.fn();

    debouncer.schedule(fn);
    debouncer.cancel();
    vi.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalled();
  });

  it("can schedule again after firing", () => {
    const debouncer = createDebouncer(600);
    const fn = vi.fn();

    debouncer.schedule(fn);
    vi.advanceTimersByTime(600);
    debouncer.schedule(fn);
    vi.advanceTimersByTime(600);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
