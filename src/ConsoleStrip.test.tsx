import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/preact";
import { ConsoleStrip } from "./ConsoleStrip";

afterEach(cleanup);

function renderConsole(
  compileError?: string | null,
  textureError?: string | null,
  screenshotError?: string | null
) {
  return render(
    <ConsoleStrip
      compileError={compileError}
      textureError={textureError}
      screenshotError={screenshotError}
      status={compileError ? "error" : "compiled"}
      runDurationMs={compileError ? null : 3.2}
      width={1920}
      height={1080}
      configDetail="shot: screenshot.png · file: fragment.frag · auto: off"
      recording={false}
    />
  );
}

describe("ConsoleStrip output banners", () => {
  it("shows the GLSL error message as an alert", () => {
    renderConsole("ERROR: 0:3: 'foo' : undeclared identifier");
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Shader error");
    expect(alert.textContent).toContain("'foo' : undeclared identifier");
  });

  it("renders no banner when the shader compiles", () => {
    renderConsole(null);
    expect(screen.queryByRole("alert", { hidden: false })).toBeNull();
  });

  it("shows the texture load failure notice", () => {
    renderConsole(
      null,
      'Could not load texture "bad.png" — using the default texture instead.'
    );
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0].textContent).toContain("Texture error");
    expect(alerts[0].textContent).toContain("bad.png");
  });

  it("shows both notices when both are set", () => {
    renderConsole("ERROR: bad shader", 'Could not load texture "bad.png"');
    expect(screen.getAllByRole("alert")).toHaveLength(2);
  });

  it("shows the screenshot failure notice", () => {
    renderConsole(null, null, 'Unsupported screenshot format: "shot.gif"');
    const alerts = screen.getAllByRole("alert");
    expect(alerts).toHaveLength(1);
    expect(alerts[0].textContent).toContain("Screenshot error");
    expect(alerts[0].textContent).toContain("shot.gif");
  });
});

describe("ConsoleStrip status line", () => {
  it("shows the status bar with compile state and export size", () => {
    renderConsole();
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("Compiled");
    expect(status.textContent).toContain("3 ms");
    expect(status.textContent).toContain("Export 1920×1080");
  });

  it("prints the hidden config state in the status strip", () => {
    renderConsole();
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("shot: screenshot.png");
    expect(status.textContent).toContain("file: fragment.frag");
    expect(status.textContent).toContain("auto: off");
  });

  it("swaps the rec flag in place when recording", () => {
    const { rerender } = renderConsole();
    expect(screen.getByRole("status").textContent).toContain("○ rec");
    rerender(
      <ConsoleStrip
        status="compiled"
        runDurationMs={3.2}
        width={1920}
        height={1080}
        configDetail="shot: screenshot.png"
        recording={true}
      />
    );
    expect(screen.getByRole("status").textContent).toContain("● rec");
  });
});
