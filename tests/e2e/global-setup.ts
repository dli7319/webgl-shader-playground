// Starts the static dist server (scripts/serve-dist.mjs) on an ephemeral port
// and exposes its URL to all Playwright workers through the environment.
import { spawn, type ChildProcess } from "node:child_process";

let child: ChildProcess | null = null;

export default async function globalSetup() {
  child = spawn("node", ["scripts/serve-dist.mjs", "dist"], {
    stdio: ["ignore", "pipe", "inherit"],
  });

  const baseURL = await new Promise<string>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("server did not start in time")),
      10_000
    );
    child?.stdout?.on("data", (chunk: Buffer) => {
      const match = chunk.toString().match(/PORT=(\d+)/);
      if (match) {
        clearTimeout(timer);
        resolve(`http://127.0.0.1:${match[1]}`);
      }
    });
    child?.on("exit", (code) => reject(new Error(`server exited early (${code})`)));
  });

  process.env.E2E_BASE_URL = baseURL;

  return async () => {
    child?.kill();
  };
}
