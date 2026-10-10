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

const FIELD = "relative inline-flex min-w-[120px] grow";
const INPUT =
  "peer box-border w-full rounded-[6px] border border-[var(--border-strong)] bg-transparent px-3 pt-3 pb-1 text-ink [font:inherit] focus:border-accent focus:shadow-[0_0_0_1px_var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const LABEL =
  "pointer-events-none absolute left-[0.65rem] top-[0.55rem] text-sm text-muted transition-all duration-100 peer-focus:top-[0.2rem] peer-focus:text-[0.65rem] peer-[&:not(:placeholder-shown)]:top-[0.2rem] peer-[&:not(:placeholder-shown)]:text-[0.65rem]";

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
