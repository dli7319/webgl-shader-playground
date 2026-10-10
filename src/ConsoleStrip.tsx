import React from "react";
import { StatusBar } from "./StatusBar";
import type { CompileStatus } from "./status";

export interface ConsoleStripProps {
  compileError?: string | null;
  textureError?: string | null;
  screenshotError?: string | null;
  status: CompileStatus;
  runDurationMs: number | null;
  width: number;
  height: number;
  configDetail: string;
  recording: boolean;
}

const ERROR_BOX =
  "error-box p-2 text-sm [&_pre]:mt-1 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:font-mono";
const COMPILE_ERROR = ERROR_BOX;
const WARN_ERROR = `${ERROR_BOX} opacity-90`;

/**
 * Bottom OUTPUT/STATUS console: error output scrolls in the reserved body,
 * the read-only status line (with config state and the rec flag) sits under
 * it. Errors recolor/append in place — no blocks move on state change.
 */
export function ConsoleStrip({
  compileError,
  textureError,
  screenshotError,
  status,
  runDurationMs,
  width,
  height,
  configDetail,
  recording,
}: ConsoleStripProps) {
  return (
    <section className="console" aria-label="Output and status console">
      <div className="flex min-w-0 flex-wrap items-baseline gap-2 px-2 pt-1.5" aria-hidden="true">
        <span className="section-label">Output/Status</span>
        <span className="micro-label grow opacity-60">console</span>
      </div>
      <div className="console-body">
        {compileError ? (
          <div className={COMPILE_ERROR} role="alert">
            <strong>Shader error</strong>
            <pre>{compileError}</pre>
          </div>
        ) : null}
        {textureError ? (
          <div className={WARN_ERROR} role="alert">
            <strong>Texture error</strong>
            <pre>{textureError}</pre>
          </div>
        ) : null}
        {screenshotError ? (
          <div className={WARN_ERROR} role="alert">
            <strong>Screenshot error</strong>
            <pre>{screenshotError}</pre>
          </div>
        ) : null}
      </div>
      <StatusBar
        status={status}
        runDurationMs={runDurationMs}
        width={width}
        height={height}
        configDetail={configDetail}
        recording={recording}
      />
    </section>
  );
}
