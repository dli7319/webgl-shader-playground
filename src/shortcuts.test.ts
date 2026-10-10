import { describe, expect, it, vi } from "vitest";
import { handleShortcutEvent, isDownloadShortcut, isRunShortcut } from "./shortcuts";

function key(init: Partial<KeyboardEventInit>): KeyboardEvent {
  return new KeyboardEvent("keydown", init);
}

describe("shortcut matchers", () => {
  it("matches Ctrl+Enter and Cmd+Enter as run", () => {
    expect(isRunShortcut(key({ ctrlKey: true, key: "Enter" }))).toBe(true);
    expect(isRunShortcut(key({ metaKey: true, key: "Enter" }))).toBe(true);
    expect(isRunShortcut(key({ key: "Enter" }))).toBe(false);
    expect(isRunShortcut(key({ ctrlKey: true, key: "a" }))).toBe(false);
  });

  it("matches Ctrl+S and Cmd+S as download (any case)", () => {
    expect(isDownloadShortcut(key({ ctrlKey: true, key: "s" }))).toBe(true);
    expect(isDownloadShortcut(key({ metaKey: true, key: "S" }))).toBe(true);
    expect(isDownloadShortcut(key({ key: "s" }))).toBe(false);
    expect(isDownloadShortcut(key({ ctrlKey: true, key: "p" }))).toBe(false);
  });
});

describe("handleShortcutEvent", () => {
  it("routes run shortcuts and prevents default", () => {
    const onRun = vi.fn();
    const onDownload = vi.fn();
    const event = key({ ctrlKey: true, key: "Enter" });
    const preventDefault = vi.spyOn(event, "preventDefault");

    expect(handleShortcutEvent(event, { onRun, onDownload })).toBe(true);
    expect(onRun).toHaveBeenCalledTimes(1);
    expect(onDownload).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
  });

  it("routes download shortcuts", () => {
    const onRun = vi.fn();
    const onDownload = vi.fn();
    const event = key({ ctrlKey: true, key: "s" });

    expect(handleShortcutEvent(event, { onRun, onDownload })).toBe(true);
    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(onRun).not.toHaveBeenCalled();
  });

  it("ignores unrelated keys", () => {
    const onRun = vi.fn();
    const onDownload = vi.fn();
    const event = key({ ctrlKey: true, key: "z" });

    expect(handleShortcutEvent(event, { onRun, onDownload })).toBe(false);
    expect(onRun).not.toHaveBeenCalled();
    expect(onDownload).not.toHaveBeenCalled();
  });
});
