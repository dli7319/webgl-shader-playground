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

// Neon Grid editor surfaces — same chrome as the app panels.
monaco.editor.defineTheme("neon-grid-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "keyword", foreground: "00e5ff", fontStyle: "bold" },
    { token: "type", foreground: "ff2bd6" },
    { token: "number", foreground: "ff2bd6" },
    { token: "string", foreground: "33e08f" },
    { token: "comment", foreground: "7a6fa8", fontStyle: "italic" },
    { token: "identifier", foreground: "e9e4ff" },
  ],
  colors: {
    "editor.background": "#150b29",
    "editor.foreground": "#e9e4ff",
    "editorLineNumber.foreground": "#5d4b96",
    "editorLineNumber.activeForeground": "#00e5ff",
    "editorCursor.foreground": "#00e5ff",
    "editor.selectionBackground": "#2a1b4d",
    "editor.lineHighlightBackground": "#1d1038",
    "editorIndentGuide.background": "#241543",
  },
});
monaco.editor.defineTheme("neon-grid-light", {
  base: "vs",
  inherit: true,
  rules: [
    { token: "keyword", foreground: "7c1fff", fontStyle: "bold" },
    { token: "type", foreground: "d1009c" },
    { token: "number", foreground: "d1009c" },
    { token: "string", foreground: "0f7a3d" },
    { token: "comment", foreground: "6b6194", fontStyle: "italic" },
    { token: "identifier", foreground: "1b1233" },
  ],
  colors: {
    "editor.background": "#ffffff",
    "editor.foreground": "#1b1233",
    "editorLineNumber.foreground": "#9a91c0",
    "editorLineNumber.activeForeground": "#7c1fff",
    "editorCursor.foreground": "#7c1fff",
    "editor.selectionBackground": "#e6dcff",
    "editor.lineHighlightBackground": "#f7f5fd",
    "editorIndentGuide.background": "#e4ddf3",
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
      theme={theme === "dark" ? "neon-grid-dark" : "neon-grid-light"}
      onChange={(value, _event) => {
        onChange(value ?? "");
      }}
    />
  );
}
