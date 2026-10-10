import React from "react";

import { BottomSheet } from "./BottomSheet";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";

export interface ExportControlsProps {
  width: number;
  height: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  screenshotFilename: string;
  onScreenshotFilenameChange: (filename: string) => void;
  onCaptureScreenshot: () => void;
  downloadShaderFilename: string;
  onDownloadShaderFilenameChange: (filename: string) => void;
  onDownloadShader: () => void;
  isRecording: boolean;
  recordingSupported: boolean;
  onToggleRecording: () => void;
}

const GROUP = "flex flex-col gap-2";

/**
 * Export state chip + bottom sheet. One object, one control: image size and
 * filename, video recording and the shader file download all belong to the
 * single "get it out of the app" group, disclosed behind one chip whose
 * summary reports their state.
 */
export function ExportControls({
  width,
  height,
  onWidthChange,
  onHeightChange,
  screenshotFilename,
  onScreenshotFilenameChange,
  onCaptureScreenshot,
  downloadShaderFilename,
  onDownloadShaderFilenameChange,
  onDownloadShader,
  isRecording,
  recordingSupported,
  onToggleRecording,
}: ExportControlsProps) {
  const [open, setOpen] = React.useState(false);
  const summary = `${width}×${height} · ${screenshotFilename} · ${downloadShaderFilename}`;

  return (
    <>
      <button type="button" className="state-chip" onClick={() => setOpen(true)}>
        {isRecording ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--danger)]">
            <span
              className="size-2 rounded-full bg-[var(--error)] shadow-[0_0_6px_var(--glow-soft)]"
              aria-hidden="true"
            />
            REC
          </span>
        ) : null}
        <span className="font-semibold">Export</span>{" "}
        <span className="text-muted">{summary}</span>
      </button>
      {open ? (
        <BottomSheet title="Export" onClose={() => setOpen(false)}>
          <div className="flex flex-col gap-5">
            <div className={GROUP}>
              <span className="section-label">Image</span>
              <div className="flex flex-wrap items-center gap-2">
                <TextField
                  label="Width"
                  type="number"
                  className="grow"
                  value={width}
                  aria-label="Screenshot width in pixels"
                  onChange={(v) => onWidthChange(Number(v))}
                />
                <TextField
                  label="Height"
                  type="number"
                  className="grow"
                  value={height}
                  aria-label="Screenshot height in pixels"
                  onChange={(v) => onHeightChange(Number(v))}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <TextField
                  label="Filename"
                  type="text"
                  className="grow"
                  value={screenshotFilename}
                  aria-label="Screenshot filename"
                  onChange={onScreenshotFilenameChange}
                />
                <Button variant="outlined" onClick={onCaptureScreenshot}>
                  Screenshot!
                </Button>
              </div>
            </div>
            {recordingSupported ? (
              <div className={GROUP}>
                <span className="section-label">Video</span>
                <div>
                  <Button
                    variant="outlined"
                    tone={isRecording ? "warning" : undefined}
                    onClick={onToggleRecording}
                  >
                    {isRecording ? "Stop recording" : "Record (WebM)"}
                  </Button>
                </div>
              </div>
            ) : null}
            <div className={GROUP}>
              <span className="section-label">Shader source</span>
              <div className="flex flex-wrap items-center gap-2">
                <TextField
                  label="Filename"
                  type="text"
                  className="grow"
                  value={downloadShaderFilename}
                  aria-label="Shader download filename"
                  onChange={onDownloadShaderFilenameChange}
                />
                <Button variant="outlined" onClick={onDownloadShader}>
                  Download Shader (Ctrl+S)
                </Button>
              </div>
            </div>
          </div>
        </BottomSheet>
      ) : null}
    </>
  );
}
