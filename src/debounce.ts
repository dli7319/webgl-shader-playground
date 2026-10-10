export interface Debouncer {
  /** Schedules `fn`, replacing any previously scheduled call. */
  schedule: (fn: () => void) => void;
  /** Cancels the pending call, if any. */
  cancel: () => void;
}

/** Creates a trailing-edge debouncer: `fn` runs `ms` after the last schedule. */
export function createDebouncer(ms: number): Debouncer {
  let handle: ReturnType<typeof setTimeout> | null = null;

  return {
    schedule(fn: () => void): void {
      if (handle !== null) {
        clearTimeout(handle);
      }
      handle = setTimeout(() => {
        handle = null;
        fn();
      }, ms);
    },
    cancel(): void {
      if (handle !== null) {
        clearTimeout(handle);
        handle = null;
      }
    },
  };
}
