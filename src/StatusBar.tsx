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
      className="flex h-[22px] items-center gap-2 rounded-[3px] border border-edge px-2 text-[11px] text-ink"
      role="status"
    >
      <span
        className={`size-1.5 rounded-full ${status === "error" ? "bg-err" : "bg-ok"}`}
        aria-hidden="true"
      />
      <span className="font-semibold uppercase tracking-[0.08em]">
        {STATUS_LABELS[status]}
      </span>
      <span className="opacity-40" aria-hidden="true">
        ·
      </span>
      <span className="font-mono text-[10px]">{duration}</span>
      <span className="opacity-40" aria-hidden="true">
        ·
      </span>
      <span className="grow text-[10px] uppercase tracking-[0.1em] opacity-75">
        Export {width}×{height}
      </span>
    </div>
  );
}
