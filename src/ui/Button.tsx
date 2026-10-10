import React from "react";

import styles from "../styles/controls.module.css";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outlined" | "contained";
  tone?: "default" | "warning";
}

/** Lightweight button matching the app's control styling. */
export function Button({
  variant = "outlined",
  tone = "default",
  className,
  type,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], styles[tone], className]
    .filter(Boolean)
    .join(" ");
  return <button type={type ?? "button"} className={classes} {...rest} />;
}
