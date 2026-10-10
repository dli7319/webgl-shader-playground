import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  downloadDataUrlFile,
  downloadTextFile,
  textToDataUrl,
  triggerDownload,
} from "./download";

describe("textToDataUrl", () => {
  it("produces a plain-text data URL", () => {
    expect(textToDataUrl("hello")).toBe("data:text/plain,hello");
  });

  it("percent-encodes special characters", () => {
    expect(textToDataUrl("a b&c=d")).toBe("data:text/plain,a%20b%26c%3Dd");
    expect(textToDataUrl("§")).toBe("data:text/plain,%C2%A7");
  });

  it("round-trips GLSL source", () => {
    const shader = "void main() {\n  gl_FragColor = vec4(1.0);\n}\n";
    const url = textToDataUrl(shader);
    expect(decodeURIComponent(url.slice("data:text/plain,".length))).toBe(shader);
  });
});

describe("triggerDownload", () => {
  let clickSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    clickSpy.mockRestore();
  });

  it("creates an anchor with the filename and href and clicks it", () => {
    triggerDownload("shader.frag", "data:text/plain,void%20main()");

    expect(clickSpy).toHaveBeenCalledTimes(1);
    // The anchor is not attached to the DOM; verify via the spy's `this`.
    const anchor = clickSpy.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toBe("shader.frag");
    expect(anchor.href).toContain("data:text/plain,void%20main()");
  });
});

describe("downloadTextFile", () => {
  it("combines encoding and triggering", () => {
    const spy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    downloadTextFile("fragment.frag", "x < y");
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

describe("downloadDataUrlFile", () => {
  it("passes data URLs through unchanged", () => {
    const spy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    downloadDataUrlFile("shot.png", "data:image/png;base64,AAAA");
    const anchor = spy.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toBe("shot.png");
    expect(anchor.href).toContain("data:image/png;base64,AAAA");
    spy.mockRestore();
  });
});
