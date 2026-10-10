export type CompileStatus = "idle" | "compiled" | "error";

/** Formats a duration for the status bar. */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) {
    return "—";
  }
  if (ms < 1) {
    return "<1 ms";
  }
  if (ms < 1000) {
    return `${Math.round(ms)} ms`;
  }
  return `${(ms / 1000).toFixed(1)} s`;
}

/** Derives the compile status from run/error state. */
export function compileStatusFrom(
  hasRun: boolean,
  compileError: string | null
): CompileStatus {
  if (compileError) {
    return "error";
  }
  return hasRun ? "compiled" : "idle";
}

export const STATUS_LABELS: Record<CompileStatus, string> = {
  idle: "Not run yet",
  compiled: "Compiled",
  error: "Compile error",
};
