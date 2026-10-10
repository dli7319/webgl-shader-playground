import React from "react";
import { DockSheet } from "./DockSheet";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";

export interface ExportSheetProps {
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
  recordingSupported: boolean;
  isRecording: boolean;
  onToggleRecording: () => void;
  onClose: () => void;
}

/** Export sheet: one control group per exported object. */
export function ExportSheet({
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
  recordingSupported,
  isRecording,
  onToggleRecording,
  onClose,
}: ExportSheetProps) {
  return (
    <DockSheet title="Export" onClose={onClose}>
      <div className="sheet-group">
        <span className="sheet-group-label">Screenshot (PNG)</span>
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
      <div className="sheet-group">
        <span className="sheet-group-label">Shader file (GLSL)</span>
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
      <div className="sheet-group">
        <span className="sheet-group-label">Video (WebM)</span>
        {recordingSupported ? (
          <Button
            variant="outlined"
            className={isRecording ? "is-recording" : undefined}
            onClick={onToggleRecording}
          >
            {isRecording ? "Stop recording" : "Record (WebM)"}
          </Button>
        ) : (
          <p className="sheet-note">Recording is not supported in this browser.</p>
        )}
        {isRecording ? (
          <p className="sheet-note">Recording is live — the dock shows a REC flag.</p>
        ) : null}
      </div>
    </DockSheet>
  );
}
