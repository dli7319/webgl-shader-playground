import React from "react";

let nextId = 0;

export interface HudModuleProps {
  /** Short uppercase module name, e.g. "OUTPUT". */
  title: string;
  /** Read-only state summary shown beside the opener, e.g. "1920×1080 · screenshot.png". */
  summary: string;
  children: React.ReactNode;
  /** Test hook: start expanded. The app ships collapsed. */
  defaultOpen?: boolean;
}

const HEAD_BUTTON =
  "hud-module-head focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const SUMMARY =
  "hud-readout grow overflow-hidden text-ellipsis whitespace-nowrap opacity-75";
const TOGGLE = "text-sm font-bold leading-none text-accent";

/**
 * Collapsible HUD panel with a readout header: the header always reports the
 * module's state (rule: hidden controls must report their state beside the
 * control that opens them).
 */
export function HudModule({
  title,
  summary,
  children,
  defaultOpen = false,
}: HudModuleProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const bodyId = React.useMemo(() => `hud-module-${nextId++}`, []);
  return (
    <section className="surface-panel">
      <button
        type="button"
        className={HEAD_BUTTON}
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="hud-module-title">{title}</span>
        <span className={SUMMARY}>{summary}</span>
        <span aria-hidden="true" className={TOGGLE}>
          {open ? "−" : "+"}
        </span>
      </button>
      <div
        id={bodyId}
        hidden={!open}
        className={open ? "flex flex-col gap-2 p-2" : "p-2"}
      >
        {children}
      </div>
    </section>
  );
}
