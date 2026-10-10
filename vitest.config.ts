import { defineConfig, type Plugin } from "vitest/config";

/** Mirrors webpack's `asset/source` rule for .vert/.frag shader files. */
const glslLoader: Plugin = {
  name: "glsl-loader",
  transform(code, id) {
    if (id.endsWith(".frag") || id.endsWith(".vert")) {
      return `export default ${JSON.stringify(code)};`;
    }
  },
};

export default defineConfig({
  plugins: [glslLoader],
  resolve: {
    alias: [
      { find: /^react$/, replacement: "preact/compat" },
      { find: /^react-dom\/client$/, replacement: "preact/compat/client" },
      { find: /^react-dom$/, replacement: "preact/compat" },
      { find: /^react\/jsx-runtime$/, replacement: "preact/jsx-runtime" },
      {
        find: /^react\/jsx-dev-runtime$/,
        replacement: "preact/jsx-dev-runtime",
      },
      { find: /^react\/test-utils$/, replacement: "preact/test-utils" },
    ],
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
    server: {
      deps: {
        // Must go through Vite so the react -> preact/compat aliases apply.
        inline: [/@testing-library\//, /react-dom/, /^react$/],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.ts", "src/globals.d.ts"],
      thresholds: {
        // Per-file floors for modules that have suites. Global thresholds get
        // tightened as the refactor PRs bring the components under test.
        "**/glsl.ts": {
          lines: 95,
          functions: 95,
          branches: 80,
        },
      },
    },
  },
});
