import { defineConfig } from "rolldown";
import postcss from "rollup-plugin-postcss";
import copy from "rollup-plugin-copy";
import serve from "rollup-plugin-serve";

const isDev = process.env.npm_lifecycle_event === "dev";

const sharedChecks = {
  moduleLevelDirective: false,
  emptyImportMeta: false,
};

/** Monaco language workers, each bundled as a standalone IIFE. */
const monacoWorkers = [
  ["node_modules/monaco-editor/esm/vs/editor/editor.worker.js", "editor.worker.js"],
  ["node_modules/monaco-editor/esm/vs/language/json/json.worker.js", "json.worker.js"],
  ["node_modules/monaco-editor/esm/vs/language/css/css.worker.js", "css.worker.js"],
  ["node_modules/monaco-editor/esm/vs/language/html/html.worker.js", "html.worker.js"],
  ["node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js", "ts.worker.js"],
];

export default defineConfig([
  {
    input: "src/index.tsx",
    output: {
      dir: "dist",
      format: "esm",
      entryFileNames: "main.js",
      chunkFileNames: "[name]-[hash].js",
      assetFileNames: "[name]-[hash][extname]",
      minify: true,
    },
    // Rolldown does not bundle CSS or raw text: route them through moduleTypes.
    // postcss injects CSS (Monaco's global stylesheets included) with class
    // names INTACT — CSS-module hashing here breaks Monaco's runtime DOM.
    moduleTypes: {
      ".css": "js",
      ".frag": "text",
      ".vert": "text",
    },
    plugins: [
      postcss({ inject: true }),
      copy({
        targets: [
          { src: "public/*", dest: "dist" },
          {
            src: "node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.ttf",
            dest: "dist",
          },
        ],
      }),
      ...(isDev
        ? [serve({ contentBase: "dist", port: Number(process.env.PORT) || 8080 })]
        : []),
    ],
    resolve: {
      alias: {
        // React -> Preact compat. ORDER MATTERS: test-utils above react-dom.
        "react-dom/test-utils": "preact/test-utils",
        "react-dom/client": "preact/compat/client",
        react: "preact/compat",
        "react-dom": "preact/compat",
        "react/jsx-runtime": "preact/jsx-runtime",
      },
    },
    checks: sharedChecks,
  },
  ...monacoWorkers.map(([input, file]) => ({
    input,
    output: { file: `dist/${file}`, format: "iife", minify: true },
    checks: sharedChecks,
  })),
]);
