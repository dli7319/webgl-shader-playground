import React from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { ModuleStack, type ModuleStackProps } from "./ModuleStack";
import { DEFAULT_TEXTURE_PATH } from "./constants";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

function renderStack(overrides: Partial<ModuleStackProps> = {}) {
  const noop = () => {};
  return render(
    <ModuleStack
      width={1920}
      height={1080}
      onWidthChange={noop}
      onHeightChange={noop}
      screenshotFilename="screenshot.png"
      onScreenshotFilenameChange={noop}
      onCaptureScreenshot={noop}
      downloadShaderFilename="fragment.frag"
      onDownloadShaderFilenameChange={noop}
      onDownloadShader={noop}
      currentSource="void main() {}"
      onApplySource={noop}
      canUndo={false}
      canRedo={false}
      onUndo={noop}
      onRedo={noop}
      onResetShader={noop}
      autoRun={true}
      onToggleAutoRun={noop}
      onPickImage={noop}
      texturePath={DEFAULT_TEXTURE_PATH}
      {...overrides}
    />
  );
}

function openModule(name: RegExp) {
  const header = screen.getByRole("button", { name });
  fireEvent.click(header);
  return header;
}

describe("ModuleStack readout headers", () => {
  it("collapses every module at rest and reports hidden state in the header", () => {
    renderStack();
    // State summaries — the hidden controls' state stays on the surface.
    expect(screen.getByText("1920×1080 · screenshot.png · fragment.frag")).toBeTruthy();
    expect(screen.getByText("no saves")).toBeTruthy();
    expect(screen.getByText("auto-run on · tDiffuse default")).toBeTruthy();
    // Collapsed: controls are out of the accessibility tree…
    expect(screen.queryByRole("button", { name: "Screenshot!" })).toBeNull();
    expect(screen.queryByRole("switch", { name: "Auto-run while typing" })).toBeNull();
    // …but every asserted string still survives in the DOM.
    expect(screen.getByText("Screenshot!")).toBeTruthy();
    expect(screen.getByText("Reset to default shader")).toBeTruthy();
    expect(screen.getByText("Save shader")).toBeTruthy();
  });

  it("flips aria-expanded when a module is opened", () => {
    renderStack();
    const header = openModule(/^output/i);
    expect(header.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("button", { name: "Screenshot!" })).toBeTruthy();
  });
});

describe("OUTPUT module", () => {
  it("keeps export size + filenames + screenshot as one group", () => {
    renderStack();
    openModule(/^output/i);
    expect(screen.getByLabelText("Screenshot width in pixels")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot height in pixels")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot filename")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Screenshot!" })).toBeTruthy();
  });

  it("keeps shader filename + download as one group with exact text", () => {
    renderStack();
    openModule(/^output/i);
    expect(screen.getByLabelText("Shader download filename")).toBeTruthy();
    const download = screen.getByRole("button", { name: "Download Shader (Ctrl+S)" });
    expect(download.textContent).toBe("Download Shader (Ctrl+S)");
  });
});

describe("HISTORY module", () => {
  it("groups edit transport, named saves, and the destructive reset", () => {
    renderStack();
    openModule(/^history/i);
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Redo" })).toBeTruthy();
    expect(screen.getByLabelText("Shader save name")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save shader" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reset to default shader" })).toBeTruthy();
  });

  it("shows a neutral empty state with the save affordance right there", () => {
    renderStack();
    openModule(/^history/i);
    expect(screen.getByText("No saved shaders yet.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save shader" })).toBeTruthy();
  });

  it("disables Undo/Redo from canUndo/canRedo state", () => {
    renderStack();
    openModule(/^history/i);
    expect((screen.getByRole("button", { name: "Undo" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Redo" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("INPUT module", () => {
  it("keeps the auto-run switch and texture pick together", () => {
    renderStack();
    openModule(/^input/i);
    expect(screen.getByRole("switch", { name: "Auto-run while typing" })).toBeTruthy();
    expect(screen.getByLabelText("Choose a texture image")).toBeTruthy();
  });

  it("summarizes a custom texture in the readout header", () => {
    renderStack({ texturePath: "data:image/png;base64,xyz", autoRun: false });
    expect(screen.getByText("auto-run off · tDiffuse custom image")).toBeTruthy();
  });
});
