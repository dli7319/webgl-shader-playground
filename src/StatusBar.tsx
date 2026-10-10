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
      className="mt-2 flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-panel px-3 py-1.5 text-sm text-ink"
      role="status"
    >
      <span
        className={`size-2.5 rounded-full shadow-[0_0_8px_currentColor] ${
          status === "error"
            ? "bg-[var(--error)] text-[var(--error)]"
            : "bg-[var(--success)] text-[var(--success)]"
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
