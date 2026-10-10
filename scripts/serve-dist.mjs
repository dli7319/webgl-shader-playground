// Minimal static file server for the E2E suite. Binds an ephemeral port
// (bind(0)) so parallel runs and concurrent checkouts never collide, and sets
// correct MIME types — wrong types silently break module scripts and media.
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webm": "video/webm",
  ".ttf": "font/ttf",
  ".svg": "image/svg+xml",
};

export function createStaticServer(rootDir) {
  return createServer((request, response) => {
    const urlPath = decodeURIComponent(
      new URL(request.url ?? "/", "http://localhost").pathname
    );
    const relative = urlPath === "/" ? "index.html" : urlPath.slice(1);
    const filePath = normalize(join(rootDir, relative));
    if (!filePath.startsWith(normalize(rootDir)) || !existsSync(filePath)) {
      response.writeHead(404, { "content-type": "text/plain" });
      response.end("not found");
      return;
    }
    if (statSync(filePath).isDirectory()) {
      response.writeHead(404, { "content-type": "text/plain" });
      response.end("not found");
      return;
    }
    response.writeHead(200, {
      "content-type": MIME[extname(filePath)] ?? "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  });
}

/** Starts the server on an ephemeral port; resolves with the base URL. */
export function serveDist(rootDir) {
  const server = createStaticServer(rootDir);
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({
        server,
        baseURL: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

// CLI entry: `node scripts/serve-dist.mjs [dir]` prints PORT=<n> and runs
// until killed. The E2E global setup uses the exported API instead.
if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2] ?? "dist";
  const { baseURL, server } = await serveDist(dir);
  console.log(`PORT=${new URL(baseURL).port}`);
  server.on("error", (error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
