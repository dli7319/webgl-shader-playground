import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outlined" | "contained";
  tone?: "default" | "danger" | "live";
}

const BASE =
  "edge-accent inline-flex min-h-9 min-w-16 cursor-pointer items-center justify-center rounded-[2px] px-4 py-[0.45rem] font-display text-[1.15rem] leading-none uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40";
const VARIANTS: Record<string, string> = {
  outlined:
    "bg-transparent text-accent glow hover:bg-accent hover:text-on-accent hover:shadow-[0_0_12px_var(--glow)]",
  contained:
    "bg-accent text-on-accent hover:brightness-110 hover:shadow-[0_0_12px_var(--glow)]",
};
const TONES: Record<string, string> = {
  default: "",
  danger:
    "edge-danger bg-transparent text-danger hover:bg-danger hover:text-on-accent hover:shadow-none",
  live: "edge-accent bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-accent glow shadow-[0_0_10px_var(--glow)]",
};

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
    tone === "default" ? VARIANTS[variant] : TONES[tone],
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <button type={type ?? "button"} className={classes} {...rest} />;
}
