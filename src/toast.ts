export interface Toast {
  id: number;
  message: string;
}

export interface ToastStore {
  /** Returns the current toasts (stable identity between changes). */
  getSnapshot: () => Toast[];
  /** Adds a toast and returns its id. */
  add: (message: string) => number;
  /** Removes a toast by id. */
  dismiss: (id: number) => void;
  /** Subscribes to changes; returns an unsubscribe function. */
  subscribe: (listener: () => void) => () => void;
}

/** Creates an in-memory toast store, independent of any UI framework. */
export function createToastStore(): ToastStore {
  let toasts: Toast[] = [];
  let nextId = 1;
  const listeners = new Set<() => void>();

  const notify = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    getSnapshot: () => toasts,
    add(message: string): number {
      const id = nextId++;
      toasts = [...toasts, { id, message }];
      notify();
      return id;
    },
    dismiss(id: number): void {
      const next = toasts.filter((toast) => toast.id !== id);
      if (next.length !== toasts.length) {
        toasts = next;
        notify();
      }
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
