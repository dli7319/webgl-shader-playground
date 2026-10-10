import React from "react";

import { BottomSheet } from "./BottomSheet";
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
  "w-24 rounded-xl border-none bg-panel px-2.5 py-[0.4rem] text-ink shadow-[var(--shadow-inset-sm)] [font:inherit] focus:shadow-[var(--shadow-inset)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** Soft settings sheet with the persisted preferences. */
export function SettingsDialog({ settings, onChange, onClose }: SettingsDialogProps) {
  return (
    <BottomSheet title="Settings" onClose={onClose}>
      <div className="flex flex-col gap-3">
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
              onClick={() =>
                onChange({
                  themeMode: settings.themeMode === "light" ? "dark" : "light",
                })
              }
            >
              {settings.themeMode === "light" ? "Dark theme" : "Light theme"}
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
