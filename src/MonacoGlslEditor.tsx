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

// Solarized syntax ramp: green keywords, blue calls, cyan strings, magenta
// numbers, yellow types — the classic mapping, on both base tones.
const SYNTAX_RULES: monaco.editor.ITokenThemeRule[] = [
  { token: "comment", foreground: "657b83", fontStyle: "italic" },
  { token: "keyword", foreground: "859900" },
  { token: "type", foreground: "b58900" },
  { token: "type.identifier", foreground: "b58900" },
  { token: "string", foreground: "2aa198" },
  { token: "number", foreground: "d33682" },
  { token: "identifier", foreground: "586e75" },
];

monaco.editor.defineTheme("solarized-light", {
  base: "vs",
  inherit: true,
  rules: SYNTAX_RULES,
  colors: {
    "editor.background": "#fdf6e3",
    "editor.foreground": "#586e75",
    "editorLineNumber.foreground": "#93a1a1",
    "editorLineNumber.activeForeground": "#586e75",
    "editorCursor.foreground": "#268bd2",
    "editor.selectionBackground": "#eee8d5",
    "editor.lineHighlightBackground": "#eee8d580",
    "editorIndentGuide.background": "#d9cdb8",
    "editorWhitespace.foreground": "#d9cdb8",
  },
});

monaco.editor.defineTheme("solarized-dark", {
  base: "vs-dark",
  inherit: true,
  rules: SYNTAX_RULES.map((rule) =>
    rule.token === "identifier" ? { ...rule, foreground: "93a1a1" } : rule
  ),
  colors: {
    "editor.background": "#002b36",
    "editor.foreground": "#93a1a1",
    "editorLineNumber.foreground": "#586e75",
    "editorLineNumber.activeForeground": "#839496",
    "editorCursor.foreground": "#268bd2",
    "editor.selectionBackground": "#073642",
    "editor.lineHighlightBackground": "#07364280",
    "editorIndentGuide.background": "#0b4553",
    "editorWhitespace.foreground": "#0b4553",
  },
});

export interface MonacoGlslEditorProps {
  height: string;
  width: string;
  defaultValue: string;
  options: {
    fontSize: number;
    wordWrap: "on" | "off";
    fontFamily: string;
    minimap: { enabled: boolean };
    overviewRulerLanes: number;
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
      theme={theme === "dark" ? "solarized-dark" : "solarized-light"}
      onChange={(value, _event) => {
        onChange(value ?? "");
      }}
    />
  );
}
