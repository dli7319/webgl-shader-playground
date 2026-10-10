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
  "my-1 rounded-[14px] border p-3 text-sm shadow-[var(--shadow-raised-sm)] [&_pre]:mt-1 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:font-mono";
const COMPILE_ERROR = `${ERROR_BOX} border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-ink)]`;
const WARN_ERROR = `${ERROR_BOX} border-[var(--warn-border)] bg-[var(--warn-bg)] text-[var(--warn-ink)]`;

/**
 * Preview island: the canvas sunk into the material with its status chip and
 * the zoom cluster (one object, one control) beneath it. Export controls live
 * behind the control cushion's Export chip, not here.
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
    <section className="surface-panel flex flex-col gap-2 p-3">
      <span className="section-label">Preview</span>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Shader preview output"
        className="rounded-[12px] shadow-[var(--shadow-inset-sm)]"
        style={{
          aspectRatio: width / height,
          width: `${zoomPercent}%`,
          height: "unset",
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusBar status={status} runDurationMs={runDurationMs} />
        <div className="pill-island inline-flex items-center gap-2 px-2 py-1">
          <Button variant="outlined" onClick={onZoomOut} aria-label="Zoom out">
            −
          </Button>
          <span className="min-w-14 text-center text-sm text-muted">{zoomPercent}%</span>
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
