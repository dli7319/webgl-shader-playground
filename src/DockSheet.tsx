import React from "react";
import { Button } from "./ui/Button";

export interface DockSheetProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/** Frosted glass sheet that rises above the action dock. */
export function DockSheet({ title, onClose, children }: DockSheetProps) {
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="sheet-wrap">
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="sheet surface-panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-head">
          <h2 className="sheet-title">{title}</h2>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
