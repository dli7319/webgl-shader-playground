import { describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { ShaderPreview } from "./preview";

function fakeRenderer() {
  return {
    setSize: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
    domElement: { toDataURL: vi.fn(() => "data:image/png;base64,") },
  } as unknown as THREE.WebGLRenderer;
}

const canvas = {} as HTMLCanvasElement;
const vertexShader = "void main() { gl_Position = vec4(0.0); }";

function makePreview(fragmentShader = "void main() {}") {
  const renderer = fakeRenderer();
  const preview = new ShaderPreview({
    canvas,
    vertexShader,
    fragmentShader,
    createRenderer: () => renderer,
  });
  return { preview, renderer };
}

describe("ShaderPreview", () => {
  it("builds the scene: plane mesh with a shader material", () => {
    const { preview } = makePreview();
    expect(preview.scene.children).toHaveLength(1);
    const mesh = preview.scene.children[0] as THREE.Mesh;
    expect(mesh.geometry).toBeInstanceOf(THREE.PlaneGeometry);
    expect(mesh.position.z).toBe(-1);
  });

  it("wires the standard uniforms", () => {
    const { preview } = makePreview();
    const uniforms = preview.material.uniforms;
    expect(uniforms.tDiffuse.value).toBeNull();
    expect(uniforms.opacity.value).toBe(1.0);
  });

  it("uses an orthographic camera matching the plane bounds", () => {
    const { preview } = makePreview();
    expect(preview.camera.left).toBe(-5);
    expect(preview.camera.right).toBe(5);
    expect(preview.camera.top).toBe(5);
    expect(preview.camera.bottom).toBe(-5);
    expect(preview.camera.position.z).toBe(1);
    expect(preview.material.side).toBe(THREE.DoubleSide);
  });

  it("setFragmentShader swaps the source and re-renders", () => {
    const { preview, renderer } = makePreview();
    // `needsUpdate` is write-only in three.js; it bumps `version`.
    const versionBefore = preview.material.version;
    preview.setFragmentShader("void main() { gl_FragColor = vec4(1.0); }");
    expect(preview.material.fragmentShader).toContain("gl_FragColor");
    expect(preview.material.version).toBe(versionBefore + 1);
    expect(renderer.render).toHaveBeenCalledWith(preview.scene, preview.camera);
  });

  it("setTexture updates the uniform and re-renders", () => {
    const { preview, renderer } = makePreview();
    const texture = new THREE.Texture();
    preview.setTexture(texture);
    expect(preview.material.uniforms.tDiffuse.value).toBe(texture);
    expect(renderer.render).toHaveBeenCalled();
  });

  it("setSize forwards to the renderer and ignores non-positive sizes", () => {
    const { preview, renderer } = makePreview();
    preview.setSize(640, 480);
    expect(renderer.setSize).toHaveBeenCalledWith(640, 480, false);
    preview.setSize(0, 100);
    expect(renderer.setSize).toHaveBeenCalledTimes(1);
  });

  it("dispose cleans up GPU resources", () => {
    const { preview, renderer } = makePreview();
    preview.dispose();
    expect(renderer.dispose).toHaveBeenCalled();
  });
});
