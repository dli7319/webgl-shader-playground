import { describe, expect, it, vi } from "vitest";
import { createToastStore } from "./toast";

describe("createToastStore", () => {
  it("adds toasts with unique increasing ids", () => {
    const store = createToastStore();
    const a = store.add("one");
    const b = store.add("two");
    expect(a).not.toBe(b);
    expect(store.getSnapshot().map((t) => t.message)).toEqual(["one", "two"]);
  });

  it("dismiss removes a toast and notifies once", () => {
    const store = createToastStore();
    const id = store.add("one");
    store.add("two");
    const listener = vi.fn();
    store.subscribe(listener);

    store.dismiss(id);
    expect(store.getSnapshot().map((t) => t.message)).toEqual(["two"]);
    expect(listener).toHaveBeenCalledTimes(1);

    store.dismiss(999);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("notifies subscribers on add and supports unsubscribe", () => {
    const store = createToastStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.add("hello");
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.add("later");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("returns a stable snapshot between mutations", () => {
    const store = createToastStore();
    const before = store.getSnapshot();
    expect(store.getSnapshot()).toBe(before);
    store.add("x");
    expect(store.getSnapshot()).not.toBe(before);
  });
});
