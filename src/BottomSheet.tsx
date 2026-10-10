import React from "react";

import { Button } from "./ui/Button";

export interface BottomSheetProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/** Soft bottom sheet: dimmed scrim with a rounded tray rising from the bottom. */
export function BottomSheet({ title, onClose, children }: BottomSheetProps) {
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
    <div
      className="fixed inset-0 z-[1100] flex items-end justify-center bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="surface-panel max-h-[85vh] w-full max-w-[820px] overflow-y-auto rounded-b-none rounded-t-[26px] px-5 pb-6 pt-3"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-grabber mx-auto mb-3" aria-hidden="true" />
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="m-0 text-lg font-bold tracking-[0.01em]">{title}</h2>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
