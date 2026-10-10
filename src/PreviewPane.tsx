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
  "mt-2 rounded-2xl border p-3 text-sm [&_pre]:mt-1 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:font-mono";
const COMPILE_ERROR = `${ERROR_BOX} border-[var(--error)] bg-[var(--error-bg)] text-[var(--error-text)]`;
const WARN_ERROR = `${ERROR_BOX} border-[var(--error)] bg-[var(--error-bg)] text-[var(--error-text)]`;

/**
 * The dominant floating island: the preview canvas card with its zoom cluster
 * and monitor status. Export controls live in the dock's Export sheet.
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
    <div className="glass flex w-[56%] grow flex-col p-3 max-[900px]:w-full">
      <div className="flex min-h-0 flex-1 overflow-auto rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Shader preview output"
          className="m-auto rounded-2xl border border-[var(--glass-border)] shadow-[0_18px_50px_-24px_rgba(0,0,0,0.55)]"
          style={{
            aspectRatio: width / height,
            width: `${zoomPercent}%`,
            height: "unset",
          }}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outlined" onClick={onZoomOut} aria-label="Zoom out">
            −
          </Button>
          <span className="min-w-14 text-center text-sm tabular-nums">{zoomPercent}%</span>
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
    </div>
  );
}
