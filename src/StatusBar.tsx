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
      className="mt-2 flex items-center gap-2 border-t border-edge px-1 py-2 text-sm"
      role="status"
    >
      <span
        className={`size-2 rounded-full ${status === "error" ? "bg-error" : "bg-success"}`}
        aria-hidden="true"
      />
      <span className="font-medium text-ink">{STATUS_LABELS[status]}</span>
      <span className="text-muted" aria-hidden="true">
        ·
      </span>
      <span className="font-mono text-xs text-muted">{duration}</span>
      <span className="text-muted" aria-hidden="true">
        ·
      </span>
      <span className="font-mono text-xs text-muted">
        Export {width}×{height}
      </span>
    </div>
  );
}
