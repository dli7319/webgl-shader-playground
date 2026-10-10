import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { ExportControls, type ExportControlsProps } from "./ExportControls";

afterEach(cleanup);

function renderControls(overrides: Partial<ExportControlsProps> = {}) {
  return render(
    <ExportControls
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
      isRecording={false}
      recordingSupported={true}
      onToggleRecording={() => {}}
      {...overrides}
    />
  );
}

describe("ExportControls state chip and sheet", () => {
  it("reports the export state beside the opener", () => {
    renderControls();
    const chip = screen.getByRole("button", { name: /export/i });
    expect(chip.textContent).toContain("1920×1080");
    expect(chip.textContent).toContain("screenshot.png");
    expect(chip.textContent).toContain("fragment.frag");
  });

  it("discloses the image, video and shader groups in one sheet", () => {
    renderControls();
    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    expect(screen.getByLabelText("Screenshot width in pixels")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot height in pixels")).toBeTruthy();
    expect(screen.getByLabelText("Screenshot filename")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Screenshot!" })).toBeTruthy();
    expect(screen.getByLabelText("Shader download filename")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Download Shader (Ctrl+S)" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Record (WebM)" })).toBeTruthy();
  });

  it("swaps the recording flag in place while recording", () => {
    renderControls({ isRecording: true });
    const chip = screen.getByRole("button", { name: /export/i });
    expect(chip.textContent).toContain("REC");
    fireEvent.click(chip);
    expect(screen.getByRole("button", { name: "Stop recording" })).toBeTruthy();
    expect(screen.queryByText("Record (WebM)")).toBeNull();
  });

  it("hides the video group when recording is unsupported", () => {
    renderControls({ recordingSupported: false });
    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    expect(screen.queryByRole("button", { name: /record/i })).toBeNull();
  });

  it("forwards field edits and actions", () => {
    const onWidthChange = vi.fn<(width: number) => void>();
    const onCaptureScreenshot = vi.fn<() => void>();
    renderControls({ onWidthChange, onCaptureScreenshot });
    fireEvent.click(screen.getByRole("button", { name: /export/i }));
    fireEvent.change(screen.getByLabelText("Screenshot width in pixels"), {
      target: { value: "2560" },
    });
    expect(onWidthChange).toHaveBeenCalledWith(2560);
    fireEvent.click(screen.getByRole("button", { name: "Screenshot!" }));
    expect(onCaptureScreenshot).toHaveBeenCalledTimes(1);
  });
});
