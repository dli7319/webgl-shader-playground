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
      className="mt-3 flex items-center gap-2 rounded-full border border-edge bg-sunken px-3.5 py-1.5 text-[13px] text-quiet"
      role="status"
    >
      <span
        className={`size-2.5 rounded-full ${status === "error" ? "bg-error" : "bg-success"}`}
        aria-hidden="true"
      />
      <span className="font-medium text-ink">{STATUS_LABELS[status]}</span>
      <span aria-hidden="true">·</span>
      <span>{duration}</span>
      <span aria-hidden="true">·</span>
      <span>
        Export {width}×{height}
      </span>
    </div>
  );
}
