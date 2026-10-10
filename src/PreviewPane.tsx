import React from "react";

import { Button } from "./ui/Button";

export interface PreviewPaneProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  compileError?: string | null;
  textureError?: string | null;
  screenshotError?: string | null;
}

const ERROR_BOX = "banner";
const COMPILE_ERROR = `${ERROR_BOX} banner-error`;
const WARN_ERROR = `${ERROR_BOX} banner-warn`;

/**
 * Preview stage: the canvas viewport with its zoom cluster as one group, and
 * the in-place error flags below it. Export controls live in the config sheet.
 */
export function PreviewPane({
  canvasRef,
  width,
  height,
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  compileError,
  textureError,
  screenshotError,
}: PreviewPaneProps) {
  return (
    <div className="flex w-2/5 shrink-0 flex-col max-[900px]:w-full">
      <div className="overflow-hidden rounded-[6px] border border-edge p-2">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Shader preview output"
          style={{
            aspectRatio: width / height,
            width: `${zoomPercent}%`,
            height: "unset",
          }}
        />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Button variant="outlined" onClick={onZoomOut} aria-label="Zoom out">
          −
        </Button>
        <span className="min-w-14 text-center font-mono text-sm text-muted">
          {zoomPercent}%
        </span>
        <Button variant="outlined" onClick={onZoomIn} aria-label="Zoom in">
          +
        </Button>
        <Button variant="outlined" onClick={onZoomFit}>
          Fit
        </Button>
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
