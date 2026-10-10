import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outlined" | "contained";
  tone?: "default" | "warning" | "live";
}

const BASE =
  "hud-clip w-full min-w-16 cursor-pointer whitespace-nowrap px-4 py-[0.4rem] text-sm font-semibold uppercase tracking-[0.08em] transition-colors [font:inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";
const OUTLINED =
  "border border-edge bg-transparent text-ink hover:border-accent hover:bg-[var(--tint-accent)] hover:text-accent";
const OUTLINED_DANGER =
  "border border-[var(--danger)] bg-[var(--tint-danger)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-[var(--on-accent)]";
const OUTLINED_LIVE =
  "inline-flex items-center justify-center gap-2 border border-[var(--accent-2)] bg-transparent text-ink hover:bg-[var(--tint-live)]";
const CONTAINED =
  "border border-accent bg-accent text-[var(--on-accent)] hover:brightness-110";

/**
 * Lightweight button matching the app's control styling. The chamfered button
 * is wrapped in a shell so the neon glow survives the clip-path.
 */
export function Button({
  variant = "outlined",
  tone = "default",
  className,
  type,
  ...rest
}: ButtonProps) {
  const skin =
    variant === "contained"
      ? CONTAINED
      : tone === "warning"
        ? OUTLINED_DANGER
        : tone === "live"
          ? OUTLINED_LIVE
          : OUTLINED;
  const shellClasses = [
    "btn-shell",
    variant === "contained" ? "btn-shell-primary" : "",
    tone === "live" ? "btn-shell-live" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={shellClasses}>
      <button type={type ?? "button"} className={[BASE, skin].join(" ")} {...rest} />
    </span>
  );
}
