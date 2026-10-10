import React from "react";

import { formatDuration, STATUS_LABELS, type CompileStatus } from "./status";

export interface StatusBarProps {
  status: CompileStatus;
  runDurationMs: number | null;
}

/** Compact read-only chip beside the preview summarizing compile state. */
export function StatusBar({ status, runDurationMs }: StatusBarProps) {
  const duration = runDurationMs === null ? "—" : formatDuration(runDurationMs);
  return (
    <div
      className="pill-island inline-flex items-center gap-2 self-start px-3 py-1 text-sm"
      role="status"
    >
      <span
        className={`size-2.5 rounded-full shadow-[0_0_6px_var(--glow-soft)] ${
          status === "error" ? "bg-[var(--error)]" : "bg-[var(--success)]"
        }`}
        aria-hidden="true"
      />
      <span className="font-semibold text-ink">{STATUS_LABELS[status]}</span>
      <span className="text-muted" aria-hidden="true">
        ·
      </span>
      <span className="text-muted">{duration}</span>
    </div>
  );
}
