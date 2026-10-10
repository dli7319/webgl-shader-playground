import React from "react";

import { BottomSheet } from "./BottomSheet";
import { ImageIcon } from "./ui/icons";

export interface TextureControlsProps {
  onPickImage: (dataUrl: string) => void;
}

const PICK_LABEL =
  "inline-flex min-w-16 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-edge bg-panel px-4 py-[0.45rem] text-sm font-semibold tracking-[0.01em] text-ink shadow-[var(--shadow-raised-sm)] transition-shadow duration-150 [font:inherit] hover:shadow-[var(--shadow-raised)] active:shadow-[var(--shadow-inset-sm)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent";

/** Texture state chip + bottom sheet holding the tDiffuse image picker. */
export function TextureControls({ onPickImage }: TextureControlsProps) {
  const [open, setOpen] = React.useState(false);
  const [pickedName, setPickedName] = React.useState<string | null>(null);

  return (
    <>
      <button type="button" className="state-chip" onClick={() => setOpen(true)}>
        <span className="font-semibold">Texture</span>{" "}
        <span className="text-muted">{pickedName ?? "Default texture"}</span>
      </button>
      {open ? (
        <BottomSheet title="Texture" onClose={() => setOpen(false)}>
          <div className="flex flex-col gap-3">
            <p className="m-0 text-sm text-muted">
              The sampler <span className="font-mono">tDiffuse</span> uses the bundled
              default texture until you pick an image.
            </p>
            <div>
              <label className={PICK_LABEL}>
                <ImageIcon /> Pick tDiffuse Image
                <input
                  type="file"
                  className="sr-only"
                  aria-label="Choose a texture image"
                  accept="image/*"
                  onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      setPickedName(file.name);
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const dataUrl = ev.target?.result;
                        if (typeof dataUrl === "string") {
                          onPickImage(dataUrl);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </BottomSheet>
      ) : null}
    </>
  );
}
