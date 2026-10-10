import React from "react";

import styles from "./styles/ShaderPlayground.module.css";
import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import type { Settings } from "./settings";

export interface SettingsDialogProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
}

/** Modal-less settings panel with the persisted preferences. */
export function SettingsDialog({ settings, onChange, onClose }: SettingsDialogProps) {
  return (
    <div
      className={styles.dialogOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className={styles.dialog}>
        <h2 className={styles.dialogTitle}>Settings</h2>
        <label className={styles.dialogField}>
          Editor font size
          <input
            type="number"
            min={8}
            max={32}
            value={settings.editorFontSize}
            aria-label="Editor font size"
            onChange={(e) => onChange({ editorFontSize: Number(e.target.value) })}
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
        <div className={styles.dialogField}>
          Theme
          <div>
            <Button
              variant={settings.themeMode === "light" ? "contained" : "outlined"}
              onClick={() => onChange({ themeMode: "light" })}
            >
              Light
            </Button>{" "}
            <Button
              variant={settings.themeMode === "dark" ? "contained" : "outlined"}
              onClick={() => onChange({ themeMode: "dark" })}
            >
              Dark
            </Button>
          </div>
        </div>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
