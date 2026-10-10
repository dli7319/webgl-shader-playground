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

/** The subordinate floating island: just the code, with its edit history pair. */
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
    <div className="flex w-[44%] grow flex-col max-[900px]:w-full">
      <div
        id="editorParent"
        role="region"
        aria-label="Shader editor"
        className="glass flex flex-col gap-3 p-3"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="pane-caption">GLSL · fragment</span>
          <div className="flex items-center gap-2">
            <Button variant="outlined" onClick={onUndo} disabled={!canUndo}>
              Undo
            </Button>
            <Button variant="outlined" onClick={onRedo} disabled={!canRedo}>
              Redo
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl">
          <React.Suspense
            fallback={
              <div className="min-h-[40vh] box-border p-4 text-sm opacity-70">
                Loading editor…
              </div>
            }
          >
            <MonacoGlslEditor
              height="52vh"
              width="100%"
              defaultValue={shaderSource}
              options={{
                fontSize: editorFontSize,
                wordWrap: wordWrap ? "on" : "off",
                fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
              theme={themeMode}
              onChange={onShaderSourceChange}
            />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
}
