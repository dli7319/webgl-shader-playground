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

// Dense Pro editor themes: same tight gray chrome as the app shell so the
// shader text is the only colorful thing on screen.
monaco.editor.defineTheme("dense-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "6e6e6e", fontStyle: "italic" },
    { token: "keyword", foreground: "e87d0d" },
    { token: "number", foreground: "c8c8c8" },
    { token: "type", foreground: "d9a066" },
    { token: "identifier", foreground: "c8c8c8" },
  ],
  colors: {
    "editor.background": "#1a1a1a",
    "editor.foreground": "#c8c8c8",
    "editorLineNumber.foreground": "#555555",
    "editorLineNumber.activeForeground": "#9a9a9a",
    "editorCursor.foreground": "#e87d0d",
    "editor.selectionBackground": "#4a3308",
    "editor.lineHighlightBackground": "#212121",
    "editorIndentGuide.background1": "#2e2e2e",
  },
});
monaco.editor.defineTheme("dense-light", {
  base: "vs",
  inherit: true,
  rules: [
    { token: "comment", foreground: "8a8a8a", fontStyle: "italic" },
    { token: "keyword", foreground: "a85400" },
    { token: "number", foreground: "2a2a2a" },
    { token: "type", foreground: "7a4a10" },
    { token: "identifier", foreground: "2a2a2a" },
  ],
  colors: {
    "editor.background": "#d6d6d6",
    "editor.foreground": "#2a2a2a",
    "editorLineNumber.foreground": "#9a9a9a",
    "editorLineNumber.activeForeground": "#5a5a5a",
    "editorCursor.foreground": "#a85400",
    "editor.selectionBackground": "#e0c9a6",
    "editor.lineHighlightBackground": "#dcdcdc",
    "editorIndentGuide.background1": "#b6b6b6",
  },
});

export interface MonacoGlslEditorProps {
  height: string;
  width: string;
  defaultValue: string;
  options: {
    fontSize: number;
    wordWrap: "on" | "off";
    fontFamily?: string;
  };
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
      theme={theme === "dark" ? "dense-dark" : "dense-light"}
      onChange={(value, _event) => {
        onChange(value ?? "");
      }}
    />
  );
}
