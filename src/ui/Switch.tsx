import React from "react";

import styles from "../styles/controls.module.css";

export interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

/** Checkbox-based switch with a visible label. */
export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <label className={styles.switchLabel}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={onChange}
        aria-label={label}
      />
      <span>{label}</span>
    </label>
  );
}
