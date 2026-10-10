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
      className="fixed bottom-4 left-1/2 z-[1000] flex -translate-x-1/2 flex-col gap-3"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-3 border-[3px] border-edge bg-panel px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ink shadow-[5px_5px_0_var(--border)]"
        >
          <span>{toast.message}</span>
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent text-base leading-none text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
