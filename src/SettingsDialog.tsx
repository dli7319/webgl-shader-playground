import React from "react";

import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import type { Settings } from "./settings";

export interface SettingsDialogProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

const FIELD = "flex flex-col gap-1.5 text-sm text-muted";
const FIELD_INPUT = "input-quiet w-24";

/** Modal-less settings panel with the persisted preferences. */
export function SettingsDialog({ settings, onChange, onClose }: SettingsDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/45"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="surface-panel flex min-w-[280px] flex-col gap-3 bg-app px-5 py-4 text-ink shadow-[0_8px_28px_rgba(0,0,0,0.22)]">
        <h2 className="m-0 text-base font-semibold tracking-[-0.01em]">Settings</h2>
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
          <div>
            <Button
              variant="outlined"
              className={settings.themeMode === "light" ? "btn-selected" : ""}
              onClick={() => onChange({ themeMode: "light" })}
            >
              Light
            </Button>{" "}
            <Button
              variant="outlined"
              className={settings.themeMode === "dark" ? "btn-selected" : ""}
              onClick={() => onChange({ themeMode: "dark" })}
            >
              Dark
            </Button>
          </div>
        </div>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
