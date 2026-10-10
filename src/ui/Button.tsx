import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outlined" | "contained";
  tone?: "default" | "warning";
}

const BASE =
  "inline-flex h-9 min-w-16 cursor-pointer items-center justify-center gap-2 rounded border px-4 text-xs font-semibold uppercase tracking-[0.08em] transition-colors [font:inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";
const VARIANTS: Record<string, string> = {
  outlined: "border-edge bg-app text-ink hover:border-accent hover:text-strong",
  contained: "border-transparent bg-fill text-onaccent hover:bg-fill-hover",
};
const TONES: Record<string, string> = {
  warning: "border-danger bg-app text-danger-ink hover:bg-danger-tint",
};

/** Lightweight button matching the app's control styling. */
export function Button({
  variant = "outlined",
  tone = "default",
  className,
  type,
  ...rest
}: ButtonProps) {
  // A tone fully replaces the variant chrome so hover states never conflict.
  const look = tone === "default" ? VARIANTS[variant] : TONES[tone];
  const classes = [BASE, look, className].filter(Boolean).join(" ");
  return <button type={type ?? "button"} className={classes} {...rest} />;
}
