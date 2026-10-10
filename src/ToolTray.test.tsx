import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { ToolTray } from "./ToolTray";

afterEach(cleanup);

function renderTray(overrides: Partial<Parameters<typeof ToolTray>[0]> = {}) {
  return render(
    <ToolTray
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
      isRecording={false}
      recordingSupported={true}
      onToggleRecording={() => {}}
      {...overrides}
    />
  );
}

describe("ToolTray", () => {
  it("summarizes hidden export and download settings beside their openers", () => {
    renderTray();
    // No popover is open: the state must still be readable from the chips.
    expect(screen.queryByLabelText("Screenshot width in pixels")).toBeNull();
    expect(screen.queryByLabelText("Shader download filename")).toBeNull();
    expect(screen.getByRole("button", { name: "Export settings" }).textContent).toContain(
      "1920×1080 · screenshot.png"
    );
    expect(screen.getByRole("button", { name: "Download filename" }).textContent).toContain(
      "fragment.frag"
    );
  });

  it("opens the export settings from its summary chip", () => {
    renderTray();
    fireEvent.click(screen.getByRole("button", { name: "Export settings" }));
    expect(screen.getByLabelText("Width")).toBeTruthy();
    expect(screen.getByLabelText("Height")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot width in pixels")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot height in pixels")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot filename")).toBeTruthy();
    // The capture actions stay visible while the settings are open.
    expect(screen.getByRole("button", { name: "Screenshot!" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Record (WebM)" })).toBeTruthy();
  });

  it("opens the download filename from its summary chip", () => {
    renderTray();
    fireEvent.click(screen.getByRole("button", { name: "Download filename" }));
    expect(screen.getByLabelText("Shader download filename")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Download Shader (Ctrl+S)" })).toBeTruthy();
  });

  it("renders the capture and material tools without opening anything", () => {
    renderTray();
    expect(screen.getByRole("button", { name: "Screenshot!" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Record (WebM)" })).toBeTruthy();
    expect(screen.getByLabelText("Choose a texture image")).toBeTruthy();
    expect(screen.getByText(/Pick tDiffuse Image/)).toBeTruthy();
    expect(screen.getByText(/tDiffuse · cat-7738210_1920\.jpg/)).toBeTruthy();
  });

  it("swaps the record label in place while recording", () => {
    renderTray({ isRecording: true });
    expect(screen.getByRole("button", { name: "Stop recording" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Record (WebM)" })).toBeNull();
  });
});
