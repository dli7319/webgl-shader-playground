import React from "react";
import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import type { Settings } from "./settings";

export interface SettingsDialogProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

const FIELD = "flex flex-col gap-1.5 text-sm";
const FIELD_INPUT =
  "w-24 rounded border border-edge bg-app px-2 py-[0.35rem] text-ink [font:inherit] focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Settings panel with the persisted preferences. The theme toggle lives here
 * (one object, one control); auto-run lives in the editor inspector section.
 */
export function SettingsDialog({ settings, onChange, onClose }: SettingsDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-[var(--overlay)]"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="flex min-w-[280px] flex-col gap-4 rounded border border-edge bg-app px-6 py-5 text-ink">
        <h2 className="m-0 font-display text-xl font-semibold text-strong">Settings</h2>
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
        <div className={FIELD}>
          Theme
          <Button
            variant="outlined"
            onClick={() =>
              onChange({ themeMode: settings.themeMode === "light" ? "dark" : "light" })
            }
          >
            {settings.themeMode === "light" ? "Dark theme" : "Light theme"}
          </Button>
        </div>
        <Button variant="outlined" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
