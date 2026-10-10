import React from "react";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import type { ShaderStore } from "./shaderStore";

export interface ShaderHistoryProps {
  /** Shared store instance so the command-strip chip can report its count. */
  store: ShaderStore;
  currentSource: string;
  onApply: (source: string) => void;
}

/** Named shader saves backed by localStorage (one group: name + save + list). */
export function ShaderHistory({ store, currentSource, onApply }: ShaderHistoryProps) {
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
    <div className="flex flex-col gap-2">
      <span className="section-label">Saved shaders</span>
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
        <ul className="m-0 flex max-h-40 list-none flex-col overflow-y-auto p-0">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-2 border-t border-edge py-1.5 first:border-t-0 first:pt-0"
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
  );
}
