import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outlined" | "contained";
  tone?: "default" | "danger";
}

const BASE =
  "inline-flex min-h-9 min-w-16 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border px-4 py-[0.42rem] text-sm font-medium tracking-[0.01em] transition-colors [font:inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";
const VARIANTS: Record<string, string> = {
  outlined: "border-edge text-ink hover:bg-[var(--hover-tint)]",
  contained:
    "border-accent bg-accent text-on-accent shadow-[var(--shadow-soft)] hover:brightness-[0.96] active:brightness-[0.92]",
};
const TONES: Record<string, string> = {
  default: "",
  danger: "border-[var(--danger)] text-danger hover:bg-[var(--danger-tint)]",
};

/** Shared class strings so file-picker labels can match the button language. */
export const BUTTON_BASE = BASE;
export const BUTTON_OUTLINED = [BASE, VARIANTS.outlined].join(" ");

/** Lightweight button matching the app's control styling. */
export function Button({
  variant = "outlined",
  tone = "default",
  className,
  type,
  ...rest
}: ButtonProps) {
  const classes = [BASE, VARIANTS[variant], TONES[tone], className]
    .filter(Boolean)
    .join(" ");
  return <button type={type ?? "button"} className={classes} {...rest} />;
}
