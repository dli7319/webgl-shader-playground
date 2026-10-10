import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PreviewPane } from "./PreviewPane";

afterEach(cleanup);

function renderPane(compileError?: string | null, textureError?: string | null) {
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
      textureError={textureError}
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

  it("shows the texture load failure notice", () => {
    renderPane(
      null,
      'Could not load texture "bad.png" — using the default texture instead.'
    );
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0].textContent).toContain("Texture error");
    expect(alerts[0].textContent).toContain("bad.png");
  });

  it("shows both notices when both are set", () => {
    renderPane("ERROR: bad shader", 'Could not load texture "bad.png"');
    expect(screen.getAllByRole("alert")).toHaveLength(2);
  });
});
