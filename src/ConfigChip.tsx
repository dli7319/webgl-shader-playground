import React from "react";

export interface ConfigSummaryParts {
  width: number;
  height: number;
  screenshotFilename: string;
  downloadShaderFilename: string;
  autoRun: boolean;
  customTexture: boolean;
  savedCount: number;
}

export interface ConfigChipProps extends ConfigSummaryParts {
  onClick: () => void;
}

/**
 * One-line summary of everything the config sheet holds: output sizes and
 * filenames always, plus in-place flags for the non-default hidden state
 * (auto-run, picked texture, saved shaders). Nothing hidden without this
 * summary beside its opener.
 */
export function formatConfigSummary({
  width,
  height,
  screenshotFilename,
  downloadShaderFilename,
  autoRun,
  customTexture,
  savedCount,
}: ConfigSummaryParts): string {
  const parts = [`${width}×${height}`, screenshotFilename, downloadShaderFilename];
  if (autoRun) {
    parts.push("auto-run");
  }
  if (customTexture) {
    parts.push("custom texture");
  }
  if (savedCount > 0) {
    parts.push(`${savedCount} saved`);
  }
  return parts.join(" · ");
}

/** Compact read-only chip in the command strip that opens the config sheet. */
export function ConfigChip({ onClick, ...parts }: ConfigChipProps) {
  const summary = formatConfigSummary(parts);
  return (
    <button
      type="button"
      className="chip max-w-[28rem] overflow-hidden text-ellipsis whitespace-nowrap"
      title="Open output settings"
      aria-label={`Open output settings — ${summary}`}
      onClick={onClick}
    >
      {summary}
    </button>
  );
}
