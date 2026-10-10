import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import { language } from "./glsl";

// Monaco workers are emitted as standalone bundles by rolldown.config.mjs and
// are loaded relative to the page (not via import.meta.url, which is unusable
// in single-file outputs).
const workerEntries: Record<string, string> = {
  json: "json.worker.js",
  css: "css.worker.js",
  html: "html.worker.js",
  ts: "ts.worker.js",
  javascript: "ts.worker.js",
};

(
  self as unknown as {
    MonacoEnvironment?: {
      getWorker: (workerId: string, label: string) => Worker;
    };
  }
).MonacoEnvironment = {
  getWorker: (_workerId: string, label: string) =>
    new Worker(new URL(workerEntries[label] ?? "editor.worker.js", window.location.href)),
};

monaco.languages.register({ id: "glsl" });
monaco.languages.setMonarchTokensProvider("glsl", language);
loader.config({ monaco });

// Soft Calm editor themes: the code surface is the same material as the app
// (background matches --bg so the editor reads as an inset well of the page).
monaco.editor.defineTheme("soft-calm-light", {
  base: "vs",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#e9edf3",
    "editor.foreground": "#2e3a4d",
    "editor.lineHighlightBackground": "#e1e6ee",
    "editorLineNumber.foreground": "#8b96a8",
    "editorLineNumber.activeForeground": "#2e3a4d",
    "editor.selectionBackground": "#b7e4dc",
    "editorCursor.foreground": "#0f766e",
    "editorIndentGuide.background": "#d3dae4",
  },
});
monaco.editor.defineTheme("soft-calm-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#1e2430",
    "editor.foreground": "#d7dee9",
    "editor.lineHighlightBackground": "#262d3b",
    "editorLineNumber.foreground": "#66748c",
    "editorLineNumber.activeForeground": "#d7dee9",
    "editor.selectionBackground": "#125e57",
    "editorCursor.foreground": "#2dd4bf",
    "editorIndentGuide.background": "#2c3546",
  },
});

export interface MonacoGlslEditorProps {
  height: string;
  width: string;
  defaultValue: string;
  options: { fontSize: number; wordWrap: "on" | "off"; fontFamily?: string };
  theme: "light" | "dark";
  onChange: (value: string) => void;
}

/**
 * Monaco-backed GLSL editor, loaded lazily so the heavy editor bundle stays
 * out of the initial chunk.
 */
export function MonacoGlslEditor({
  height,
  width,
  defaultValue,
  options,
  theme,
  onChange,
}: MonacoGlslEditorProps) {
  return (
    <Editor
      height={height}
      width={width}
      language="glsl"
      defaultValue={defaultValue}
      options={options}
      theme={theme === "dark" ? "soft-calm-dark" : "soft-calm-light"}
      onChange={(value, _event) => {
        onChange(value ?? "");
      }}
    />
  );
}
