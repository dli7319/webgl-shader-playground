import React from "react";
import { Button } from "./ui/Button";

export type DockSheetName = "export" | "history" | "settings";

export interface ActionDockProps {
  onRunShader: () => void;
  themeMode: "light" | "dark";
  onToggleTheme: () => void;
  openSheet: DockSheetName | null;
  onToggleSheet: (sheet: DockSheetName) => void;
  width: number;
  height: number;
  screenshotFilename: string;
  downloadShaderFilename: string;
  isRecording: boolean;
  savedCount: number;
  editorFontSize: number;
  wordWrap: boolean;
  autoRun: boolean;
  textureLabel: string;
}

interface DockItemProps {
  label: string;
  summary: string;
  summary2?: string;
  active: boolean;
  badge?: string | null;
  onClick: () => void;
}

/** Quiet dock item: label plus a tiny live summary of the hidden controls. */
function DockItem({ label, summary, summary2, active, badge, onClick }: DockItemProps) {
  return (
    <Button variant="outlined" className="dock-item" aria-expanded={active} onClick={onClick}>
      <span className="dock-item-label">{label}</span>
      <span className="dock-item-summary">{summary}</span>
      {summary2 ? <span className="dock-item-summary">{summary2}</span> : null}
      {badge ? (
        <span className="dock-badge" aria-hidden="true">
          {badge}
        </span>
      ) : null}
    </Button>
  );
}

/**
 * macOS-style floating glass dock: the single filled primary (Run Shader)
 * glows at the left; everything else is a quiet item with a state summary.
 */
export function ActionDock({
  onRunShader,
  themeMode,
  onToggleTheme,
  openSheet,
  onToggleSheet,
  width,
  height,
  screenshotFilename,
  downloadShaderFilename,
  isRecording,
  savedCount,
  editorFontSize,
  wordWrap,
  autoRun,
  textureLabel,
}: ActionDockProps) {
  return (
    <div className="dock">
      <Button variant="contained" className="dock-item dock-item-primary" onClick={onRunShader}>
        <span className="dock-item-label">Run Shader (Ctrl+Enter)</span>
      </Button>
      <span className="dock-sep" aria-hidden="true" />
      <Button variant="outlined" className="dock-item" onClick={onToggleTheme}>
        <span className="dock-item-label">
          {themeMode === "light" ? "Dark theme" : "Light theme"}
        </span>
        <span className="dock-item-summary">
          {themeMode === "light" ? "Light now" : "Dark now"}
        </span>
      </Button>
      <DockItem
        label="Export"
        summary={`${width}×${height} · ${screenshotFilename}`}
        summary2={downloadShaderFilename}
        badge={isRecording ? "REC" : null}
        active={openSheet === "export"}
        onClick={() => onToggleSheet("export")}
      />
      <DockItem
        label="History"
        summary={savedCount === 0 ? "No saves" : `${savedCount} saved`}
        active={openSheet === "history"}
        onClick={() => onToggleSheet("history")}
      />
      <DockItem
        label="Settings"
        summary={`${editorFontSize}px · wrap ${wordWrap ? "on" : "off"} · auto ${
          autoRun ? "on" : "off"
        }`}
        summary2={`tDiffuse: ${textureLabel}`}
        active={openSheet === "settings"}
        onClick={() => onToggleSheet("settings")}
      />
    </div>
  );
}
