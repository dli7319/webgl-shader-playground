import React from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import styles from "./styles/ShaderPlayground.module.css";

export interface PreviewPaneProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  width: number;
  height: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  screenshotFilename: string;
  onScreenshotFilenameChange: (filename: string) => void;
  onCaptureScreenshot: () => void;
  compileError?: string | null;
}

/** Preview canvas plus the screenshot/export controls beneath it. */
export function PreviewPane({
  canvasRef,
  width,
  height,
  onWidthChange,
  onHeightChange,
  screenshotFilename,
  onScreenshotFilenameChange,
  onCaptureScreenshot,
  compileError,
}: PreviewPaneProps) {
  return (
    <div className={styles.leftColumn}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{
          aspectRatio: width / height,
          width: "unset",
          height: "unset",
        }}
      />
      {compileError ? (
        <div className={styles.compileError} role="alert">
          <strong>Shader error</strong>
          <pre>{compileError}</pre>
        </div>
      ) : null}
      <div className={styles.screenshotControls}>
        <TextField
          label="Width"
          type="number"
          className={styles.screenshotOption}
          value={width}
          variant="outlined"
          onChange={(e) => onWidthChange(Number(e.target.value))}
        />
        <TextField
          label="Height"
          type="number"
          className={styles.screenshotOption}
          value={height}
          variant="outlined"
          onChange={(e) => onHeightChange(Number(e.target.value))}
        />
        <TextField
          label="Filename"
          type="text"
          className={styles.screenshotOption}
          value={screenshotFilename}
          variant="outlined"
          onChange={(e) => onScreenshotFilenameChange(e.target.value)}
        />
        <Button
          className={styles.screenshotButton}
          variant="outlined"
          onClick={onCaptureScreenshot}
        >
          Screenshot!
        </Button>
      </div>
    </div>
  );
}
