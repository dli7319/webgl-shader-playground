import React from "react";

export interface InspectorSectionProps {
  /** Stable id shared between the trigger and its body. */
  id: string;
  title: string;
  /**
   * Read-only state summary shown beside the title. Hidden controls must
   * report their state next to the control that opens them.
   */
  summary?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  /** The group's action, kept on the trigger row (one object, one place). */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Slim inspector section: small-caps title, state summary, one disclosure.
 * The body stays in the DOM (hidden) when closed so the control's text and
 * labels survive while the always-visible surface stays quiet.
 */
export function InspectorSection({
  id,
  title,
  summary,
  open,
  onToggle,
  action,
  children,
  className,
}: InspectorSectionProps) {
  const bodyId = `${id}-body`;
  return (
    <section className={["inspector-section", className].filter(Boolean).join(" ")}>
      <div className="inspector-head">
        <button
          type="button"
          className="inspector-trigger"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={onToggle}
        >
          <span className="inspector-title">{title}</span>{" "}
          {summary ? <span className="inspector-summary">{summary}</span> : null}
          <span
            aria-hidden="true"
            className={`inspector-chevron${open ? " is-open" : ""}`}
          >
            ▾
          </span>
        </button>
        {action ? <div className="inspector-action">{action}</div> : null}
      </div>
      <div id={bodyId} className="inspector-body" hidden={!open}>
        {children}
      </div>
    </section>
  );
}
