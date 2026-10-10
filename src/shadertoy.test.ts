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

  it("claims legacy Shadertoy shaders (main + host uniforms)", () => {
    // iq's "Raymarching primitives" (Xds3zN) in its original 2013 form.
    const legacy = `
void main( void )
{
    vec2 q = gl_FragCoord.xy/iResolution.xy;
    vec2 mo = iMouse.xy/iResolution.xy;
    float time = 15.0 + iGlobalTime;
    gl_FragColor = vec4( q, time + mo.x, 1.0 );
}`;
    expect(isShadertoyShader(legacy)).toBe(true);
  });

  it("does not claim plain shaders that merely mention nothing host-like", () => {
    expect(isShadertoyShader("void main() { gl_FragColor = vec4(1.0); }")).toBe(false);
    expect(isShadertoyShader("uniform sampler2D tDiffuse;\nvoid main() {}")).toBe(false);
  });
});

describe("buildShadertoyFragment — legacy dialect", () => {
  const legacy = `uniform vec3 iResolution;
void main( void )
{
    gl_FragColor = vec4( iResolution.xy / 100.0, iGlobalTime, 1.0 );
}`;

  it("prefixes uniforms but adds no mainImage wrapper", () => {
    const built = buildShadertoyFragment(legacy);
    expect(built).toContain("uniform vec3 iResolution;");
    expect(built.match(/uniform vec3 iResolution;/g)).toHaveLength(1);
    expect(built).toContain("#define iGlobalTime iTime");
    expect(built).toContain("void main( void )");
    expect(built).not.toContain("SHADERTOY_WRAPPER");
    expect(built).not.toContain("mainImage(shadertoyColor");
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
