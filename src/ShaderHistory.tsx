import React from "react";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { createShaderStore } from "./shaderStore";

export interface ShaderHistoryProps {
  currentSource: string;
  onApply: (source: string) => void;
  onResetShader: () => void;
}

/**
 * The source page's margin index: other lives of this text — named saves and
 * the default template. Collapsed by default, summarized on its opener chip
 * (`Saved shaders · N`); the empty state stays neutral with the save
 * affordance right where it is needed.
 */
export function ShaderHistory({ currentSource, onApply, onResetShader }: ShaderHistoryProps) {
  const store = React.useMemo(() => createShaderStore(window.localStorage), []);
  const entries = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
  const [name, setName] = React.useState("");
  const [open, setOpen] = React.useState(false);

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
      <button
        type="button"
        className="chip-summary w-full justify-between"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>Saved shaders</span>
        <span className="text-muted">· {entries.length}</span>
      </button>
      {open ? (
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
                  <Button tone="danger" onClick={() => store.remove(entry.id)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-1 border-t border-dashed border-[var(--border-strong)] pt-2">
            <Button tone="danger" className="w-full" onClick={onResetShader}>
              Reset to default shader
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
