/**
 * Shadertoy compatibility: run a shader copied from shadertoy.com as-is.
 *
 * Shadertoy shaders define `void mainImage(out vec4 fragColor, in vec2
 * fragCoord)` and rely on a fixed set of uniforms the host injects. This
 * module detects that shape, strips a few things that conflict with the host
 * prolog, and wraps the code in a `main()` with the uniform declarations.
 *
 * The wrapped source is compiled as GLSL ES 3.00 (see preview.ts), where the
 * three.js renderer provides `gl_FragColor`/`texture2D` compatibility macros,
 * so both classic (`texture2D`) and modern (`texture`, `textureLod`,
 * `texelFetch`) Shadertoy idioms compile unchanged.
 */

export const SHADERTOY_UNIFORM_DECLARATIONS = `uniform vec3 iResolution;
uniform float iTime;
uniform float iTimeDelta;
uniform float iFrame;
uniform float iFrameRate;
uniform float iSampleRate;
uniform vec3 iChannelResolution[4];
uniform float iChannelTime[4];
uniform vec4 iMouse;
uniform vec4 iDate;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
uniform sampler2D iChannel3;`;

/** Uniform names the host provides; user re-declarations of these are dropped. */
export const SHADERTOY_UNIFORM_NAMES = [
  "iResolution",
  "iTime",
  "iTimeDelta",
  "iFrame",
  "iFrameRate",
  "iSampleRate",
  "iChannelResolution",
  "iChannelTime",
  "iMouse",
  "iDate",
  "iChannel0",
  "iChannel1",
  "iChannel2",
  "iChannel3",
  "iGlobalTime",
] as const;

const SHADERTOY_WRAPPER = `void main() {
  vec4 shadertoyColor = vec4(0.0);
  mainImage(shadertoyColor, gl_FragCoord.xy);
  gl_FragColor = shadertoyColor;
}`;

/**
 * True for Shadertoy sources in either dialect:
 *  - modern: defines `mainImage(out vec4, in vec2)` and no main();
 *  - legacy (pre-2014): defines `main()` but relies on Shadertoy host
 *    uniforms (iResolution, iGlobalTime, iMouse, ...) being pre-declared.
 */
export function isShadertoyShader(source: string): boolean {
  const hasMainImage = /void\s+mainImage\s*\(/.test(source);
  const hasMain = /void\s+main\s*\(/.test(source);
  if (hasMainImage && !hasMain) {
    return true;
  }
  return hasMain && referencesHostUniforms(source);
}

/** True when the source uses Shadertoy host uniforms. */
export function referencesHostUniforms(source: string): boolean {
  return new RegExp(`\\b(${SHADERTOY_UNIFORM_NAMES.join("|")})\\b`).test(source);
}

/** Strips directives that must lead a shader or conflict with the host prolog. */
function stripDirectives(source: string): string {
  return source
    .split("\n")
    .filter((line) => !/^\s*#\s*(version|extension)\b/.test(line))
    .join("\n");
}

/** Drops user re-declarations of host-provided uniforms (duplicate = error). */
function stripUniformDeclarations(source: string): string {
  const names = SHADERTOY_UNIFORM_NAMES.join("|");
  const declaration = new RegExp(
    `^\\s*uniform\\s+\\w+\\s+(?:\\[\\s*\\d+\\s*\\]\\s*)?(?:${names})\\s*(?:\\[\\s*\\d+\\s*\\])?\\s*;\\s*$`,
    "gm"
  );
  return source.replace(declaration, "");
}

/**
 * Wraps Shadertoy source into a standalone fragment shader. Order matters:
 * host uniforms first, then the user's code, then main() calling mainImage().
 * Legacy sources (own main() writing gl_FragColor) are prefixed with the
 * uniforms and compiled as-is — no wrapper is added.
 */
export function buildShadertoyFragment(source: string): string {
  const cleaned = stripUniformDeclarations(stripDirectives(source));
  const header = [
    SHADERTOY_UNIFORM_DECLARATIONS,
    // Legacy Shadertoy name kept working before it was renamed.
    "#define iGlobalTime iTime",
  ].join("\n");
  if (!/void\s+mainImage\s*\(/.test(cleaned)) {
    return [header, cleaned].join("\n");
  }
  return [header, cleaned, SHADERTOY_WRAPPER].join("\n");
}

/**
 * True when the shader's output depends on the animation clock (time/frame),
 * which is the signal to keep rendering every frame instead of on demand.
 */
export function usesAnimationClock(source: string): boolean {
  return /\bi(Time|TimeDelta|Frame|FrameRate)\b|\biGlobalTime\b/.test(source);
}
