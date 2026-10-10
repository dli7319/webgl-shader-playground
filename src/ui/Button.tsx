import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outlined" | "contained";
  tone?: "default" | "danger" | "live";
}

// Quiet hairline chrome lives in styles/tailwind.css (@layer components) so the
// file-picker label in EditorPane can share the exact same box.
const BASE = "btn";
const VARIANTS: Record<string, string> = {
  outlined: "btn-quiet",
  contained: "btn-filled",
};
const TONES: Record<string, string> = {
  default: "",
  danger: "btn-danger",
  live: "btn-live",
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
