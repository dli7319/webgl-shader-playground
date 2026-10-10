import { describe, expect, it } from "vitest";
import { createShaderStore, type SavedShader } from "./shaderStore";

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

describe("createShaderStore", () => {
  it("saves and lists shaders, newest first", () => {
    const store = createShaderStore(fakeStorage());
    store.save("one", "void main() {}");
    store.save("two", "void main() { }");
    expect(store.getSnapshot().map((s) => s.name)).toEqual(["two", "one"]);
  });

  it("updates in place when a name already exists", () => {
    const store = createShaderStore(fakeStorage());
    store.save("mine", "old");
    store.save("mine", "new");
    const snapshot = store.getSnapshot();
    expect(snapshot).toHaveLength(1);
    expect(snapshot[0].source).toBe("new");
  });

  it("removes by id", () => {
    const store = createShaderStore(fakeStorage());
    const saved = store.save("gone", "x");
    store.remove(saved.id);
    expect(store.getSnapshot()).toEqual([]);
  });

  it("persists across store instances", () => {
    const storage = fakeStorage();
    createShaderStore(storage).save("kept", "source");
    const reloaded = createShaderStore(storage);
    expect(reloaded.getSnapshot().map((s) => s.name)).toEqual(["kept"]);
  });

  it("ignores corrupt payloads", () => {
    const storage = fakeStorage({ "shader-playground:shaders": "{not json" });
    expect(createShaderStore(storage).getSnapshot()).toEqual([]);

    const wrongShape = fakeStorage({
      "shader-playground:shaders": JSON.stringify([{ id: 42 }]),
    });
    expect(createShaderStore(wrongShape).getSnapshot()).toEqual([]);
  });

  it("keeps the in-memory list working when storage throws", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    };
    const store = createShaderStore(storage);
    const saved = store.save("a", "x");
    expect(store.getSnapshot()).toEqual([saved]);
  });

  it("notifies subscribers", () => {
    const store = createShaderStore(fakeStorage());
    let calls = 0;
    const unsubscribe = store.subscribe(() => calls++);
    store.save("a", "x");
    const saved = store.getSnapshot()[0] as SavedShader;
    store.remove(saved.id);
    unsubscribe();
    store.save("b", "y");
    expect(calls).toBe(2);
  });
});
