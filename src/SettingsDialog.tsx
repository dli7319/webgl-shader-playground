import React from "react";
import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import type { Settings } from "./settings";

export interface SettingsDialogProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

const FIELD = "flex flex-col gap-2 text-xs font-bold uppercase tracking-[0.14em]";
const FIELD_INPUT =
  "w-28 rounded-[2px] border-2 border-edge bg-panel px-2 py-[0.45rem] text-ink shadow-[2px_2px_0_var(--border)] [font:inherit]";

/** Modal-less settings panel with the persisted preferences. */
export function SettingsDialog({ settings, onChange, onClose }: SettingsDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-[rgba(16,16,16,0.55)]"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="surface-panel flex min-w-[300px] flex-col gap-4 px-6 py-5 text-ink shadow-[8px_8px_0_var(--border)]">
        <h2 className="m-0">
          <span className="section-label px-3 py-1 text-[0.95rem] tracking-[0.22em]">
            Settings
          </span>
        </h2>
        <label className={FIELD}>
          Editor font size
          <input
            type="number"
            min={8}
            max={32}
            value={settings.editorFontSize}
            aria-label="Editor font size"
            className={FIELD_INPUT}
            onChange={(e) =>
              onChange({
                editorFontSize: Number((e.target as HTMLInputElement).value),
              })
            }
          />
        </label>
        <Switch
          checked={settings.wordWrap}
          onChange={() => onChange({ wordWrap: !settings.wordWrap })}
          label="Word wrap"
        />
        <Switch
          checked={settings.autoRun}
          onChange={() => onChange({ autoRun: !settings.autoRun })}
          label="Auto-run while typing"
        />
        <div className={FIELD}>
          Theme
          <div className="flex flex-row flex-wrap items-stretch gap-3">
            <Button
              variant={settings.themeMode === "light" ? "contained" : "outlined"}
              onClick={() => onChange({ themeMode: "light" })}
            >
              Light
            </Button>
            <Button
              variant={settings.themeMode === "dark" ? "contained" : "outlined"}
              onClick={() => onChange({ themeMode: "dark" })}
            >
              Dark
            </Button>
          </div>
        </div>
        <Button variant="outlined" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
