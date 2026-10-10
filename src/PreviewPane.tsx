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

const BANNER = "banner my-2";

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
    <div className="flex w-1/2 grow flex-col gap-2 max-[900px]:w-full">
      <section className="surface-panel flex flex-col">
        <div className="panel-title">
          <span>Preview</span>
          <span className="font-mono text-[10px] tracking-[0.1em] opacity-70">GLSL → WebGL</span>
        </div>
        <div className="flex flex-col gap-1.5 p-2">
          <div className="well overflow-auto p-1">
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="Shader preview output"
              className="block"
              style={{
                aspectRatio: width / height,
                width: `${zoomPercent}%`,
                height: "unset",
              }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="seg-strip">
              <button type="button" className="seg-btn" onClick={onZoomOut} aria-label="Zoom out">
                −
              </button>
              <span className="seg-readout">{zoomPercent}%</span>
              <button type="button" className="seg-btn" onClick={onZoomIn} aria-label="Zoom in">
                +
              </button>
              <button type="button" className="seg-btn" onClick={onZoomFit}>
                Fit
              </button>
            </div>
          </div>
          <StatusBar
            status={status}
            runDurationMs={runDurationMs}
            width={width}
            height={height}
          />
        </div>
      </section>
      {compileError ? (
        <div className={BANNER} role="alert">
          <strong>Shader error</strong>
          <pre>{compileError}</pre>
        </div>
      ) : null}
      {textureError ? (
        <div className={BANNER} role="alert">
          <strong>Texture error</strong>
          <pre>{textureError}</pre>
        </div>
      ) : null}
      {screenshotError ? (
        <div className={BANNER} role="alert">
          <strong>Screenshot error</strong>
          <pre>{screenshotError}</pre>
        </div>
      ) : null}
      <section className="surface-panel">
        <div className="panel-title">
          <span>Output</span>
          <span className="font-mono text-[10px] tracking-[0.1em] opacity-70">PNG</span>
        </div>
        <div className="flex flex-row flex-wrap items-center gap-1.5 p-2">
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
      </section>
    </div>
  );
}
