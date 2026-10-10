import { describe, expect, it } from "vitest";
import {
  buildShadertoyFragment,
  isShadertoyShader,
  SHADERTOY_UNIFORM_DECLARATIONS,
  usesAnimationClock,
} from "./shadertoy";

const SEASCAPE_LIKE = `
// Classic Shadertoy shape: helpers + mainImage only, no uniforms declared.
#define NUM_STEPS 3

float sdSphere(vec3 p, float r) { return length(p) - r; }

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord / iResolution.xy;
    float t = iGlobalTime;
    fragColor = vec4(uv, sin(t), 1.0);
}`;

describe("isShadertoyShader", () => {
  it("detects the mainImage shape", () => {
    expect(isShadertoyShader(SEASCAPE_LIKE)).toBe(true);
  });

  it("leaves regular shaders alone", () => {
    expect(isShadertoyShader("void main() { gl_FragColor = vec4(1.0); }")).toBe(false);
    expect(isShadertoyShader("uniform sampler2D tDiffuse;")).toBe(false);
  });

  it("does not claim shaders that define both entry points", () => {
    const both = "void mainImage(out vec4 c, in vec2 p) {}\nvoid main() {}";
    expect(isShadertoyShader(both)).toBe(false);
  });
});

describe("buildShadertoyFragment", () => {
  it("wraps user code between the uniform block and main()", () => {
    const built = buildShadertoyFragment(SEASCAPE_LIKE);
    const uniformAt = built.indexOf(SHADERTOY_UNIFORM_DECLARATIONS);
    const userAt = built.indexOf("float sdSphere");
    const wrapperAt = built.indexOf("void main()");
    expect(uniformAt).toBeGreaterThanOrEqual(0);
    expect(userAt).toBeGreaterThan(uniformAt);
    expect(wrapperAt).toBeGreaterThan(userAt);
    expect(built).toContain("mainImage(shadertoyColor, gl_FragCoord.xy)");
  });

  it("aliases the legacy iGlobalTime name", () => {
    expect(buildShadertoyFragment(SEASCAPE_LIKE)).toContain("#define iGlobalTime iTime");
  });

  it("strips version and extension directives", () => {
    const built = buildShadertoyFragment(
      "#version 120\n#extension GL_OES_standard_derivatives : enable\nvoid mainImage(out vec4 c, in vec2 p) {}"
    );
    expect(built).not.toContain("#version");
    expect(built).not.toContain("#extension");
  });

  it("strips user re-declarations of host uniforms", () => {
    const built = buildShadertoyFragment(
      "uniform float iTime;\nuniform vec3 iResolution;\nuniform sampler2D iChannel0;\nuniform sampler2D tDiffuse;\nvoid mainImage(out vec4 c, in vec2 p) { c = texture(iChannel0, p); }"
    );
    // Non-host uniforms are kept.
    expect(built).toContain("uniform sampler2D tDiffuse;");
    // Each host uniform is declared exactly once (host block only).
    expect(built.match(/uniform float iTime;/g)).toHaveLength(1);
    expect(built.match(/uniform vec3 iResolution;/g)).toHaveLength(1);
    expect(built.match(/uniform sampler2D iChannel0;/g)).toHaveLength(1);
  });

  it("keeps array-shaped host declarations", () => {
    const built = buildShadertoyFragment(
      "uniform vec3 iChannelResolution[4];\nvoid mainImage(out vec4 c, in vec2 p) {}"
    );
    expect(built.match(/uniform vec3 iChannelResolution\[4\];/g)).toHaveLength(1);
  });
});

describe("usesAnimationClock", () => {
  it("flags time/frame-driven shaders", () => {
    expect(usesAnimationClock(SEASCAPE_LIKE)).toBe(true);
    expect(
      usesAnimationClock("void mainImage(out vec4 c, in vec2 p) { c.x = float(iFrame); }")
    ).toBe(true);
  });

  it("leaves static shaders on the on-demand path", () => {
    expect(
      usesAnimationClock("void mainImage(out vec4 c, in vec2 p) { c = vec4(1.0); }")
    ).toBe(false);
  });
});
