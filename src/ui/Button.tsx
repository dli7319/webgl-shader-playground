import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outlined" | "contained";
  tone?: "default" | "warning";
}

const BASE = "btn";
const VARIANTS: Record<string, string> = {
  outlined: "",
  contained: "btn-contained btn-glow",
};
const TONES: Record<string, string> = {
  default: "",
  warning: "btn-danger",
};

/** Aurora Glass pill button (glowing accent when contained, danger tone for destructive). */
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
