import React from "react";

import { StatusBar } from "./StatusBar";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import type { CompileStatus } from "./status";

export interface PreviewPaneProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
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
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
}

const ERROR_BOX =
  "my-3 border-[3px] border-solid bg-panel p-3 text-sm text-ink shadow-[4px_4px_0_var(--border)] [&_pre]:mt-2 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:font-mono [&_strong]:mb-1 [&_strong]:block [&_strong]:text-xs [&_strong]:uppercase [&_strong]:tracking-[0.22em]";
const COMPILE_ERROR = `${ERROR_BOX} border-[var(--error)] [&_strong]:text-[var(--error)]`;
const WARN_ERROR = `${ERROR_BOX} border-accent`;

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
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onZoomFit,
}: PreviewPaneProps) {
  return (
    <div className="flex w-1/2 grow flex-col max-[900px]:w-full">
      <div aria-hidden="true" className="mb-2">
        <span className="section-label">Output · Preview</span>
      </div>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Shader preview output"
        className="block border-[3px] border-solid border-edge bg-black shadow-[6px_6px_0_var(--border)]"
        style={{
          aspectRatio: width / height,
          width: `${zoomPercent}%`,
          height: "unset",
        }}
      />
      <div className="mt-4 flex items-center gap-3">
        <Button variant="outlined" onClick={onZoomOut} aria-label="Zoom out">
          −
        </Button>
        <span className="min-w-16 text-center font-mono text-xs font-bold tracking-[0.12em]">
          {zoomPercent}%
        </span>
        <Button variant="outlined" onClick={onZoomIn} aria-label="Zoom in">
          +
        </Button>
        <Button variant="outlined" onClick={onZoomFit}>
          Fit
        </Button>
      </div>
      <StatusBar
        status={status}
        runDurationMs={runDurationMs}
        width={width}
        height={height}
      />
      {compileError ? (
        <div className={COMPILE_ERROR} role="alert">
          <strong>Shader error</strong>
          <pre>{compileError}</pre>
        </div>
      ) : null}
      {textureError ? (
        <div className={WARN_ERROR} role="alert">
          <strong>Texture error</strong>
          <pre>{textureError}</pre>
        </div>
      ) : null}
      {screenshotError ? (
        <div className={WARN_ERROR} role="alert">
          <strong>Screenshot error</strong>
          <pre>{screenshotError}</pre>
        </div>
      ) : null}
      <div className="mt-2">
        <div aria-hidden="true" className="mb-2">
          <span className="section-label">Screenshot</span>
        </div>
        <div className="surface-panel flex flex-row flex-wrap items-stretch gap-3 p-3">
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
          <Button className="grow" variant="outlined" onClick={onCaptureScreenshot}>
            Screenshot!
          </Button>
        </div>
      </div>
    </div>
  );
}
