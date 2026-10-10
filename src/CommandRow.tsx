import React from "react";
import { Button } from "./ui/Button";

export interface CommandRowProps {
  onRunShader: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  configOpen: boolean;
  onToggleConfig: () => void;
  configSummary: string;
  archiveOpen: boolean;
  onToggleArchive: () => void;
  archiveSummary: string;
}

/**
 * Bottom command row: bracketed command keys in one box language, with the
 * single filled action (Run Shader) first. The CONFIG / ARCHIVE keys toggle
 * drawers and print a read-only state summary beside themselves so the
 * hidden groups' state stays visible.
 */
export function CommandRow({
  onRunShader,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  configOpen,
  onToggleConfig,
  configSummary,
  archiveOpen,
  onToggleArchive,
  archiveSummary,
}: CommandRowProps) {
  return (
    <div className="command-row">
      <span className="section-label" aria-hidden="true">
        Command
      </span>
      <span className="cmd">
        <Button variant="contained" onClick={onRunShader}>
          Run Shader (Ctrl+Enter)
        </Button>
      </span>
      <span className="cmd">
        <Button variant="outlined" onClick={onUndo} disabled={!canUndo}>
          Undo
        </Button>
      </span>
      <span className="cmd">
        <Button variant="outlined" onClick={onRedo} disabled={!canRedo}>
          Redo
        </Button>
      </span>
      <span className="grow" aria-hidden="true" />
      <span className="flex items-center gap-2">
        <span className="cmd">
          <Button
            variant="outlined"
            tone={configOpen ? "live" : "default"}
            aria-expanded={configOpen}
            aria-controls="config-drawer"
            onClick={onToggleConfig}
          >
            Config
          </Button>
        </span>
        <span className="state-chip">{configSummary}</span>
      </span>
      <span className="flex items-center gap-2">
        <span className="cmd">
          <Button
            variant="outlined"
            tone={archiveOpen ? "live" : "default"}
            aria-expanded={archiveOpen}
            aria-controls="archive-drawer"
            onClick={onToggleArchive}
          >
            Archive
          </Button>
        </span>
        <span className="state-chip">{archiveSummary}</span>
      </span>
    </div>
  );
}
