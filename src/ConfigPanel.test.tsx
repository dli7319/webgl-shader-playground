import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { ConfigPanel } from "./ConfigPanel";

afterEach(cleanup);

function renderPanel(overrides: Partial<Parameters<typeof ConfigPanel>[0]> = {}) {
  return render(
    <ConfigPanel
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
      onPickImage={() => {}}
      textureLabel="default texture"
      autoRun={false}
      onToggleAutoRun={() => {}}
      onResetShader={() => {}}
      onOpenSettings={() => {}}
      {...overrides}
    />
  );
}

describe("ConfigPanel (disclosed config groups)", () => {
  it("renders the capture controls", () => {
    renderPanel();
    expect(screen.getByText("Screenshot!")).toBeTruthy();
    expect(screen.getByLabelText("Width")).toBeTruthy();
    expect(screen.getByLabelText("Height")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot filename")).toBeTruthy();
  });

  it("exposes accessible names for the capture, file, and texture controls", () => {
    renderPanel();
    expect(screen.getByLabelText("Screenshot width in pixels")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot height in pixels")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot filename")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Screenshot!" })).toBeTruthy();
    expect(screen.getByLabelText("Shader download filename")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Download Shader (Ctrl+S)" })
    ).toBeTruthy();
    expect(screen.getByLabelText("Choose a texture image")).toBeTruthy();
  });

  it("keeps every object's controls in one group", () => {
    renderPanel();
    expect(screen.getByRole("switch", { name: "Auto-run while typing" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Reset to default shader" })
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Settings" })).toBeTruthy();
  });

  it("wires the capture and export actions", () => {
    const onCaptureScreenshot = vi.fn();
    const onDownloadShader = vi.fn();
    const onWidthChange = vi.fn();
    renderPanel({ onCaptureScreenshot, onDownloadShader, onWidthChange });
    fireEvent.click(screen.getByRole("button", { name: "Screenshot!" }));
    fireEvent.click(screen.getByRole("button", { name: "Download Shader (Ctrl+S)" }));
    fireEvent.input(screen.getByLabelText("Screenshot width in pixels"), {
      target: { value: "256" },
    });
    expect(onCaptureScreenshot).toHaveBeenCalledTimes(1);
    expect(onDownloadShader).toHaveBeenCalledTimes(1);
    expect(onWidthChange).toHaveBeenCalledWith(256);
  });
});
