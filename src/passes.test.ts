import { describe, expect, it } from "vitest";
import {
  activePasses,
  composePassSource,
  defaultRouting,
  emptyPassSources,
  PASS_ORDER,
  resolveChannel,
  type PassSources,
} from "./passes";

function sourcesWith(partial: Partial<PassSources>): PassSources {
  return { ...emptyPassSources(), ...partial };
}

describe("activePasses", () => {
  it("always includes the image pass and skips empty buffers", () => {
    expect(activePasses(sourcesWith({}))).toEqual(["image"]);
  });

  it("lists buffers in render order before the image pass", () => {
    const sources = sourcesWith({
      bufferB: "void mainImage(out vec4 c, in vec2 p) { c = vec4(1.0); }",
      bufferA: "void mainImage(out vec4 c, in vec2 p) { c = vec4(0.5); }",
      image: "void mainImage(out vec4 c, in vec2 p) { c = vec4(0.0); }",
    });
    expect(activePasses(sources)).toEqual(["bufferA", "bufferB", "image"]);
    expect(activePasses(sources)).toEqual(
      PASS_ORDER.filter((id) => activePasses(sources).includes(id))
    );
  });

  it("ignores whitespace-only buffer code", () => {
    expect(activePasses(sourcesWith({ bufferC: "  \n\t " }))).toEqual(["image"]);
  });
});

describe("resolveChannel", () => {
  it("maps routing sources to texture kinds", () => {
    expect(resolveChannel("none")).toBe("none");
    expect(resolveChannel("texture")).toBe("texture");
    expect(resolveChannel("bufferA")).toBe("bufferA");
    expect(resolveChannel("bufferD")).toBe("bufferD");
  });

  it("default routing feeds each pass from the playground texture", () => {
    expect(defaultRouting().image).toEqual(["texture", "none", "none", "none"]);
  });
});

describe("composePassSource", () => {
  it("prepends Common code to the pass body", () => {
    const sources = sourcesWith({
      common: "float helper() { return 1.0; }",
      image: "void mainImage(out vec4 c, in vec2 p) { c.x = helper(); }",
    });
    const composed = composePassSource(sources, "image");
    expect(composed.indexOf("float helper()")).toBeLessThan(
      composed.indexOf("void mainImage")
    );
  });

  it("returns the pass body untouched when Common is empty", () => {
    const sources = sourcesWith({ image: "void mainImage() {}" });
    expect(composePassSource(sources, "image")).toBe("void mainImage() {}");
  });
});
