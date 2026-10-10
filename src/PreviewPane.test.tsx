import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PreviewPane } from "./PreviewPane";

afterEach(cleanup);

function renderPane(compileError?: string | null) {
  return render(
    <PreviewPane
      canvasRef={{ current: null }}
      width={1920}
      height={1080}
      onWidthChange={() => {}}
      onHeightChange={() => {}}
      screenshotFilename="screenshot.png"
      onScreenshotFilenameChange={() => {}}
      onCaptureScreenshot={() => {}}
      compileError={compileError}
    />
  );
}

describe("PreviewPane compile error banner", () => {
  it("shows the GLSL error message as an alert", () => {
    renderPane("ERROR: 0:3: 'foo' : undeclared identifier");
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Shader error");
    expect(alert.textContent).toContain("'foo' : undeclared identifier");
  });

  it("renders no banner when the shader compiles", () => {
    renderPane(null);
    expect(screen.queryByRole("alert", { hidden: false })).toBeNull();
  });

  it("renders the screenshot controls regardless of errors", () => {
    renderPane("ERROR: bad shader");
    expect(screen.getByText("Screenshot!")).toBeTruthy();
    expect(screen.getByLabelText("Width")).toBeTruthy();
    expect(screen.getByLabelText("Height")).toBeTruthy();
  });
});
