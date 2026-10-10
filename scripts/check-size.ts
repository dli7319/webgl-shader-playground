import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export interface FileSize {
  name: string;
  size: number;
}

export interface Budget {
  label: string;
  pattern: RegExp;
  maxBytes: number;
}

const KB = 1024;

/**
 * Size budgets for the build output. These are enforced limits — raising one
 * should be a deliberate decision reviewed like any other change.
 */
export const BUDGETS: Budget[] = [
  {
    label: "initial bundle (main.js)",
    pattern: /^main\.js$/,
    maxBytes: 700 * KB,
  },
  {
    label: "lazy chunk",
    pattern: /^\d+\.main\.js$|^[A-Za-z]+-[A-Za-z0-9_-]{8}\.js$/,
    maxBytes: 3 * 1024 * KB,
  },
  {
    label: "monaco worker",
    pattern: /\.worker\.js$/,
    maxBytes: 8 * 1024 * KB,
  },
];

export function formatBytes(bytes: number): string {
  if (bytes < KB) {
    return `${bytes} B`;
  }
  return `${(bytes / KB).toFixed(1)} KB`;
}

/** Returns human-readable violation lines; empty when every budget holds. */
export function checkBudgets(files: FileSize[], budgets: Budget[] = BUDGETS): string[] {
  const violations: string[] = [];
  for (const budget of budgets) {
    for (const file of files) {
      if (budget.pattern.test(file.name) && file.size > budget.maxBytes) {
        violations.push(
          `${file.name} (${formatBytes(file.size)}) exceeds ${budget.label} budget of ${formatBytes(budget.maxBytes)}`
        );
      }
    }
  }
  return violations;
}

export function collectDistSizes(dir: string): FileSize[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".js"))
    .map((name) => ({ name, size: statSync(join(dir, name)).size }))
    .sort((a, b) => b.size - a.size);
}

export function formatReport(files: FileSize[]): string {
  const lines = files.map(
    (file) => `  ${formatBytes(file.size).padStart(10)}  ${file.name}`
  );
  return ["Bundle sizes:", ...lines].join("\n");
}

function main(): void {
  const dir = join(process.cwd(), "dist");
  const files = collectDistSizes(dir);
  console.log(formatReport(files));
  const violations = checkBudgets(files);
  if (violations.length > 0) {
    for (const violation of violations) {
      console.error(`BUDGET EXCEEDED: ${violation}`);
    }
    throw new Error(`${violations.length} size budget violation(s)`);
  }
  console.log("All size budgets hold.");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
