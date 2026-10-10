import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outlined" | "contained";
  tone?: "default" | "danger" | "live";
  /** "strip" fills the 28px toolbar strip edge-to-edge (same 28px height). */
  size?: "default" | "strip";
}

const BASE =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[3px] border px-3 text-[11px] font-medium uppercase tracking-[0.08em] transition-colors [font-family:inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";
const SIZES: Record<string, string> = {
  default: "h-7",
  strip: "h-full",
};
// Each variant × tone emits exactly one border/text color so no two utilities
// fight over the same property (CSS order would decide, not the class order).
const SKINS: Record<string, string> = {
  "outlined:default": "border-edge bg-transparent text-ink hover:bg-[var(--hover)]",
  "outlined:danger":
    "border-danger bg-transparent text-danger-ink hover:bg-[var(--banner-bg)]",
  "outlined:live": "border-err bg-transparent text-err hover:bg-[var(--hover)]",
  "contained:default":
    "border-accent-fill bg-accent-fill text-on-accent hover:brightness-110",
  "contained:danger": "border-danger bg-danger text-on-accent hover:brightness-110",
  "contained:live": "border-err bg-err text-on-accent hover:brightness-110",
};

/** Dense pro-tool button: 28px tall, 11px uppercase, 3px radius. */
export function Button({
  variant = "outlined",
  tone = "default",
  size = "default",
  className,
  type,
  ...rest
}: ButtonProps) {
  const classes = [BASE, SIZES[size], SKINS[`${variant}:${tone}`], className]
    .filter(Boolean)
    .join(" ");
  return <button type={type ?? "button"} className={classes} {...rest} />;
}
