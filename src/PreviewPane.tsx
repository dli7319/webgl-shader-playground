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
  "my-2 p-3 text-sm [&_pre]:mt-1.5 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:font-mono";
const COMPILE_ERROR = `${ERROR_BOX} proof proof-error`;
const WARN_ERROR = `${ERROR_BOX} proof proof-warn`;

/**
 * Left page of the spread — the plate. The canvas is the pasted-in print;
 * caption (status), export size, and the zoom cluster read as margin notes
 * down the page's outer margin.
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
    <section className="spread-page page-plate flex w-[46%] grow flex-col gap-2 p-5 max-[900px]:w-full">
      <h2 className="section-title text-lg">Preview</h2>
      <div className="flex flex-row items-start gap-5 max-[760px]:flex-col">
        <div className="min-w-0 grow overflow-auto">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Shader preview output"
            className="rounded-[12px] border border-edge shadow-[var(--shadow-soft)]"
            style={{
              aspectRatio: width / height,
              width: `${zoomPercent}%`,
              height: "unset",
            }}
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
        </div>
        <aside className="flex w-48 shrink-0 flex-col gap-5 max-[760px]:w-full">
          <div>
            <p className="note-label">View</p>
            <div className="mt-1.5 grid grid-cols-[auto_1fr_auto] items-center gap-1.5">
              <Button variant="outlined" onClick={onZoomOut} aria-label="Zoom out">
                −
              </Button>
              <span className="text-center text-sm text-muted">{zoomPercent}%</span>
              <Button variant="outlined" onClick={onZoomIn} aria-label="Zoom in">
                +
              </Button>
            </div>
            <Button variant="outlined" className="mt-1.5 w-full" onClick={onZoomFit}>
              Fit
            </Button>
          </div>
          <div>
            <p className="note-label">Plate</p>
            <StatusBar
              status={status}
              runDurationMs={runDurationMs}
              width={width}
              height={height}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
