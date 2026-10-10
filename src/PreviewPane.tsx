import React from "react";

import styles from "./styles/ShaderPlayground.module.css";
import { StatusBar } from "./StatusBar";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import type { CompileStatus } from "./status";

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
  status: CompileStatus;
  runDurationMs: number | null;
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
  status,
  runDurationMs,
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
      <StatusBar
        status={status}
        runDurationMs={runDurationMs}
        width={width}
        height={height}
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
          aria-label="Screenshot width in pixels"
          onChange={(v) => onWidthChange(Number(v))}
        />
        <TextField
          label="Height"
          type="number"
          className={styles.screenshotOption}
          value={height}
          aria-label="Screenshot height in pixels"
          onChange={(v) => onHeightChange(Number(v))}
        />
        <TextField
          label="Filename"
          type="text"
          className={styles.screenshotOption}
          value={screenshotFilename}
          aria-label="Screenshot filename"
          onChange={onScreenshotFilenameChange}
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
