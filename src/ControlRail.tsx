import React from "react";

import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import { slabPanelId } from "./ui/Slab";
import {
  SLAB_IDS,
  slabFlag,
  slabSummaryText,
  slabTitle,
  type SlabId,
  type SlabStateInfo,
} from "./ToolSlabs";

export interface ControlRailProps {
  autoRun: boolean;
  onToggleAutoRun: () => void;
  onRunShader: () => void;
  openSlabs: Record<SlabId, boolean>;
  onToggleSlab: (id: SlabId) => void;
  info: SlabStateInfo;
}

/**
 * Chunky bottom control rail: the run-mode flag, the ONE primary action, and
 * the bracketed summaries that disclose (and report the state of) each slab.
 */
export function ControlRail({
  autoRun,
  onToggleAutoRun,
  onRunShader,
  openSlabs,
  onToggleSlab,
  info,
}: ControlRailProps) {
  return (
    <footer className="rail">
      <Switch
        checked={autoRun}
        onChange={onToggleAutoRun}
        label="Auto-run while typing"
      />
      <Button variant="contained" onClick={onRunShader} className="rail-run">
        Run Shader (Ctrl+Enter)
      </Button>
      <div className="rail-brackets">
        {SLAB_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className="bracket-btn"
            aria-expanded={openSlabs[id]}
            aria-controls={slabPanelId(id)}
            onClick={() => onToggleSlab(id)}
          >
            {`[ ${slabTitle(id)} · ${slabSummaryText(info, id)} ]`}
            {slabFlag(info, id)}
          </button>
        ))}
      </div>
    </footer>
  );
}
