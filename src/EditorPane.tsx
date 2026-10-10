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
 * The dominant pane: the GLSL editor well with only its own edit-history
 * controls in the foot. Run lives in the command strip; export, texture,
 * history, and editor preferences live in the config sheet.
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
    <div className="flex min-w-0 grow flex-col max-[900px]:w-full">
      <div
        id="editorParent"
        role="region"
        aria-label="Shader editor"
        className="flex flex-col overflow-hidden rounded-[6px] border border-edge"
      >
        <React.Suspense
          fallback={
            <div className="min-h-[40vh] box-border p-4 text-sm text-muted">
              Loading editor…
            </div>
          }
        >
          <MonacoGlslEditor
            height="60vh"
            width="100%"
            defaultValue={shaderSource}
            options={{
              fontSize: editorFontSize,
              wordWrap: wordWrap ? "on" : "off",
              fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            }}
            theme={themeMode}
            onChange={onShaderSourceChange}
          />
        </React.Suspense>
        <div className="flex flex-wrap items-center gap-2 border-t border-edge p-2.5">
          <Button variant="outlined" onClick={onUndo} disabled={!canUndo}>
            Undo
          </Button>
          <Button variant="outlined" onClick={onRedo} disabled={!canRedo}>
            Redo
          </Button>
        </div>
      </div>
    </div>
  );
}
