export interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

export const HISTORY_LIMIT = 100;

/** Creates a history with an initial value. */
export function createHistory<T>(present: T): History<T> {
  return { past: [], present, future: [] };
}

/**
 * Records a new value. Consecutive identical values are coalesced so a
 * repeated save doesn't eat history slots.
 */
export function pushHistory<T>(history: History<T>, value: T): History<T> {
  if (Object.is(history.present, value)) {
    return history;
  }
  const past = [...history.past, history.present].slice(-HISTORY_LIMIT);
  return { past, present: value, future: [] };
}

/** Steps back; returns the same history when there is nothing to undo. */
export function undoHistory<T>(history: History<T>): History<T> {
  if (history.past.length === 0) {
    return history;
  }
  const previous = history.past[history.past.length - 1];
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

/** Steps forward; returns the same history when there is nothing to redo. */
export function redoHistory<T>(history: History<T>): History<T> {
  if (history.future.length === 0) {
    return history;
  }
  return {
    past: [...history.past, history.present],
    present: history.future[0],
    future: history.future.slice(1),
  };
}

export function canUndo<T>(history: History<T>): boolean {
  return history.past.length > 0;
}

export function canRedo<T>(history: History<T>): boolean {
  return history.future.length > 0;
}
