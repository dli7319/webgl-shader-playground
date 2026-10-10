import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { Inspector } from "./Inspector";

afterEach(cleanup);

function renderInspector(overrides: Partial<React.ComponentProps<typeof Inspector>> = {}) {
  return render(
    <Inspector
      shaderSource="void main() {}"
      onApplyShader={() => {}}
      width={1920}
      height={1080}
      onWidthChange={() => {}}
      onHeightChange={() => {}}
      screenshotFilename="screenshot.png"
      onScreenshotFilenameChange={() => {}}
      onCaptureScreenshot={() => {}}
      downloadShaderFilename="fragment.frag"
      onDownloadShaderFilenameChange={() => {}}
      onDownloadShader={() => {}}
      texturePath="cat-7738210_1920.jpg"
      onPickImage={() => {}}
      autoRun={false}
      onToggleAutoRun={() => {}}
      canUndo={false}
      canRedo={false}
      onUndo={() => {}}
      onRedo={() => {}}
      onResetShader={() => {}}
      isRecording={false}
      recordingSupported={true}
      onToggleRecording={() => {}}
      {...overrides}
    />
  );
}

function openSection(name: RegExp) {
  fireEvent.click(screen.getByRole("button", { name }));
}

describe("Inspector state chips", () => {
  it("summarizes every hidden group beside its disclosure", () => {
    renderInspector();
    expect(screen.getByText("1920×1080 · screenshot.png")).toBeTruthy();
    expect(screen.getByText("No saves")).toBeTruthy();
    expect(screen.getByText("Default texture")).toBeTruthy();
    expect(screen.getByText("Auto-run off")).toBeTruthy();
  });

  it("swaps the export chip into a live flag while recording", () => {
    renderInspector({ isRecording: true });
    expect(screen.getByText("1920×1080 · recording")).toBeTruthy();
  });
});

describe("Inspector disclosures", () => {
  it("keeps the export controls collapsed until asked", () => {
    renderInspector();
    expect(screen.queryByRole("button", { name: "Screenshot!" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Download Shader (Ctrl+S)" })).toBeNull();
  });

  it("opens the export group as one object per control cluster", () => {
    renderInspector();
    openSection(/export/i);
    expect(screen.getByLabelText("Screenshot width in pixels")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot height in pixels")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot filename")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Screenshot!" })).toBeTruthy();
    expect(screen.getByLabelText("Shader download filename")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Download Shader (Ctrl+S)" })
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Record (WebM)" })).toBeTruthy();
  });

  it("opens history as one group: name, save, and list", () => {
    renderInspector();
    openSection(/history/i);
    expect(screen.getByLabelText("Shader save name")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save shader" })).toBeTruthy();
    expect(screen.getByText("No saved shaders yet.")).toBeTruthy();
  });

  it("opens the texture picker with its file input", () => {
    renderInspector();
    openSection(/texture/i);
    expect(screen.getByLabelText("Choose a texture image")).toBeTruthy();
    expect(screen.getByText("Pick tDiffuse Image")).toBeTruthy();
  });

  it("opens the editor group with run behavior and source history", () => {
    renderInspector({ autoRun: true, canUndo: true, canRedo: true });
    openSection(/editor/i);
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Redo" })).toBeTruthy();
    expect(screen.getByRole("switch", { name: "Auto-run while typing" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Reset to default shader" })
    ).toBeTruthy();
    expect(screen.getByText("Auto-run on")).toBeTruthy();
  });

  it("collapses again in place without moving anything", () => {
    renderInspector();
    const head = screen.getByRole("button", { name: /export/i });
    fireEvent.click(head);
    expect(screen.getByRole("button", { name: "Screenshot!" })).toBeTruthy();
    fireEvent.click(head);
    expect(screen.queryByRole("button", { name: "Screenshot!" })).toBeNull();
  });
});
