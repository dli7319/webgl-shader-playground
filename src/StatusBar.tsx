import React from "react";

import { formatDuration, STATUS_LABELS, type CompileStatus } from "./status";
export interface StatusBarProps {
  status: CompileStatus;
  runDurationMs: number | null;
  width: number;
  height: number;
}

/** Small read-only strip under the preview summarizing playground state. */
export function StatusBar({ status, runDurationMs, width, height }: StatusBarProps) {
  const duration = runDurationMs === null ? "—" : formatDuration(runDurationMs);
  return (
    <div
      className="mt-2 flex items-center gap-2 px-1 py-1 text-sm text-ink"
      role="status"
    >
      <span
        className={`size-2 rounded-full ${status === "error" ? "bg-danger" : "bg-success"}`}
        aria-hidden="true"
      />
      <span className="font-medium text-strong">{STATUS_LABELS[status]}</span>
      <span aria-hidden="true" className="text-muted">
        ·
      </span>
      <span className="tabular-nums">{duration}</span>
      <span aria-hidden="true" className="text-muted">
        ·
      </span>
      <span className="tabular-nums">
        Export {width}×{height}
      </span>
    </div>
  );
}
