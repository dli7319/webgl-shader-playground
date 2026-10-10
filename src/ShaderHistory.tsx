import React from "react";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { HudModule } from "./ui/HudModule";
import { createShaderStore } from "./shaderStore";

export interface ShaderHistoryProps {
  currentSource: string;
  onApply: (source: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onResetShader: () => void;
}

/**
 * HISTORY module — the editor's timeline (Undo/Redo), named shader saves
 * (name + Save shader + list), and the destructive factory reset. Collapsed
 * behind a readout header that always reports how many saves exist.
 */
export function ShaderHistory({
  currentSource,
  onApply,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onResetShader,
}: ShaderHistoryProps) {
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
    <HudModule
      title="HISTORY"
      summary={entries.length === 0 ? "no saves" : `${entries.length} saved`}
    >
      <div className="flex flex-row flex-wrap gap-2">
        <Button
          variant="outlined"
          onClick={onUndo}
          disabled={!canUndo}
          className="grow"
        >
          Undo
        </Button>
        <Button
          variant="outlined"
          onClick={onRedo}
          disabled={!canRedo}
          className="grow"
        >
          Redo
        </Button>
      </div>
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
        <p className="m-0 text-sm opacity-70">No saved shaders yet.</p>
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
      <Button variant="outlined" tone="warning" onClick={onResetShader}>
        Reset to default shader
      </Button>
    </HudModule>
  );
}
