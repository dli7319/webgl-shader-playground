import React from "react";

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
    <div className="mt-4 flex flex-col gap-3">
      <div className="section-label">Saved shaders</div>
      <div className="inset-row flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
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
          <p className="m-0 text-sm text-quiet">No saved shaders yet.</p>
        ) : (
          <ul className="m-0 flex max-h-40 list-none flex-col gap-2 overflow-y-auto p-0">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-2 rounded-lg border border-edge bg-panel px-3 py-2"
              >
                <span className="grow overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                  {entry.name}
                </span>
                <Button variant="outlined" onClick={() => onApply(entry.source)}>
                  Load
                </Button>
                <Button
                  variant="outlined"
                  tone="danger"
                  onClick={() => store.remove(entry.id)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
