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
  "frame-1px my-3 border-l-2 border-l-danger bg-app px-3 py-2 text-sm text-danger-ink [&_pre]:mt-1 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:font-mono [&_pre]:text-[0.8rem]";
const COMPILE_ERROR = ERROR_BOX;
const WARN_ERROR = ERROR_BOX;

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
    <div className="flex w-1/2 grow flex-col gap-4 max-[900px]:w-full">
      <section>
        <h2 className="section-label">Preview</h2>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Shader preview output"
          className="frame-1px bg-app"
          style={{
            aspectRatio: width / height,
            width: `${zoomPercent}%`,
            height: "unset",
          }}
        />
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="outlined"
            className="min-w-9 px-3 text-sm"
            onClick={onZoomOut}
            aria-label="Zoom out"
          >
            −
          </Button>
          <span className="min-w-14 text-center text-sm tabular-nums text-strong">
            {zoomPercent}%
          </span>
          <Button
            variant="outlined"
            className="min-w-9 px-3 text-sm"
            onClick={onZoomIn}
            aria-label="Zoom in"
          >
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
      </section>
      <section>
        <h2 className="section-label">Export</h2>
        <div className="surface-panel flex flex-row flex-wrap items-center gap-2 p-3">
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
      </section>
    </div>
  );
}
