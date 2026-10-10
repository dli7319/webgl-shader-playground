import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outlined" | "contained";
  tone?: "default" | "warning";
}

// Heavy frames + hard offset shadows live in styles/tailwind.css (.btn);
// these strings only pick the variant/tone chrome and caller layout.
const BASE = "btn [font:inherit]";
const VARIANTS: Record<string, string> = {
  outlined: "",
  contained: "btn-primary",
};
const TONES: Record<string, string> = {
  default: "",
  warning: "btn-danger",
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
