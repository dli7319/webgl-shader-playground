import React from "react";

import styles from "./styles/ShaderPlayground.module.css";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { createShaderStore } from "./shaderStore";

export interface ShaderHistoryProps {
  currentSource: string;
  onApply: (source: string) => void;
}

/** Named shader saves backed by localStorage. */
export function ShaderHistory({ currentSource, onApply }: ShaderHistoryProps) {
  const store = React.useMemo(() => createShaderStore(window.localStorage), []);
  const entries = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
  const [name, setName] = React.useState("");

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    store.save(trimmed, currentSource);
    setName("");
  }

  return (
    <div className={styles.historyPanel}>
      <div className={styles.historySaveRow}>
        <TextField
          label="Save as"
          value={name}
          aria-label="Shader save name"
          onChange={setName}
        />
        <Button
          variant="outlined"
          onClick={handleSave}
          disabled={name.trim().length === 0}
        >
          Save shader
        </Button>
      </div>
      {entries.length === 0 ? (
        <p className={styles.historyEmpty}>No saved shaders yet.</p>
      ) : (
        <ul className={styles.historyList}>
          {entries.map((entry) => (
            <li key={entry.id} className={styles.historyItem}>
              <span className={styles.historyName}>{entry.name}</span>
              <Button variant="outlined" onClick={() => onApply(entry.source)}>
                Load
              </Button>
              <Button
                variant="outlined"
                tone="warning"
                onClick={() => store.remove(entry.id)}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
