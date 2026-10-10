import React from "react";

export interface SlabProps {
  /** Stable id used by the rail bracket that discloses this slab. */
  id: string;
  title: string;
  /** State stamp shown on the filled title bar (also when collapsed). */
  summary: React.ReactNode;
  open: boolean;
  children: React.ReactNode;
}

/** Panel id the disclosing control points at via aria-controls. */
export function slabPanelId(id: string): string {
  return `slab-${id}-panel`;
}

/**
 * Collapsible slab: a filled title bar that always reports the state of its
 * controls, and a body that is disclosed by the matching rail bracket.
 */
export function Slab({ id, title, summary, open, children }: SlabProps) {
  return (
    <section className="slab">
      <div className="slab-bar">
        <span aria-hidden="true">{open ? "▾" : "▸"}</span>
        <span className="slab-title">{title}</span>
        <span className="slab-state">
          [ {summary} ]
        </span>
      </div>
      <div id={slabPanelId(id)} className="slab-body" hidden={!open}>
        {children}
      </div>
    </section>
  );
}
