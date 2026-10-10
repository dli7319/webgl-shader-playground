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

const ERROR_LABEL = "text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[var(--danger)]";
const ERROR_BOX =
  "surface-panel my-2 border-l-4 border-l-[var(--danger)] px-3 py-2 text-sm [&_pre]:mt-1 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:font-mono";
const COMPILE_ERROR = `${ERROR_BOX} shadow-[inset_0_0_0_1px_var(--danger)]`;
const WARN_ERROR = ERROR_BOX;

/**
 * VIEWPORT module — the bracketed preview bay with its telemetry strip
 * (status, zoom cluster, output size readouts). Export controls moved to the
 * OUTPUT module in the right stack.
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
    <div className="flex w-1/2 min-w-0 grow flex-col max-[900px]:w-full">
      <div className="surface-panel">
        <div className="hud-module-head">
          <span className="hud-module-title">VIEWPORT</span>
          <span className="hud-readout grow overflow-hidden text-ellipsis whitespace-nowrap opacity-75">
            Live output
          </span>
        </div>
        <div className="glow-frame hud-frame p-4">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Shader preview output"
            className="hud-clip border border-edge"
            style={{
              aspectRatio: width / height,
              width: `${zoomPercent}%`,
              height: "unset",
            }}
          />
        </div>
        <div className="hud-telemetry">
          <StatusBar
            status={status}
            runDurationMs={runDurationMs}
            width={width}
            height={height}
          />
          <div className="flex items-center gap-2">
            <Button variant="outlined" onClick={onZoomOut} aria-label="Zoom out">
              −
            </Button>
            <span className="hud-readout min-w-14 text-center text-sm">
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
      </div>
      {compileError ? (
        <div className={COMPILE_ERROR} role="alert">
          <strong className={ERROR_LABEL}>Shader error</strong>
          <pre>{compileError}</pre>
        </div>
      ) : null}
      {textureError ? (
        <div className={WARN_ERROR} role="alert">
          <strong className={ERROR_LABEL}>Texture error</strong>
          <pre>{textureError}</pre>
        </div>
      ) : null}
      {screenshotError ? (
        <div className={WARN_ERROR} role="alert">
          <strong className={ERROR_LABEL}>Screenshot error</strong>
          <pre>{screenshotError}</pre>
        </div>
      ) : null}
    </div>
  );
}
