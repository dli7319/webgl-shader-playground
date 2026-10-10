import { describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { loadTextureWithFallback } from "./textures";
import { DEFAULT_TEXTURE_PATH } from "./constants";

type LoadFn = (
  url: string,
  onLoad: (texture: THREE.Texture) => void,
  onProgress?: unknown,
  onError?: () => void
) => void;

function fakeLoader(behavior: Record<string, "ok" | "fail">) {
  const loaded: string[] = [];
  const load: LoadFn = (url, onLoad, _progress, onError) => {
    loaded.push(url);
    if (behavior[url] === "fail") {
      onError?.();
    } else {
      onLoad(new THREE.Texture());
    }
  };
  return { loader: { load } as unknown as THREE.TextureLoader, loaded };
}

describe("loadTextureWithFallback", () => {
  it("reports the texture on success", () => {
    const { loader } = fakeLoader({ "good.png": "ok" });
    const onTexture = vi.fn();
    const onFailure = vi.fn();
    loadTextureWithFallback("good.png", onTexture, onFailure, loader);
    expect(onTexture).toHaveBeenCalledTimes(1);
    expect(onFailure).not.toHaveBeenCalled();
  });

  it("falls back to the default texture when the requested one fails", () => {
    const { loader, loaded } = fakeLoader({
      "bad.png": "fail",
      [DEFAULT_TEXTURE_PATH]: "ok",
    });
    const onTexture = vi.fn();
    const onFailure = vi.fn();
    loadTextureWithFallback("bad.png", onTexture, onFailure, loader);

    expect(loaded).toEqual(["bad.png", DEFAULT_TEXTURE_PATH]);
    expect(onTexture).toHaveBeenCalledTimes(1);
    expect(onFailure).toHaveBeenCalledWith(expect.stringContaining("bad.png"));
  });

  it("reports when the default texture itself fails", () => {
    const { loader, loaded } = fakeLoader({ [DEFAULT_TEXTURE_PATH]: "fail" });
    const onTexture = vi.fn();
    const onFailure = vi.fn();
    loadTextureWithFallback(DEFAULT_TEXTURE_PATH, onTexture, onFailure, loader);

    expect(loaded).toEqual([DEFAULT_TEXTURE_PATH]);
    expect(onTexture).not.toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalledWith(expect.stringContaining("default texture"));
  });

  it("reports a double failure when both requested and default fail", () => {
    const { loader } = fakeLoader({
      "bad.png": "fail",
      [DEFAULT_TEXTURE_PATH]: "fail",
    });
    const onTexture = vi.fn();
    const onFailure = vi.fn();
    loadTextureWithFallback("bad.png", onTexture, onFailure, loader);

    expect(onTexture).not.toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalledTimes(2);
  });
});
