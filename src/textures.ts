import * as THREE from "three";

import { DEFAULT_TEXTURE_PATH } from "./constants";

export type TextureLoaded = (texture: THREE.Texture) => void;
export type TextureFailed = (message: string) => void;

/**
 * Loads a texture, falling back to the bundled default when the requested one
 * can't be loaded (bad path, unreadable file). Failures always report a
 * human-readable message.
 */
export function loadTextureWithFallback(
  path: string,
  onTexture: TextureLoaded,
  onFailure: TextureFailed,
  loader: THREE.TextureLoader = new THREE.TextureLoader()
): void {
  loader.load(path, onTexture, undefined, () => {
    if (path !== DEFAULT_TEXTURE_PATH) {
      onFailure(`Could not load texture "${path}" — using the default texture instead.`);
      loader.load(DEFAULT_TEXTURE_PATH, onTexture, undefined, () =>
        onFailure(`Could not load the default texture "${DEFAULT_TEXTURE_PATH}".`)
      );
    } else {
      onFailure(`Could not load the default texture "${DEFAULT_TEXTURE_PATH}".`);
    }
  });
}
