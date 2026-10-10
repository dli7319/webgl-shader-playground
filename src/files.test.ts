import { describe, expect, it } from "vitest";
import {
  imageExtensionToMime,
  isSupportedImageFilename,
  mimeTypeForImageFilename,
} from "./files";

describe("mimeTypeForImageFilename", () => {
  it("maps supported extensions to MIME types", () => {
    expect(mimeTypeForImageFilename("screenshot.png")).toBe("image/png");
    expect(mimeTypeForImageFilename("photo.jpg")).toBe("image/jpeg");
    expect(mimeTypeForImageFilename("photo.jpeg")).toBe("image/jpeg");
  });

  it("is case-insensitive", () => {
    expect(mimeTypeForImageFilename("Screenshot.PNG")).toBe("image/png");
    expect(mimeTypeForImageFilename("PHOTO.JPG")).toBe("image/jpeg");
  });

  it("uses the extension after the last dot", () => {
    expect(mimeTypeForImageFilename("my.photo.final.png")).toBe("image/png");
  });

  it("rejects filenames without an extension", () => {
    expect(mimeTypeForImageFilename("screenshot")).toBeNull();
    expect(mimeTypeForImageFilename("")).toBeNull();
  });

  it("rejects empty or trailing-dot extensions", () => {
    expect(mimeTypeForImageFilename("screenshot.")).toBeNull();
    expect(mimeTypeForImageFilename(".png")).toBeNull();
  });

  it("rejects unsupported extensions", () => {
    expect(mimeTypeForImageFilename("screenshot.gif")).toBeNull();
    expect(mimeTypeForImageFilename("screenshot.webp")).toBeNull();
    expect(mimeTypeForImageFilename("screenshot.txt")).toBeNull();
  });
});

describe("isSupportedImageFilename", () => {
  it("mirrors the MIME lookup", () => {
    expect(isSupportedImageFilename("a.png")).toBe(true);
    expect(isSupportedImageFilename("a.gif")).toBe(false);
  });
});

describe("imageExtensionToMime", () => {
  it("covers the exporter formats", () => {
    expect(Object.keys(imageExtensionToMime).sort()).toEqual(["jpeg", "jpg", "png"]);
  });
});
