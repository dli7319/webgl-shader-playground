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
      className="mt-2 flex items-center gap-2 px-2 py-1 text-sm text-ink opacity-85"
      role="status"
    >
      <span
        className={`size-2.5 rounded-full ${
          status === "error"
            ? "bg-[var(--danger)] shadow-[0_0_8px_rgba(224,30,90,0.55)]"
            : "bg-[var(--success)] shadow-[0_0_8px_rgba(51,224,143,0.5)]"
        }`}
        aria-hidden="true"
      />
      <span className="font-semibold uppercase tracking-[0.14em]">
        {STATUS_LABELS[status]}
      </span>
      <span aria-hidden="true">·</span>
      <span className="tabular-nums">{duration}</span>
      <span aria-hidden="true">·</span>
      <span className="uppercase tracking-[0.12em] opacity-80">
        Export {width}×{height}
      </span>
    </div>
  );
}
