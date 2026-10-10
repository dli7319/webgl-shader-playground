import React from "react";

import { Button } from "./ui/Button";

const MonacoGlslEditor = React.lazy(() =>
  import("./MonacoGlslEditor").then((module) => ({
    default: module.MonacoGlslEditor,
  }))
);

const MONO_STACK =
  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

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
 * The dominant EDITOR slab: a filled title bar with the source edit-history
 * controls (Undo/Redo), then the code surface. Everything else about the
 * source lives in the rail and the tool slabs.
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
    <div className="flex min-w-0 flex-[1.4] flex-col max-[900px]:w-full">
      <div id="editorParent" role="region" aria-label="Shader editor">
        <section className="slab slab-dominant">
          <div className="slab-bar">
            <span aria-hidden="true">■</span>
            <span className="slab-title">Source · Fragment Shader</span>
            <span className="ml-auto flex items-stretch gap-2">
              <Button
                className="btn-compact"
                variant="outlined"
                onClick={onUndo}
                disabled={!canUndo}
              >
                Undo
              </Button>
              <Button
                className="btn-compact"
                variant="outlined"
                onClick={onRedo}
                disabled={!canRedo}
              >
                Redo
              </Button>
            </span>
          </div>
          <div className="p-2">
            <React.Suspense
              fallback={
                <div className="min-h-[40vh] box-border p-4 text-sm">
                  Loading editor…
                </div>
              }
            >
              <MonacoGlslEditor
                height="62vh"
                width="100%"
                defaultValue={shaderSource}
                options={{
                  fontSize: editorFontSize,
                  wordWrap: wordWrap ? "on" : "off",
                  fontFamily: MONO_STACK,
                }}
                theme={themeMode}
                onChange={onShaderSourceChange}
              />
            </React.Suspense>
          </div>
        </section>
      </div>
    </div>
  );
}
