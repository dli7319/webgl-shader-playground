import * as THREE from "three";

import { PREVIEW_CAMERA, PREVIEW_PLANE_SIZE } from "./constants";
import {
  buildShadertoyFragment,
  isShadertoyShader,
  usesAnimationClock,
} from "./shadertoy";

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
 *
 * Shadertoy-shaped sources (a `mainImage` entry point) are compiled as GLSL ES
 * 3.00 with the Shadertoy uniform set (iTime, iResolution, iMouse, iChannel0-3,
 * ...) driven by the clock/pointer below, so shaders copied from shadertoy.com
 * run as-is.
 */
export class ShaderPreview {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.OrthographicCamera;
  material: THREE.ShaderMaterial;
  private readonly vertexShader: string;
  private readonly geometry: THREE.PlaneGeometry;
  private readonly mesh: THREE.Mesh;
  private readonly onCompileError?: (message: string | null) => void;
  private shadertoyMode = false;
  private width = 1;
  private height = 1;
  private rafId: number | null = null;
  private lastFrameTime = 0;
  private readonly startTime = performance.now();
  private frame = 0;
  private mouseDown = false;
  private texture: THREE.Texture | null;

  constructor(options: ShaderPreviewOptions) {
    this.renderer = (options.createRenderer ?? createPreviewRenderer)(options.canvas);
    this.onCompileError = options.onCompileError;
    this.vertexShader = options.vertexShader;
    this.texture = options.texture ?? null;
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

    this.material = this.createMaterial(
      options.fragmentShader ?? "",
      isShadertoyShader(options.fragmentShader ?? "")
    );

    this.geometry = new THREE.PlaneGeometry(PREVIEW_PLANE_SIZE, PREVIEW_PLANE_SIZE);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(0, 0, PREVIEW_CAMERA.meshZ);
    this.scene.add(this.mesh);

    const surface = this.renderer.domElement as unknown as {
      addEventListener?: (type: string, handler: (event: PointerEvent) => void) => void;
      removeEventListener?: (
        type: string,
        handler: (event: PointerEvent) => void
      ) => void;
    };
    if (typeof surface.addEventListener === "function") {
      surface.addEventListener("pointerdown", this.onPointerDown);
      surface.addEventListener("pointermove", this.onPointerMove);
      surface.addEventListener("pointerup", this.onPointerUp);
    }
  }

  /** Uniform set for the active mode. Shadertoy adds the i* host uniforms. */
  private buildUniforms(): Record<string, THREE.IUniform> {
    const uniforms: Record<string, THREE.IUniform> = {
      tDiffuse: { value: this.texture },
      opacity: { value: 1.0 },
    };
    if (!this.shadertoyMode) {
      return uniforms;
    }
    const size = this.texture?.image as { width?: number; height?: number } | undefined;
    const channelSize = new THREE.Vector3(size?.width ?? 1, size?.height ?? 1, 1);
    return {
      ...uniforms,
      iResolution: { value: new THREE.Vector3(this.width, this.height, 1) },
      iTime: { value: 0 },
      iTimeDelta: { value: 0 },
      iFrame: { value: 0 },
      iFrameRate: { value: 60 },
      iSampleRate: { value: 44100 },
      iMouse: { value: new THREE.Vector4() },
      iDate: { value: new THREE.Vector4() },
      iChannelTime: { value: [0, 0, 0, 0] },
      iChannelResolution: {
        value: [
          channelSize.clone(),
          channelSize.clone(),
          channelSize.clone(),
          channelSize.clone(),
        ],
      },
      iChannel0: { value: this.texture },
      iChannel1: { value: this.texture },
      iChannel2: { value: this.texture },
      iChannel3: { value: this.texture },
    };
  }

  private createMaterial(source: string, shadertoy: boolean): THREE.ShaderMaterial {
    // Note: three compiles ShaderMaterial as GLSL ES 3.00 with `gl_FragColor`
    // / `texture2D` compatibility macros by default — exactly what Shadertoy
    // code needs (native `texture()`/`textureLod` + classic idioms). Setting
    // `glslVersion: GLSL3` explicitly would REMOVE those macros; don't.
    return new THREE.ShaderMaterial({
      vertexShader: this.vertexShader,
      fragmentShader: shadertoy ? buildShadertoyFragment(source) : source,
      uniforms: this.buildUniforms(),
      side: THREE.DoubleSide,
    });
  }

  setFragmentShader(source: string): void {
    const shadertoy = isShadertoyShader(source);
    if (shadertoy !== this.shadertoyMode) {
      const previous = this.material;
      this.shadertoyMode = shadertoy;
      this.material = this.createMaterial(source, shadertoy);
      this.mesh.material = this.material;
      previous.dispose();
    } else {
      this.material.fragmentShader = shadertoy ? buildShadertoyFragment(source) : source;
      this.material.needsUpdate = true;
    }
    // Clear any previous error; a failing compile re-reports via the hook.
    this.onCompileError?.(null);
    if (shadertoy && usesAnimationClock(source)) {
      this.startClock();
    } else {
      this.stopClock();
    }
    if (this.rafId === null) {
      this.render();
    }
  }

  setTexture(texture: THREE.Texture | null): void {
    this.texture = texture;
    const uniforms = this.material.uniforms;
    uniforms.tDiffuse.value = texture;
    for (const name of ["iChannel0", "iChannel1", "iChannel2", "iChannel3"]) {
      if (uniforms[name]) {
        uniforms[name].value = texture;
      }
    }
    const size = texture?.image as { width?: number; height?: number } | undefined;
    const resolution = uniforms.iChannelResolution?.value as THREE.Vector3[] | undefined;
    resolution?.forEach((entry) => entry.set(size?.width ?? 1, size?.height ?? 1, 1));
    this.material.needsUpdate = true;
    this.render();
  }

  setSize(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      return;
    }
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height, false);
    const resolution = this.material.uniforms.iResolution?.value as
      THREE.Vector3 | undefined;
    resolution?.set(width, height, 1);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /** Advances iTime/iFrame/iDate/iTimeDelta each frame while animating. */
  private readonly tick = (): void => {
    this.rafId = requestAnimationFrame(this.tick);
    const now = performance.now();
    const delta = Math.min(0.1, Math.max(0, (now - this.lastFrameTime) / 1000));
    this.lastFrameTime = now;
    const uniforms = this.material.uniforms;
    if (uniforms.iTime) {
      uniforms.iTime.value = (now - this.startTime) / 1000;
      uniforms.iTimeDelta.value = delta;
      uniforms.iFrame.value = this.frame++;
      uniforms.iFrameRate.value = delta > 0 ? 1 / delta : 60;
      const date = new Date();
      uniforms.iDate.value.set(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours() * 3600 +
          date.getMinutes() * 60 +
          date.getSeconds() +
          date.getMilliseconds() / 1000
      );
    }
    this.render();
  };

  private startClock(): void {
    if (this.rafId !== null) {
      return;
    }
    this.lastFrameTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  private stopClock(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /** Pointer position in Shadertoy pixel coordinates (origin bottom-left). */
  private pointerToPixels(event: PointerEvent): { x: number; y: number } {
    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    const width = this.renderer.domElement.width;
    const height = this.renderer.domElement.height;
    const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * width;
    const y = height - ((event.clientY - rect.top) / Math.max(1, rect.height)) * height;
    return { x, y };
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.mouseDown = true;
    const { x, y } = this.pointerToPixels(event);
    const mouse = this.material.uniforms.iMouse?.value as THREE.Vector4 | undefined;
    mouse?.set(x, y, x, y);
    this.render();
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const { x, y } = this.pointerToPixels(event);
    const mouse = this.material.uniforms.iMouse?.value as THREE.Vector4 | undefined;
    if (mouse) {
      mouse.x = x;
      mouse.y = y;
      this.render();
    }
  };

  private readonly onPointerUp = (): void => {
    this.mouseDown = false;
    const mouse = this.material.uniforms.iMouse?.value as THREE.Vector4 | undefined;
    if (mouse) {
      mouse.z = -Math.abs(mouse.z);
      mouse.w = -Math.abs(mouse.w);
    }
    this.render();
  };

  dispose(): void {
    this.stopClock();
    const surface = this.renderer.domElement as unknown as {
      removeEventListener?: (
        type: string,
        handler: (event: PointerEvent) => void
      ) => void;
    };
    surface.removeEventListener?.("pointerdown", this.onPointerDown);
    surface.removeEventListener?.("pointermove", this.onPointerMove);
    surface.removeEventListener?.("pointerup", this.onPointerUp);
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
