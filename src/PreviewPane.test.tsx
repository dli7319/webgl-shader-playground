import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/preact";
import { PreviewPane } from "./PreviewPane";

afterEach(cleanup);

function renderPane(
  compileError?: string | null,
  textureError?: string | null,
  screenshotError?: string | null
) {
  return render(
    <PreviewPane
      canvasRef={{ current: null }}
      width={1920}
      height={1080}
      compileError={compileError}
      textureError={textureError}
      screenshotError={screenshotError}
      status={compileError ? "error" : "compiled"}
      runDurationMs={compileError ? null : 3.2}
      zoomPercent={100}
      onZoomIn={() => {}}
      onZoomOut={() => {}}
      onZoomFit={() => {}}
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

  it("keeps the stage controls rendered alongside error banners", () => {
    // The export settings moved to the inspector (Inspector.test.tsx);
    // the stage keeps its own canvas and zoom cluster regardless of errors.
    renderPane("ERROR: bad shader");
    expect(screen.getByRole("img", { name: "Shader preview output" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Fit" })).toBeTruthy();
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

  it("shows the screenshot failure notice", () => {
    renderPane(null, null, 'Unsupported screenshot format: "shot.gif"');
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0].textContent).toContain("Screenshot error");
    expect(alerts[0].textContent).toContain("shot.gif");
  });

  it("exposes accessible names for the preview and its zoom controls", () => {
    renderPane();
    expect(screen.getByRole("img", { name: "Shader preview output" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeTruthy();
  });

  it("shows the status chip", () => {
    renderPane();
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Compiled");
    expect(status.textContent).toContain("3 ms");
  });
});
