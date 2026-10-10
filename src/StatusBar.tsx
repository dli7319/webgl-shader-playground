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
        className={`size-2.5 rounded-full shadow-[0_0_6px_currentColor] ${
          status === "error"
            ? "bg-[var(--dot-error)] text-[var(--dot-error)]"
            : "bg-[var(--dot-success)] text-[var(--dot-success)]"
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
