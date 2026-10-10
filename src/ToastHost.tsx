import React from "react";

import styles from "./styles/ShaderPlayground.module.css";
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
    <div className={styles.toastHost} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={styles.toast}>
          <span>{toast.message}</span>
          <button
            type="button"
            className={styles.toastClose}
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
