import { describe, expect, it } from "vitest";
import {
  checkBudgets,
  formatBytes,
  formatReport,
  type Budget,
  type FileSize,
} from "./check-size";

const budgets: Budget[] = [
  { label: "initial", pattern: /^main\.js$/, maxBytes: 1000 },
  { label: "worker", pattern: /\.worker\.js$/, maxBytes: 5000 },
];

describe("checkBudgets", () => {
  it("passes when every file is within budget", () => {
    const files: FileSize[] = [
      { name: "main.js", size: 900 },
      { name: "editor.worker.js", size: 4000 },
    ];
    expect(checkBudgets(files, budgets)).toEqual([]);
  });

  it("reports each violating file with both sizes", () => {
    const files: FileSize[] = [
      { name: "main.js", size: 1500 },
      { name: "ts.worker.js", size: 9000 },
    ];
    const violations = checkBudgets(files, budgets);
    expect(violations).toHaveLength(2);
    expect(violations[0]).toContain("main.js");
    expect(violations[0]).toContain("initial");
    expect(violations[1]).toContain("ts.worker.js");
  });

  it("ignores files no budget covers", () => {
    expect(checkBudgets([{ name: "notes.txt", size: 9e9 }], budgets)).toEqual([]);
  });
});

describe("reporting helpers", () => {
  it("formats byte sizes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
  });

  it("formats a size report", () => {
    const report = formatReport([{ name: "main.js", size: 1024 }]);
    expect(report).toContain("Bundle sizes:");
    expect(report).toContain("main.js");
    expect(report).toContain("1.0 KB");
  });
});
