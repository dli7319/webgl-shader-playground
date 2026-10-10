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
}

/**
 * Pane 2 of the workspace: the live viewport. The zoom cluster (−/value/+/Fit)
 * stays one group and lives in the pane header, tmux-pane style.
 */
export function PreviewPane({
  canvasRef,
  width,
  height,
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onZoomFit,
}: PreviewPaneProps) {
  return (
    <div className="pane min-w-0 flex-[1_1_0%] max-[900px]:w-full max-[900px]:flex-auto">
      <div className="pane-header">
        <div className="flex min-w-0 flex-wrap items-baseline gap-2" aria-hidden="true">
          <span className="section-label">2:preview</span>
          <span className="micro-label opacity-60">viewport</span>
        </div>
        <span className="grow" aria-hidden="true" />
        <div className="flex items-center gap-2">
          <Button variant="outlined" onClick={onZoomOut} aria-label="Zoom out">
            −
          </Button>
          <span className="min-w-14 text-center text-sm">{zoomPercent}%</span>
          <Button variant="outlined" onClick={onZoomIn} aria-label="Zoom in">
            +
          </Button>
          <Button variant="outlined" onClick={onZoomFit}>
            Fit
          </Button>
        </div>
      </div>
      <div className="pane-body">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Shader preview output"
          className="edge"
          style={{
            aspectRatio: width / height,
            width: `${zoomPercent}%`,
            height: "unset",
          }}
        />
      </div>
    </div>
  );
}
