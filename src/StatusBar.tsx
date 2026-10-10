import React from "react";
import { formatDuration, STATUS_LABELS, type CompileStatus } from "./status";

export interface StatusBarProps {
  status: CompileStatus;
  runDurationMs: number | null;
  width: number;
  height: number;
  /** Read-only config state line (filenames, auto-run, texture). */
  configDetail?: string;
  /** Live recording flag — recolors in place, never moves. */
  recording?: boolean;
}

/** Read-only status line at the foot of the output console. */
export function StatusBar({
  status,
  runDurationMs,
  width,
  height,
  configDetail,
  recording = false,
}: StatusBarProps) {
  const duration = runDurationMs === null ? "—" : formatDuration(runDurationMs);
  return (
    <div
      className="flex flex-wrap items-center gap-2 border-t border-edge px-2 py-1.5 text-sm text-ink opacity-85"
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
      {configDetail ? (
        <>
          <span aria-hidden="true">·</span>
          <span className="micro-label normal-case tracking-[0.08em] opacity-80">
            {configDetail}
          </span>
        </>
      ) : null}
      <span aria-hidden="true">·</span>
      <span className="micro-label rec-flag" data-live={recording ? "true" : "false"}>
        {recording ? "● rec" : "○ rec"}
      </span>
    </div>
  );
}
