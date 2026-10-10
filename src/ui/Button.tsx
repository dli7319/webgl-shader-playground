import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outlined" | "contained";
  tone?: "default" | "warning";
}

// Soft Calm controls: one pill box height everywhere, tactile press state
// (raised resting -> inset on :active), teal glow on the single primary fill.
const BASE =
  "inline-flex min-w-16 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-4 py-[0.45rem] text-sm font-semibold tracking-[0.01em] transition-shadow duration-150 [font:inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";
const QUIET =
  "border-edge bg-panel text-ink shadow-[var(--shadow-raised-sm)] hover:shadow-[var(--shadow-raised)] active:shadow-[var(--shadow-inset-sm)]";
const PRIMARY =
  "border-accent bg-accent text-on-accent shadow-[var(--shadow-glow)] hover:brightness-110 active:shadow-[var(--shadow-inset-sm)]";
const DANGER =
  "border-danger/50 bg-panel text-danger shadow-[var(--shadow-raised-sm)] hover:shadow-[var(--shadow-raised)] active:shadow-[var(--shadow-inset-sm)]";

function outlinedClasses(tone: "default" | "warning"): string {
  return tone === "warning" ? DANGER : QUIET;
}

/** Lightweight button matching the app's control styling. */
export function Button({
  variant = "outlined",
  tone = "default",
  className,
  type,
  ...rest
}: ButtonProps) {
  const classes = [
    BASE,
    variant === "contained" ? PRIMARY : outlinedClasses(tone),
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <button type={type ?? "button"} className={classes} {...rest} />;
}
