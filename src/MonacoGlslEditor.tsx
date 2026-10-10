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

export interface MonacoGlslEditorProps {
  height: string;
  width: string;
  defaultValue: string;
  options: { fontSize: number; wordWrap: "on" | "off" };
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
  onChange,
}: MonacoGlslEditorProps) {
  return (
    <Editor
      height={height}
      width={width}
      language="glsl"
      defaultValue={defaultValue}
      options={options}
      onChange={(value, _event) => {
        onChange(value ?? "");
      }}
    />
  );
}
