import * as THREE from "three";

import { PREVIEW_CAMERA, PREVIEW_PLANE_SIZE } from "./constants";

export interface ShaderPreviewOptions {
  canvas: HTMLCanvasElement;
  vertexShader: string;
  fragmentShader?: string;
  texture?: THREE.Texture | null;
  /** Called with a GLSL error message when compilation fails, or null when it clears. */
  onCompileError?: (message: string | null) => void;
  /** Injectable for tests. */
  createRenderer?: (canvas: HTMLCanvasElement) => THREE.WebGLRenderer;
}

export function createPreviewRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  return new THREE.WebGLRenderer({ canvas, antialias: true });
}

/**
 * Minimal plain-three.js preview: an orthographic camera looking at a plane
 * that runs the user's fragment shader over the `tDiffuse` texture.
 */
export class ShaderPreview {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.OrthographicCamera;
  readonly material: THREE.ShaderMaterial;
  private readonly geometry: THREE.PlaneGeometry;
  private readonly mesh: THREE.Mesh;
  private readonly onCompileError?: (message: string | null) => void;

  constructor(options: ShaderPreviewOptions) {
    this.renderer = (options.createRenderer ?? createPreviewRenderer)(options.canvas);
    this.onCompileError = options.onCompileError;
    if (this.renderer.debug) {
      this.renderer.debug.onShaderError = (gl, program, _vs, fs) => {
        const log =
          gl.getShaderInfoLog(fs) ||
          gl.getProgramInfoLog(program) ||
          "Shader compile error";
        this.onCompileError?.(log);
      };
    }
    this.camera = new THREE.OrthographicCamera(
      PREVIEW_CAMERA.left,
      PREVIEW_CAMERA.right,
      PREVIEW_CAMERA.top,
      PREVIEW_CAMERA.bottom,
      PREVIEW_CAMERA.near,
      PREVIEW_CAMERA.far
    );
    this.camera.position.set(0, 0, PREVIEW_CAMERA.positionZ);
    this.camera.rotation.set(0, 0, 0);

    this.material = new THREE.ShaderMaterial({
      vertexShader: options.vertexShader,
      fragmentShader: options.fragmentShader ?? "",
      uniforms: {
        tDiffuse: { value: options.texture ?? null },
        opacity: { value: 1.0 },
      },
      side: THREE.DoubleSide,
    });

    this.geometry = new THREE.PlaneGeometry(PREVIEW_PLANE_SIZE, PREVIEW_PLANE_SIZE);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(0, 0, PREVIEW_CAMERA.meshZ);
    this.scene.add(this.mesh);
  }

  setFragmentShader(source: string): void {
    this.material.fragmentShader = source;
    this.material.needsUpdate = true;
    // Clear any previous error; a failing compile re-reports via the hook.
    this.onCompileError?.(null);
    this.render();
  }

  setTexture(texture: THREE.Texture | null): void {
    this.material.uniforms.tDiffuse.value = texture;
    this.material.needsUpdate = true;
    this.render();
  }

  setSize(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      return;
    }
    this.renderer.setSize(width, height, false);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
