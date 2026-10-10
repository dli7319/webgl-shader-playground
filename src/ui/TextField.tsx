import React from "react";

import styles from "../styles/controls.module.css";

export interface TextFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
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
  return (
    <label className={[styles.textField, className].filter(Boolean).join(" ")}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder=" "
        aria-label={ariaLabel ?? label}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className={styles.textFieldLabel}>{label}</span>
    </label>
  );
}
