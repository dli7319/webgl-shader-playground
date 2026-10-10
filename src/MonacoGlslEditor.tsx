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

/* Aurora Glass editor themes: indigo/violet night slab + pale lilac day slab. */
monaco.editor.defineTheme("aurora-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "8b93c9", fontStyle: "italic" },
    { token: "keyword", foreground: "67e8f9" },
    { token: "number", foreground: "a78bfa" },
    { token: "type", foreground: "a78bfa" },
    { token: "string", foreground: "7dd3fc" },
  ],
  colors: {
    "editor.background": "#171233",
    "editor.foreground": "#eef0ff",
    "editor.lineHighlightBackground": "#221b4d",
    "editorLineNumber.foreground": "#5b5790",
    "editorLineNumber.activeForeground": "#a78bfa",
    "editorCursor.foreground": "#67e8f9",
    "editor.selectionBackground": "#3b2f7a",
  },
});
monaco.editor.defineTheme("aurora-light", {
  base: "vs",
  inherit: true,
  rules: [
    { token: "comment", foreground: "7c74a8", fontStyle: "italic" },
    { token: "keyword", foreground: "6d28d9" },
    { token: "number", foreground: "0e7490" },
    { token: "type", foreground: "6d28d9" },
    { token: "string", foreground: "0e7490" },
  ],
  colors: {
    "editor.background": "#f6f5fd",
    "editor.foreground": "#1e2340",
    "editor.lineHighlightBackground": "#ece9fb",
    "editorLineNumber.foreground": "#8b87b5",
    "editorLineNumber.activeForeground": "#6d28d9",
    "editorCursor.foreground": "#6d28d9",
    "editor.selectionBackground": "#ddd6fe",
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
      theme={theme === "dark" ? "aurora-dark" : "aurora-light"}
      onChange={(value, _event) => {
        onChange(value ?? "");
      }}
    />
  );
}
