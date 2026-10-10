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
      className="mt-2 flex items-center gap-2 border-t border-edge px-1 pt-2 text-sm text-muted"
      role="status"
    >
      <span
        className={`size-2.5 rounded-full ${status === "error" ? "bg-danger" : "bg-success"}`}
        aria-hidden="true"
      />
      <span>{STATUS_LABELS[status]}</span>
      <span aria-hidden="true">·</span>
      <span>{duration}</span>
      <span aria-hidden="true">·</span>
      <span>
        Export {width}×{height}
      </span>
    </div>
  );
}
