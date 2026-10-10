import React from "react";

import { BottomSheet } from "./BottomSheet";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { createShaderStore } from "./shaderStore";

export interface ShaderHistoryProps {
  currentSource: string;
  onApply: (source: string) => void;
  onResetShader: () => void;
}

/**
 * History state chip + bottom sheet: named shader saves backed by localStorage,
 * plus the factory default as the "restore" fallback. The chip's summary keeps
 * the save count visible while the sheet is closed.
 */
export function ShaderHistory({
  currentSource,
  onApply,
  onResetShader,
}: ShaderHistoryProps) {
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
    <>
      <button type="button" className="state-chip" onClick={() => setOpen(true)}>
        <span className="font-semibold">History</span>{" "}
        <span className="text-muted">
          {entries.length === 0 ? "No saves" : `${entries.length} saved`}
        </span>
      </button>
      {open ? (
        <BottomSheet title="History" onClose={() => setOpen(false)}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
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
            <div className="mt-2 flex flex-col gap-2 border-t border-edge pt-3">
              <span className="section-label">Restore</span>
              <div>
                <Button variant="outlined" tone="warning" onClick={onResetShader}>
                  Reset to default shader
                </Button>
              </div>
            </div>
          </div>
        </BottomSheet>
      ) : null}
    </>
  );
}
