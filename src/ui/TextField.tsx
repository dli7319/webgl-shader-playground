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
  "peer box-border w-full rounded-[2px] border border-edge bg-transparent px-3 pt-3 pb-1 text-ink [font-family:var(--font-mono)] focus:border-accent focus:shadow-[0_0_8px_var(--glow)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const LABEL =
  "pointer-events-none absolute left-[0.65rem] top-[0.55rem] text-base text-ink opacity-75 transition-all duration-100 [font-family:var(--font-mono)] peer-focus:top-[0.15rem] peer-focus:text-[0.65rem] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.16em] peer-[&:not(:placeholder-shown)]:top-[0.15rem] peer-[&:not(:placeholder-shown)]:text-[0.65rem] peer-[&:not(:placeholder-shown)]:font-semibold peer-[&:not(:placeholder-shown)]:uppercase peer-[&:not(:placeholder-shown)]:tracking-[0.16em]";

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
