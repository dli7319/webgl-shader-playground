import * as THREE from "three";

import { PREVIEW_CAMERA, PREVIEW_PLANE_SIZE } from "./constants";
import {
  buildShadertoyFragment,
  isShadertoyShader,
  usesAnimationClock,
} from "./shadertoy";
import {
  activePasses,
  composePassSource,
  PASS_ORDER,
  type PassRouting,
  type PassSources,
  type RenderPassId,
} from "./passes";

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

const BLACK = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
BLACK.needsUpdate = true;

/**
 * Minimal plain-three.js preview: an orthographic camera looking at a plane
 * that runs the user's fragment shader over the `tDiffuse` texture.
 *
 * Shadertoy-shaped sources (modern `mainImage`, or legacy `main()` with host
 * uniforms) are wrapped with the Shadertoy uniform set (iTime, iMouse,
 * iChannel0-3, ...) driven by the clock/pointer below, so shaders copied from
 * shadertoy.com run as-is. Multi-pass programs go through `setPasses`: buffer
 * passes render into ping-pong targets in order and feed the image pass's
 * iChannels; self/circular references read the previous frame, which is how
 * Shadertoy persistent buffers work.
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
  private chain: RenderPassId[] = ["image"];
  private chainMaterials = new Map<RenderPassId, THREE.ShaderMaterial>();
  private chainRouting: PassRouting | null = null;
  private bufferTargets = new Map<
    Exclude<RenderPassId, "image">,
    [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget]
  >();
  private writeIndex = new Map<Exclude<RenderPassId, "image">, 0 | 1>();

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
    this.chainMaterials.set("image", this.material);

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
  private buildUniforms(shadertoy: boolean): Record<string, THREE.IUniform> {
    const uniforms: Record<string, THREE.IUniform> = {
      tDiffuse: { value: this.texture },
      opacity: { value: 1.0 },
    };
    if (!shadertoy) {
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
      uniforms: this.buildUniforms(shadertoy),
      side: THREE.DoubleSide,
    });
  }

  setFragmentShader(source: string): void {
    this.setPasses(
      {
        common: "",
        bufferA: "",
        bufferB: "",
        bufferC: "",
        bufferD: "",
        image: source,
      },
      null
    );
  }

  /** Applies a full multi-pass program (Common/Buf A-D/Image) to the preview. */
  setPasses(sources: PassSources, routing: PassRouting | null): void {
    const passes = activePasses(sources);
    const previous = this.chainMaterials;
    this.chainMaterials = new Map();
    this.chainRouting = routing;
    this.chain = passes;

    for (const pass of passes) {
      const composed = composePassSource(sources, pass);
      const shadertoy = isShadertoyShader(composed);
      const wrapped = shadertoy ? buildShadertoyFragment(composed) : composed;
      const existing = previous.get(pass);
      if (existing && existing.fragmentShader === wrapped) {
        this.chainMaterials.set(pass, existing);
      } else {
        this.chainMaterials.set(pass, this.createMaterial(composed, shadertoy));
      }
    }
    for (const [pass, material] of previous) {
      if (this.chainMaterials.get(pass) !== material) {
        material.dispose();
      }
    }
    for (const pass of passes) {
      if (pass !== "image" && !this.bufferTargets.has(pass)) {
        const make = () =>
          new THREE.WebGLRenderTarget(this.width, this.height, {
            depthBuffer: false,
          });
        this.bufferTargets.set(pass, [make(), make()]);
        this.writeIndex.set(pass, 0);
      }
    }

    this.shadertoyMode = isShadertoyShader(composePassSource(sources, "image"));
    this.material = this.chainMaterials.get("image")!;
    this.mesh.material = this.material;

    // Clear any previous error; a failing compile re-reports via the hook.
    this.onCompileError?.(null);
    const animated = passes.some((pass) =>
      usesAnimationClock(composePassSource(sources, pass))
    );
    if (animated) {
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
    for (const material of this.chainMaterials.values()) {
      const uniforms = material.uniforms;
      uniforms.tDiffuse.value = texture;
      const size = texture?.image as { width?: number; height?: number } | undefined;
      const resolution = uniforms.iChannelResolution?.value as
        THREE.Vector3[] | undefined;
      resolution?.forEach((entry) => entry.set(size?.width ?? 1, size?.height ?? 1, 1));
      material.needsUpdate = true;
    }
    this.render();
  }

  setSize(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      return;
    }
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height, false);
    for (const [read, write] of this.bufferTargets.values()) {
      read.setSize(width, height);
      write.setSize(width, height);
    }
    for (const material of this.chainMaterials.values()) {
      const resolution = material.uniforms.iResolution?.value as
        THREE.Vector3 | undefined;
      resolution?.set(width, height, 1);
    }
  }

  /** Advances iTime/iFrame/iDate/iTimeDelta each frame while animating. */
  private readonly tick = (): void => {
    this.rafId = requestAnimationFrame(this.tick);
    const now = performance.now();
    const delta = Math.min(0.1, Math.max(0, (now - this.lastFrameTime) / 1000));
    this.lastFrameTime = now;
    for (const material of this.chainMaterials.values()) {
      const uniforms = material.uniforms;
      if (uniforms.iTime) {
        uniforms.iTime.value = (now - this.startTime) / 1000;
        uniforms.iTimeDelta.value = delta;
        uniforms.iFrame.value = this.frame;
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
    }
    this.frame++;
    this.render();
  };

  /** Resolves the texture for one iChannel of one pass this frame. */
  private channelTexture(
    pass: RenderPassId,
    index: number,
    rendered: Map<RenderPassId, THREE.Texture>
  ): THREE.Texture {
    const source =
      this.chainRouting?.[pass]?.[index] ?? (index === 0 ? "texture" : "none");
    if (source === "none") {
      return BLACK;
    }
    if (source === "texture") {
      return this.texture ?? BLACK;
    }
    // Buffer reference: current frame's output when already rendered,
    // otherwise the previous frame's — Shadertoy persistent-buffer semantics.
    return rendered.get(source) ?? this.previousTexture(source);
  }

  private previousTexture(buffer: Exclude<RenderPassId, "image">): THREE.Texture {
    const targets = this.bufferTargets.get(buffer);
    if (!targets) {
      return BLACK;
    }
    return targets[this.writeIndex.get(buffer) ?? 0].texture;
  }

  render(): void {
    const passes = this.chain;
    if (passes.length <= 1 && this.chainRouting === null) {
      // Single-pass: mirror the playground texture across all channels.
      const uniforms = this.material.uniforms;
      if (uniforms.iChannel0) {
        for (let index = 0; index < 4; index++) {
          uniforms[`iChannel${index}`].value = this.texture ?? BLACK;
        }
      }
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.scene, this.camera);
      return;
    }
    const rendered = new Map<RenderPassId, THREE.Texture>();
    for (const pass of PASS_ORDER) {
      if (!passes.includes(pass)) {
        continue;
      }
      const material = this.chainMaterials.get(pass);
      if (!material) {
        continue;
      }
      const uniforms = material.uniforms;
      if (uniforms.iChannel0) {
        for (let index = 0; index < 4; index++) {
          uniforms[`iChannel${index}`].value = this.channelTexture(pass, index, rendered);
        }
      }
      this.mesh.material = material;
      if (pass === "image") {
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);
      } else {
        const buffer = pass as Exclude<RenderPassId, "image">;
        const targets = this.bufferTargets.get(buffer)!;
        const slot = (this.writeIndex.get(buffer) ?? 0) === 0 ? 1 : 0;
        const target = targets[slot];
        this.renderer.setRenderTarget(target);
        this.renderer.render(this.scene, this.camera);
        rendered.set(pass, target.texture);
        this.writeIndex.set(buffer, slot as 0 | 1);
      }
    }
    this.renderer.setRenderTarget(null);
    this.mesh.material = this.material;
  }

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
    for (const material of this.chainMaterials.values()) {
      const mouse = material.uniforms.iMouse?.value as THREE.Vector4 | undefined;
      mouse?.set(x, y, x, y);
    }
    this.render();
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const { x, y } = this.pointerToPixels(event);
    for (const material of this.chainMaterials.values()) {
      const mouse = material.uniforms.iMouse?.value as THREE.Vector4 | undefined;
      if (mouse) {
        mouse.x = x;
        mouse.y = y;
      }
    }
    this.render();
  };

  private readonly onPointerUp = (): void => {
    this.mouseDown = false;
    for (const material of this.chainMaterials.values()) {
      const mouse = material.uniforms.iMouse?.value as THREE.Vector4 | undefined;
      if (mouse) {
        mouse.z = -Math.abs(mouse.z);
        mouse.w = -Math.abs(mouse.w);
      }
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
    for (const [read, write] of this.bufferTargets.values()) {
      read.dispose();
      write.dispose();
    }
    this.bufferTargets.clear();
    for (const material of this.chainMaterials.values()) {
      material.dispose();
    }
    this.chainMaterials.clear();
    this.geometry.dispose();
    this.renderer.dispose();
  }
}
