import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/preact";
import { ExportSheet, type ExportSheetProps } from "./ExportSheet";

afterEach(cleanup);

function renderSheet(overrides: Partial<ExportSheetProps> = {}) {
  return render(
    <ExportSheet
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
      recordingSupported={true}
      isRecording={false}
      onToggleRecording={() => {}}
      onClose={() => {}}
      {...overrides}
    />
  );
}

describe("Export sheet", () => {
  // Replaces the old PreviewPane expectation: the screenshot group moved from
  // the preview pane into this sheet (opened from the dock) — same controls.
  it("renders the full screenshot export group", () => {
    renderSheet();
    expect(screen.getByRole("button", { name: "Screenshot!" })).toBeTruthy();
    expect(screen.getByLabelText("Width")).toBeTruthy();
    expect(screen.getByLabelText("Height")).toBeTruthy();
  });

  it("exposes accessible names for the export controls", () => {
    renderSheet();
    expect(screen.getByLabelText("Screenshot width in pixels")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot height in pixels")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot filename")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Screenshot!" })).toBeTruthy();
    expect(screen.getByLabelText("Shader download filename")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Download Shader (Ctrl+S)" })
    ).toBeTruthy();
  });

  it("keeps the shader file download group intact", () => {
    renderSheet();
    expect(screen.getByLabelText("Shader download filename")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Download Shader (Ctrl+S)" })
    ).toBeTruthy();
  });

  it("renders the recording control when supported", () => {
    renderSheet();
    expect(screen.getByRole("button", { name: "Record (WebM)" })).toBeTruthy();
  });

  it("swaps the recording button label when recording is live", () => {
    renderSheet({ isRecording: true });
    expect(screen.getByRole("button", { name: "Stop recording" })).toBeTruthy();
  });

  it("omits the recording control when unsupported", () => {
    renderSheet({ recordingSupported: false });
    expect(screen.queryByRole("button", { name: "Record (WebM)" })).toBeNull();
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });
});
