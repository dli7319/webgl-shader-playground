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
      className="pill-island mt-2 inline-flex items-center gap-2 self-start px-3 py-1 text-sm"
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
      <span className="text-muted" aria-hidden="true">
        ·
      </span>
      <span className="text-muted">
        Export {width}×{height}
      </span>
    </div>
  );
}
