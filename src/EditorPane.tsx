import React from "react";

import { Button } from "./ui/Button";

const MonacoGlslEditor = React.lazy(() =>
  import("./MonacoGlslEditor").then((module) => ({
    default: module.MonacoGlslEditor,
  }))
);

export interface EditorPaneProps {
  shaderSource: string;
  onShaderSourceChange: (source: string) => void;
  editorFontSize: number;
  wordWrap: boolean;
  themeMode: "light" | "dark";
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

/**
 * Editor island: a quiet edit-history strip over the GLSL editor. Run, export,
 * history and texture controls float in the control cushion below.
 */
export function EditorPane({
  shaderSource,
  onShaderSourceChange,
  editorFontSize,
  wordWrap,
  themeMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: EditorPaneProps) {
  return (
    <section
      id="editorParent"
      role="region"
      aria-label="Shader editor"
      className="surface-panel overflow-hidden"
    >
      <div className="flex flex-wrap items-center gap-2 px-3 pt-3">
        <span className="section-label grow">Shader</span>
        <Button variant="outlined" onClick={onUndo} disabled={!canUndo}>
          Undo
        </Button>
        <Button variant="outlined" onClick={onRedo} disabled={!canRedo}>
          Redo
        </Button>
      </div>
      <div className="p-3">
        <React.Suspense
          fallback={
            <div className="min-h-[40vh] box-border p-4 text-sm text-muted">
              Loading editor…
            </div>
          }
        >
          <MonacoGlslEditor
            height="40vh"
            width="100%"
            defaultValue={shaderSource}
            options={{
              fontSize: editorFontSize,
              wordWrap: wordWrap ? "on" : "off",
              fontFamily:
                '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
            theme={themeMode}
            onChange={onShaderSourceChange}
          />
        </React.Suspense>
      </div>
    </section>
  );
}
