import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outlined" | "contained";
  tone?: "default" | "danger" | "live";
  size?: "md" | "lg";
}

const BASE =
  "inline-flex min-w-16 cursor-pointer items-center justify-center gap-2 rounded-[10px] border px-4 font-semibold transition-colors [font:inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-45";
const SIZES: Record<string, string> = {
  md: "h-10 text-sm",
  lg: "h-12 px-5 text-[15px]",
};
const VARIANTS: Record<string, string> = {
  // Quiet secondary: white pill, hairline border, subtle hover darkening.
  outlined: "border-edge-strong bg-panel text-ink hover:bg-[var(--hover-fill)]",
  // The one confident blue (Run Shader / dialog confirm).
  contained:
    "border-transparent bg-fill text-on-accent shadow-[0_1px_2px_rgba(0,0,0,0.14)] hover:brightness-[1.08] active:brightness-95",
};
// Tones replace the variant chrome so borders never collide.
const TONES: Record<string, string> = {
  danger:
    "border-[var(--danger-edge)] bg-panel text-danger hover:bg-[var(--danger-hover)]",
  live: "border-[var(--live-edge)] bg-panel text-success hover:bg-[var(--live-hover)]",
};

/** Lightweight button matching the app's control styling. */
export function Button({
  variant = "outlined",
  tone = "default",
  size = "md",
  className,
  type,
  ...rest
}: ButtonProps) {
  const chrome = tone === "default" ? VARIANTS[variant] : TONES[tone];
  const classes = [BASE, SIZES[size], chrome, className].filter(Boolean).join(" ");
  return <button type={type ?? "button"} className={classes} {...rest} />;
}
