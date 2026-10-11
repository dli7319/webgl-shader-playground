import { describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { ShaderPreview } from "./preview";

function fakeRenderer() {
  return {
    setSize: vi.fn(),
    render: vi.fn(),
    setRenderTarget: vi.fn(),
    dispose: vi.fn(),
    debug: {} as { onShaderError?: unknown },
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
    preview.setFragmentShader("void main() { gl_FragColor = vec4(1.0); }");
    expect(preview.material.fragmentShader).toContain("gl_FragColor");
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

  it("reports GLSL compile errors through the debug hook", () => {
    const renderer = fakeRenderer();
    const errors: (string | null)[] = [];
    new ShaderPreview({
      canvas,
      vertexShader,
      fragmentShader: "void main() {}",
      createRenderer: () => renderer,
      onCompileError: (message) => errors.push(message),
    });

    const onShaderError = renderer.debug.onShaderError as (
      gl: {
        getShaderInfoLog: (s: unknown) => string | null;
        getProgramInfoLog: (p: unknown) => string | null;
      },
      program: unknown,
      vs: unknown,
      fs: unknown
    ) => void;
    const gl = {
      getShaderInfoLog: () => "ERROR: 0:3: 'foo' : undeclared identifier",
      getProgramInfoLog: () => "",
    };
    onShaderError(gl, {}, {}, {});

    expect(errors).toEqual(["ERROR: 0:3: 'foo' : undeclared identifier"]);
  });

  it("clears the compile error on setFragmentShader", () => {
    const renderer = fakeRenderer();
    const errors: (string | null)[] = [];
    const preview = new ShaderPreview({
      canvas,
      vertexShader,
      createRenderer: () => renderer,
      onCompileError: (message) => errors.push(message),
    });
    preview.setFragmentShader("void main() {}");
    expect(errors).toEqual([null]);
  });
});

describe("ShaderPreview — Shadertoy mode", () => {
  const SHADERTOY = `void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    fragColor = vec4(uv, 0.5 + 0.5 * sin(iTime), 1.0);
  }`;

  it("compiles mainImage shaders with the host wrapper", () => {
    const { preview } = makePreview();
    preview.setFragmentShader(SHADERTOY);
    expect(preview.material.fragmentShader).toContain("void mainImage(");
    expect(preview.material.fragmentShader).toContain(
      "mainImage(shadertoyColor, gl_FragCoord.xy)"
    );
  });

  it("provides the full Shadertoy uniform set", () => {
    const { preview } = makePreview();
    preview.setFragmentShader(SHADERTOY);
    for (const name of [
      "iResolution",
      "iTime",
      "iTimeDelta",
      "iFrame",
      "iMouse",
      "iDate",
      "iChannel0",
      "iChannel3",
    ]) {
      expect(preview.material.uniforms[name]).toBeDefined();
    }
  });

  it("switches back to unwrapped source for regular shaders", () => {
    const { preview } = makePreview();
    preview.setFragmentShader(SHADERTOY);
    preview.setFragmentShader("void main() { gl_FragColor = vec4(1.0); }");
    expect(preview.material.fragmentShader).not.toContain("mainImage(");
    expect(preview.material.uniforms.iTime).toBeUndefined();
  });

  it("mirrors the texture across iChannel0-3 and reports its size", () => {
    const { preview } = makePreview();
    preview.setFragmentShader(SHADERTOY);
    const texture = new THREE.Texture();
    texture.image = { width: 64, height: 32 };
    preview.setTexture(texture);
    for (const name of ["iChannel0", "iChannel1", "iChannel2", "iChannel3"]) {
      expect(preview.material.uniforms[name].value).toBe(texture);
    }
    const sizes = preview.material.uniforms.iChannelResolution.value as THREE.Vector3[];
    expect(sizes[0].x).toBe(64);
    expect(sizes[0].y).toBe(32);
  });

  it("tracks iResolution from setSize", () => {
    const { preview } = makePreview();
    preview.setFragmentShader(SHADERTOY);
    preview.setSize(800, 600);
    const resolution = preview.material.uniforms.iResolution.value as THREE.Vector3;
    expect(resolution.x).toBe(800);
    expect(resolution.y).toBe(600);
    expect(resolution.z).toBe(1);
  });
});
