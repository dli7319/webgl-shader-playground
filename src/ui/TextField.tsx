import React from "react";

export interface TextFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number" | "search";
  className?: string;
  "aria-label"?: string;
}

let nextId = 0;

const FIELD =
  "well group inline-flex h-6 min-w-[120px] grow items-center overflow-hidden focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-accent";
const INPUT =
  "order-2 h-full w-full min-w-0 bg-transparent px-2 text-[11px] text-ink [font-family:inherit] focus:outline-none";
const LABEL =
  "order-1 flex h-full select-none items-center whitespace-nowrap border-r border-edge bg-[var(--hover)] px-2 text-[10px] font-semibold uppercase tracking-[0.1em]";

/** Flat inset well: tiny-caps label prefix + dense 24px input. */
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
    className: INPUT,
    onChange: (e: Event) => onChange((e.target as HTMLInputElement).value),
  };
  return (
    <label className={[FIELD, className].filter(Boolean).join(" ")}>
      <input {...(inputProps as any)} />
      <span className={LABEL}>{label}</span>
    </label>
  );
}
