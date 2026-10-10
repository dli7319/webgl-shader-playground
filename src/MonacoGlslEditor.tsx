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

// "Quiet Dark" editor themes: the editor well blends into the app canvas and
// syntax colors are drawn from the same token set as the chrome.
monaco.editor.defineTheme("quiet-light", {
  base: "vs",
  inherit: true,
  rules: [
    { token: "comment", foreground: "6b6d78", fontStyle: "italic" },
    { token: "keyword", foreground: "4f5dff" },
    { token: "number", foreground: "935d00" },
  ],
  colors: {
    "editor.background": "#fbfbfc",
    "editor.foreground": "#17181c",
    "editorLineNumber.foreground": "#b7b9c2",
    "editorLineNumber.activeForeground": "#6b6d78",
    "editor.lineHighlightBackground": "#f2f3f5",
    "editor.selectionBackground": "#dfe3ff",
    "editorCursor.foreground": "#4f5dff",
    "editorIndentGuide.background1": "#e3e4e8",
    "editorGutter.background": "#fbfbfc",
  },
});
monaco.editor.defineTheme("quiet-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "9a9ba3", fontStyle: "italic" },
    { token: "keyword", foreground: "7b8cff" },
    { token: "number", foreground: "d9a04a" },
  ],
  colors: {
    "editor.background": "#0b0c0f",
    "editor.foreground": "#e4e5eb",
    "editorLineNumber.foreground": "#3d3f48",
    "editorLineNumber.activeForeground": "#9a9ba3",
    "editor.lineHighlightBackground": "#121318",
    "editor.selectionBackground": "#232a52",
    "editorCursor.foreground": "#7b8cff",
    "editorIndentGuide.background1": "#26272e",
    "editorGutter.background": "#0b0c0f",
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
      theme={theme === "dark" ? "quiet-dark" : "quiet-light"}
      onChange={(value, _event) => {
        onChange(value ?? "");
      }}
    />
  );
}
