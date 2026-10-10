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
  textureError?: string | null;
  screenshotError?: string | null;
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
  textureError,
  screenshotError,
}: PreviewPaneProps) {
  return (
    <div className={styles.leftColumn}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label="Shader preview output"
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
      {textureError ? (
        <div className={styles.textureError} role="alert">
          <strong>Texture error</strong>
          <pre>{textureError}</pre>
        </div>
      ) : null}
      {screenshotError ? (
        <div className={styles.textureError} role="alert">
          <strong>Screenshot error</strong>
          <pre>{screenshotError}</pre>
        </div>
      ) : null}
      <div className={styles.screenshotControls}>
        <TextField
          label="Width"
          type="number"
          className={styles.screenshotOption}
          value={width}
          variant="outlined"
          slotProps={{ htmlInput: { "aria-label": "Screenshot width in pixels" } }}
          onChange={(e) => onWidthChange(Number(e.target.value))}
        />
        <TextField
          label="Height"
          type="number"
          className={styles.screenshotOption}
          value={height}
          variant="outlined"
          slotProps={{ htmlInput: { "aria-label": "Screenshot height in pixels" } }}
          onChange={(e) => onHeightChange(Number(e.target.value))}
        />
        <TextField
          label="Filename"
          type="text"
          className={styles.screenshotOption}
          value={screenshotFilename}
          variant="outlined"
          slotProps={{ htmlInput: { "aria-label": "Screenshot filename" } }}
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
