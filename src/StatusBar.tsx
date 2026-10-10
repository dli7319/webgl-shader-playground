import React from "react";
import { formatDuration, STATUS_LABELS, type CompileStatus } from "./status";
export interface StatusBarProps {
  status: CompileStatus;
  runDurationMs: number | null;
  width: number;
  height: number;
}

/** Read-only margin caption under the plate summarizing playground state. */
export function StatusBar({ status, runDurationMs, width, height }: StatusBarProps) {
  const duration = runDurationMs === null ? "—" : formatDuration(runDurationMs);
  return (
    <div className="mt-1.5 flex flex-col gap-1 text-sm text-muted" role="status">
      <div className="flex items-center gap-2">
        <span
          className={`size-2.5 shrink-0 rounded-full ${status === "error" ? "bg-danger" : "bg-success"}`}
          aria-hidden="true"
        />
        <span>{STATUS_LABELS[status]}</span>
      </div>
      <div>{duration}</div>
      <div>
        Export {width}×{height}
      </div>
    </div>
  );
}
