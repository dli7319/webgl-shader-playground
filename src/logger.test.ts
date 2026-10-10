import { describe, expect, it } from "vitest";
import { createLogger, type LogLevel } from "./logger";

function capture() {
  const entries: Array<[LogLevel, string]> = [];
  return {
    entries,
    sink: (level: LogLevel, formatted: string) => {
      entries.push([level, formatted]);
    },
  };
}

describe("createLogger", () => {
  it("prefixes messages with the channel", () => {
    const { entries, sink } = capture();
    const log = createLogger("screenshot", { sink });
    log.info("captured");
    expect(entries).toEqual([["info", "[screenshot] captured"]]);
  });

  it("emits every level by default in tests", () => {
    const { entries, sink } = capture();
    const log = createLogger("t", { sink });
    log.debug("d");
    log.info("i");
    log.warn("w");
    log.error("e");
    expect(entries.map(([level]) => level)).toEqual(["debug", "info", "warn", "error"]);
  });

  it("filters below minLevel", () => {
    const { entries, sink } = capture();
    const log = createLogger("t", { sink, minLevel: "warn" });
    log.debug("d");
    log.info("i");
    log.warn("w");
    log.error("e");
    expect(entries.map(([level]) => level)).toEqual(["warn", "error"]);
  });

  it("keeps channels independent", () => {
    const a = capture();
    const b = capture();
    createLogger("a", { sink: a.sink }).info("x");
    createLogger("b", { sink: b.sink }).info("x");
    expect(a.entries[0][1]).toBe("[a] x");
    expect(b.entries[0][1]).toBe("[b] x");
  });
});
