import React from "react";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import type { SavedShader } from "./shaderStore";

export interface ShaderHistoryProps {
  /** Saved entries from the backing store. */
  entries: SavedShader[];
  currentSource: string;
  onSave: (name: string) => void;
  onApply: (source: string) => void;
  onDelete: (id: string) => void;
}

/** Named shader save form plus the saved list (one object, one group). */
export function ShaderHistory({
  entries,
  onSave,
  onApply,
  onDelete,
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
      <div className="flex items-center gap-2">
        <TextField
          label="Save as"
          className="grow"
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
        <ul className="m-0 flex max-h-48 list-none flex-col gap-2 overflow-y-auto p-0">
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
                onClick={() => onDelete(entry.id)}
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
