import React from "react";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { createShaderStore, type ShaderStore } from "./shaderStore";

export interface ShaderHistoryProps {
  currentSource: string;
  onApply: (source: string) => void;
  /** Optional shared store (the dock reads its entry count from the same one). */
  store?: ShaderStore;
}

/** Named shader saves backed by localStorage. */
export function ShaderHistory({ currentSource, onApply, store }: ShaderHistoryProps) {
  const fallbackStore = React.useMemo(() => createShaderStore(window.localStorage), []);
  const shaderStore = store ?? fallbackStore;
  const entries = React.useSyncExternalStore(shaderStore.subscribe, shaderStore.getSnapshot);
  const [name, setName] = React.useState("");

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    shaderStore.save(trimmed, currentSource);
    setName("");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
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
        <p className="m-0 text-sm opacity-70">
          No saved shaders yet — name the current shader above to keep it.
        </p>
      ) : (
        <ul className="m-0 flex max-h-40 list-none flex-col gap-1.5 overflow-y-auto p-0">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-2">
              <span className="grow overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                {entry.name}
              </span>
              <Button variant="outlined" onClick={() => onApply(entry.source)}>
                Load
              </Button>
              <Button
                variant="outlined"
                tone="warning"
                onClick={() => shaderStore.remove(entry.id)}
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
