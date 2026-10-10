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
      className="m-3 flex items-center gap-2 border-2 border-edge bg-panel px-3 py-1.5 font-mono text-[0.68rem] font-bold uppercase tracking-[0.14em] text-ink shadow-[3px_3px_0_var(--border)]"
      role="status"
    >
      <span
        className={`size-2.5 border border-edge ${
          status === "error" ? "bg-[var(--error)]" : "bg-[var(--success)]"
        }`}
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
