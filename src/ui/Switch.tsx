import React from "react";

export interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

const SWITCH_LABEL =
  "my-0 inline-flex cursor-pointer select-none items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em]";
const SWITCH_INPUT =
  "size-[0.875rem] accent-[var(--accent-fill)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

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
