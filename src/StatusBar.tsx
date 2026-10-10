import React from "react";

import styles from "./styles/ShaderPlayground.module.css";
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
    <div className={styles.statusBar} role="status">
      <span
        className={status === "error" ? styles.statusDotError : styles.statusDot}
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
