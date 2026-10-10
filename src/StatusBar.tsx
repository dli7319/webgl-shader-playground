import React from "react";

import { formatDuration, STATUS_LABELS, type CompileStatus } from "./status";

export interface StatusBarProps {
  status: CompileStatus;
  runDurationMs: number | null;
}

/**
 * Read-only compile status merged into the top command strip: the semantic
 * dot, the status label, and the last run duration. Export state lives in the
 * config chip beside the sheet opener instead.
 */
export function StatusBar({ status, runDurationMs }: StatusBarProps) {
  const duration = runDurationMs === null ? "—" : formatDuration(runDurationMs);
  return (
    <div className="flex items-center gap-2 text-sm" role="status">
      <span
        className={`size-2 rounded-full ${status === "error" ? "bg-error" : "bg-success"}`}
        aria-hidden="true"
      />
      <span className="font-medium text-ink">{STATUS_LABELS[status]}</span>
      <span className="text-muted" aria-hidden="true">
        ·
      </span>
      <span className="font-mono text-xs text-muted">{duration}</span>
    </div>
  );
}
