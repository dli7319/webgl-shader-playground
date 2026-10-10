import React from "react";

export interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

const SWITCH_LABEL = "my-1 inline-flex cursor-pointer items-center gap-2 text-sm";
const SWITCH_INPUT =
  "size-[1.1rem] cursor-pointer accent-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Checkbox-based switch with a visible label. */
export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <label className={SWITCH_LABEL}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        className={SWITCH_INPUT}
      />
      <span>{label}</span>
    </label>
  );
}
