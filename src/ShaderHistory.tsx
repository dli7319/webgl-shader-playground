import React from "react";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import type { ShaderStore, SavedShader } from "./shaderStore";

export interface ShaderHistoryProps {
  store: ShaderStore;
  entries: readonly SavedShader[];
  currentSource: string;
  onApply: (source: string) => void;
}

/** Named shader saves backed by localStorage. */
export function ShaderHistory({
  store,
  entries,
  currentSource,
  onApply,
}: ShaderHistoryProps) {
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
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
        <p className="m-0 text-sm text-muted">No saved shaders yet.</p>
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
