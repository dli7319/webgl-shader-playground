import React from "react";
import { formatDuration, STATUS_LABELS, type CompileStatus } from "./status";
export interface StatusBarProps {
  status: CompileStatus;
  runDurationMs: number | null;
}

/** Floating status chip resting on the canvas (state flags swap in place). */
export function StatusBar({ status, runDurationMs }: StatusBarProps) {
  const duration = runDurationMs === null ? "—" : formatDuration(runDurationMs);
  return (
    <div
      className="float-chip flex items-center gap-2 px-3.5 py-1.5 text-[13px] text-quiet"
      role="status"
    >
      <span
        className={`size-2.5 rounded-full ${status === "error" ? "bg-error" : "bg-success"}`}
        aria-hidden="true"
      />
      <span className="font-medium text-ink">{STATUS_LABELS[status]}</span>
      <span aria-hidden="true">·</span>
      <span>{duration}</span>
    </div>
  );
}
