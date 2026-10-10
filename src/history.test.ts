import { describe, expect, it } from "vitest";
import {
  canRedo,
  canUndo,
  createHistory,
  HISTORY_LIMIT,
  pushHistory,
  redoHistory,
  undoHistory,
} from "./history";

describe("history", () => {
  it("starts with the initial value and no navigation", () => {
    const history = createHistory("a");
    expect(history.present).toBe("a");
    expect(canUndo(history)).toBe(false);
    expect(canRedo(history)).toBe(false);
  });

  it("push then undo/redo round-trips", () => {
    let history = createHistory("a");
    history = pushHistory(history, "b");
    history = pushHistory(history, "c");

    expect(history.present).toBe("c");
    history = undoHistory(history);
    expect(history.present).toBe("b");
    history = undoHistory(history);
    expect(history.present).toBe("a");
    expect(canUndo(history)).toBe(false);

    history = redoHistory(history);
    expect(history.present).toBe("b");
    history = redoHistory(history);
    expect(history.present).toBe("c");
    expect(canRedo(history)).toBe(false);
  });

  it("undo is a no-op at the beginning and redo at the end", () => {
    const history = createHistory("a");
    expect(undoHistory(history)).toBe(history);
    expect(redoHistory(history)).toBe(history);
  });

  it("a new push clears the redo stack", () => {
    let history = createHistory("a");
    history = pushHistory(history, "b");
    history = undoHistory(history);
    history = pushHistory(history, "c");
    expect(history.future).toEqual([]);
    expect(history.present).toBe("c");
  });

  it("coalesces identical consecutive values", () => {
    let history = createHistory("a");
    history = pushHistory(history, "a");
    expect(history.past).toHaveLength(0);
  });

  it("bounds the past stack at the limit", () => {
    let history = createHistory(0);
    for (let i = 1; i <= HISTORY_LIMIT + 20; i++) {
      history = pushHistory(history, i);
    }
    expect(history.past).toHaveLength(HISTORY_LIMIT);
  });
});
