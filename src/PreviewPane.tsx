import React from "react";
import { StatusBar } from "./StatusBar";
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
  "my-3 border-[3px] border-solid bg-panel p-3 text-sm text-ink shadow-[4px_4px_0_var(--border)] [&_pre]:mt-2 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:font-mono [&_strong]:mb-1 [&_strong]:block [&_strong]:text-xs [&_strong]:uppercase [&_strong]:tracking-[0.22em]";
const COMPILE_ERROR = `${ERROR_BOX} border-[var(--error)] [&_strong]:text-[var(--error)]`;
const WARN_ERROR = `${ERROR_BOX} border-accent`;

const ZOOM_PANEL_ID = "zoom-controls";

/**
 * The framed SPECIMEN block: caption bar carries the zoom summary that
 * discloses the zoom cluster (one object, one control group), then the
 * canvas and the read-only status caption. Error banners sit under the
 * frame so state changes never move blocks around.
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
  const [zoomOpen, setZoomOpen] = React.useState(false);
  return (
    <div className="flex flex-col">
      <section className="specimen">
        <div className="specimen-bar">
          <span className="slab-title">Specimen</span>
          <button
            type="button"
            className="bracket-btn"
            aria-expanded={zoomOpen}
            aria-controls={ZOOM_PANEL_ID}
            onClick={() => setZoomOpen((open) => !open)}
          >
            {`[ Zoom · ${zoomPercent}% ]`}
          </button>
        </div>
        <div id={ZOOM_PANEL_ID} className="slab-body" hidden={!zoomOpen}>
          <div
            className="zoom-cluster"
            role="group"
            aria-label="Preview zoom"
          >
            <button
              type="button"
              className="zoom-btn"
              onClick={onZoomOut}
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="zoom-value">{zoomPercent}%</span>
            <button
              type="button"
              className="zoom-btn"
              onClick={onZoomIn}
              aria-label="Zoom in"
            >
              +
            </button>
            <button type="button" className="zoom-btn" onClick={onZoomFit}>
              Fit
            </button>
          </div>
        </div>
        <div className="specimen-canvas">
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
        </div>
        <StatusBar
          status={status}
          runDurationMs={runDurationMs}
          width={width}
          height={height}
        />
      </section>
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
