import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outlined" | "contained";
  tone?: "default" | "warning";
}

const BASE =
  "min-w-16 cursor-pointer rounded px-4 py-[0.4rem] text-sm font-medium uppercase tracking-[0.02857em] transition-colors [font:inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";
const VARIANTS: Record<string, string> = {
  outlined: "border border-edge text-accent hover:bg-[rgba(25,118,210,0.04)]",
  contained: "border border-accent bg-accent text-white hover:brightness-110",
};
const TONES: Record<string, string> = {
  default: "",
  warning: "border-[#ed6c02] text-[#ed6c02]",
};

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
