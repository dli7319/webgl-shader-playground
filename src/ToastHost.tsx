import React from "react";

import type { ToastStore } from "./toast";

const TOAST_TIMEOUT_MS = 4000;

export interface ToastHostProps {
  store: ToastStore;
}

/** Renders transient notifications bottom-center with auto-dismiss. */
export function ToastHost({ store }: ToastHostProps) {
  const toasts = React.useSyncExternalStore(store.subscribe, store.getSnapshot);

  React.useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => store.dismiss(toast.id), TOAST_TIMEOUT_MS)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, store]);

  return (
    <div
      className="fixed bottom-4 left-1/2 z-[1000] flex -translate-x-1/2 flex-col gap-1.5"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="surface-panel flex items-center gap-3 px-3 py-1.5 text-[11px] text-ink shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
        >
          <span className="size-1.5 rounded-full bg-ok" aria-hidden="true" />
          <span>{toast.message}</span>
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent text-[13px] leading-none text-ink opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="Dismiss notification"
            onClick={() => store.dismiss(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
