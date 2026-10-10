import React from "react";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import type { SavedShader } from "./shaderStore";

export interface ShaderHistoryProps {
  entries: SavedShader[];
  onSave: (name: string) => void;
  onRemove: (id: string) => void;
  onApply: (source: string) => void;
}

/**
 * Saved-shaders body (lives inside the SAVED SHADERS slab): the save row is
 * the direct affordance of the neutral empty state, plus the entry list.
 */
export function ShaderHistory({
  entries,
  onSave,
  onRemove,
  onApply,
}: ShaderHistoryProps) {
  const [name, setName] = React.useState("");

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    onSave(trimmed);
    setName("");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-stretch gap-3">
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
        <p className="m-0 font-mono text-xs font-bold uppercase tracking-[0.14em]">
          No saved shaders yet.
        </p>
      ) : (
        <ul className="m-0 flex max-h-40 list-none flex-col gap-2 overflow-y-auto p-0">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3">
              <span className="grow overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                {entry.name}
              </span>
              <Button variant="outlined" onClick={() => onApply(entry.source)}>
                Load
              </Button>
              <Button
                variant="outlined"
                tone="warning"
                onClick={() => onRemove(entry.id)}
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
