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

/** Phosphor Terminal editor themes: CRT green dark + printout light. */
monaco.editor.defineTheme("phosphor-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "3f7a4f", fontStyle: "italic" },
    { token: "keyword", foreground: "33ff66" },
    { token: "type", foreground: "b8f5c0" },
    { token: "number", foreground: "ffb347" },
    { token: "string", foreground: "ffb347" },
    { token: "delimiter", foreground: "7cc98a" },
  ],
  colors: {
    "editor.background": "#0f1a10",
    "editor.foreground": "#b8f5c0",
    "editorLineNumber.foreground": "#2c5c3c",
    "editorLineNumber.activeForeground": "#33ff66",
    "editorCursor.foreground": "#33ff66",
    "editor.selectionBackground": "#1e4d2b99",
    "editor.lineHighlightBackground": "#132117",
    "editorIndentGuide.background1": "#1e4d2b",
  },
});

monaco.editor.defineTheme("phosphor-print", {
  base: "vs",
  inherit: true,
  rules: [
    { token: "comment", foreground: "7c8a72", fontStyle: "italic" },
    { token: "keyword", foreground: "1d6b35" },
    { token: "type", foreground: "22301f" },
    { token: "number", foreground: "b3261e" },
    { token: "string", foreground: "b3261e" },
    { token: "delimiter", foreground: "5c6b52" },
  ],
  colors: {
    "editor.background": "#f3f0e7",
    "editor.foreground": "#22301f",
    "editorLineNumber.foreground": "#b9b39e",
    "editorLineNumber.activeForeground": "#1d6b35",
    "editorCursor.foreground": "#1d6b35",
    "editor.selectionBackground": "#b9b39e66",
    "editor.lineHighlightBackground": "#e9e5d8",
    "editorIndentGuide.background1": "#b9b39e",
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
      theme={theme === "dark" ? "phosphor-dark" : "phosphor-print"}
      onChange={(value, _event) => {
        onChange(value ?? "");
      }}
    />
  );
}
