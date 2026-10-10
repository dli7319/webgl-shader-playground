export interface SavedShader {
  id: string;
  name: string;
  source: string;
  savedAt: number;
}

export interface ShaderStore {
  getSnapshot: () => SavedShader[];
  save: (name: string, source: string) => SavedShader;
  remove: (id: string) => void;
  subscribe: (listener: () => void) => () => void;
}

export const SHADER_STORE_KEY = "shader-playground:shaders";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function parseSavedShaders(json: string | null): SavedShader[] {
  if (!json) {
    return [];
  }
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter(
    (item): item is SavedShader =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as SavedShader).id === "string" &&
      typeof (item as SavedShader).name === "string" &&
      typeof (item as SavedShader).source === "string" &&
      typeof (item as SavedShader).savedAt === "number"
  );
}

/** localStorage-backed store of named shader sources. */
export function createShaderStore(
  storage: StorageLike,
  key: string = SHADER_STORE_KEY
): ShaderStore {
  let shaders = parseSavedShaders(storage.getItem(key));
  let nextId = 1;
  const listeners = new Set<() => void>();

  const persist = (): void => {
    try {
      storage.setItem(key, JSON.stringify(shaders));
    } catch {
      // Storage full/unavailable — the in-memory list still works.
    }
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    getSnapshot: () => shaders,
    save(name: string, source: string): SavedShader {
      const existing = shaders.find((shader) => shader.name === name);
      const saved: SavedShader = existing
        ? { ...existing, source, savedAt: Date.now() }
        : { id: `shader-${nextId++}`, name, source, savedAt: Date.now() };
      shaders = existing
        ? shaders.map((shader) => (shader.id === saved.id ? saved : shader))
        : [saved, ...shaders];
      persist();
      return saved;
    },
    remove(id: string): void {
      const next = shaders.filter((shader) => shader.id !== id);
      if (next.length !== shaders.length) {
        shaders = next;
        persist();
      }
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
