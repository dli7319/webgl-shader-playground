import React from "react";
import { StatusBar } from "./StatusBar";
import { Button } from "./ui/Button";
import type { CompileStatus } from "./status";

export interface PreviewPaneProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
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
  "my-2 p-4 text-sm [&_pre]:mt-2 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:font-mono [&_pre]:text-[13px]";
const COMPILE_ERROR = `${ERROR_BOX} banner-danger`;
const WARN_ERROR = `${ERROR_BOX} banner-warn`;

/**
 * The stage: the preview artboard with floating canvas chrome (status chip,
 * zoom pill). Export settings live in the inspector, not here.
 */
export function PreviewPane({
  canvasRef,
  width,
  height,
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
    <section className="card-surface flex flex-col p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-base font-semibold tracking-[-0.01em]">Preview</h2>
      </div>
      <div className="relative rounded-2xl border border-edge bg-sunken p-2">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Shader preview output"
          style={{
            // String value: preact would suffix a numeric aspectRatio with
            // "px" and the browser would drop the property.
            aspectRatio: `${width} / ${height}`,
            width: `${zoomPercent}%`,
            height: "unset",
          }}
        />
        <div className="absolute left-4 top-4 z-10">
          <StatusBar status={status} runDurationMs={runDurationMs} />
        </div>
        <div className="pill-bar absolute bottom-4 left-4 z-10 flex items-center gap-1 p-1">
          <Button variant="outlined" onClick={onZoomOut} aria-label="Zoom out">
            −
          </Button>
          <span className="min-w-14 text-center text-sm tabular-nums">
            {zoomPercent}%
          </span>
          <Button variant="outlined" onClick={onZoomIn} aria-label="Zoom in">
            +
          </Button>
          <Button variant="outlined" onClick={onZoomFit}>
            Fit
          </Button>
        </div>
      </div>
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
  );
}
