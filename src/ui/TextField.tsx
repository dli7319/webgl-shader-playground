import React from "react";

import styles from "../styles/controls.module.css";

export interface TextFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number" | "search";
  className?: string;
  "aria-label"?: string;
}

let nextId = 0;

/** Outlined text field with a floating label. */
export function TextField({
  label,
  value,
  onChange,
  type = "text",
  className,
  "aria-label": ariaLabel,
}: TextFieldProps) {
  const id = React.useMemo(() => `text-field-${nextId++}`, []);
  // Preact 11 types `<input>` as a discriminated union on `type`, which can't
  // express a caller-supplied union like "text" | "number" — spread with a cast.
  const inputProps = {
    id,
    type,
    value,
    placeholder: " ",
    "aria-label": ariaLabel ?? label,
    onChange: (e: Event) => onChange((e.target as HTMLInputElement).value),
  };
  return (
    <label className={[styles.textField, className].filter(Boolean).join(" ")}>
      <input {...(inputProps as any)} />
      <span className={styles.textFieldLabel}>{label}</span>
    </label>
  );
}
