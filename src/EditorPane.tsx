import React from "react";

import { Button } from "./ui/Button";
import { Switch } from "./ui/Switch";
import { ShaderHistory } from "./ShaderHistory";

const MonacoGlslEditor = React.lazy(() =>
  import("./MonacoGlslEditor").then((module) => ({
    default: module.MonacoGlslEditor,
  }))
);

export interface EditorPaneProps {
  shaderSource: string;
  onShaderSourceChange: (source: string) => void;
  onRunShader: () => void;
  autoRun: boolean;
  onToggleAutoRun: () => void;
  onResetShader: () => void;
  editorFontSize: number;
  wordWrap: boolean;
  themeMode: "light" | "dark";
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

/**
 * Right page of the spread — the manuscript. The GLSL source fills the page;
 * the run control anchors its foot, and a margin index rail down the page's
 * outer margin holds the text's other lives (saved versions, default).
 */
export function EditorPane({
  shaderSource,
  onShaderSourceChange,
  onRunShader,
  autoRun,
  onToggleAutoRun,
  onResetShader,
  editorFontSize,
  wordWrap,
  themeMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: EditorPaneProps) {
  return (
    <section className="spread-page page-source flex w-[54%] grow gap-4 p-5 max-[900px]:w-full max-[900px]:flex-col">
      <div className="flex min-w-0 grow flex-col gap-2">
        <h2 className="section-title text-lg">Editor</h2>
        <div
          id="editorParent"
          role="region"
          aria-label="Shader editor"
          className="flex min-h-0 grow flex-col gap-2"
        >
          <div className="surface-inset flex min-h-[42vh] grow flex-col overflow-hidden p-1.5">
            <React.Suspense
              fallback={
                <div className="box-border p-4 text-sm text-muted">Loading editor…</div>
              }
            >
              <MonacoGlslEditor
                height="100%"
                width="100%"
                defaultValue={shaderSource}
                options={{
                  fontSize: editorFontSize,
                  wordWrap: wordWrap ? "on" : "off",
                  fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
                theme={themeMode}
                onChange={onShaderSourceChange}
              />
            </React.Suspense>
          </div>
          <footer className="page-anchor flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button variant="outlined" onClick={onUndo} disabled={!canUndo}>
                  Undo
                </Button>
                <Button variant="outlined" onClick={onRedo} disabled={!canRedo}>
                  Redo
                </Button>
              </div>
              <Switch
                checked={autoRun}
                onChange={onToggleAutoRun}
                label="Auto-run while typing"
              />
            </div>
            <Button
              variant="contained"
              onClick={onRunShader}
              className="w-full text-base"
            >
              Run Shader (Ctrl+Enter)
            </Button>
          </footer>
        </div>
      </div>
      <aside className="index-rail flex w-48 shrink-0 flex-col gap-2 self-start p-3 max-[900px]:w-full">
        <p className="note-label">Index</p>
        <ShaderHistory
          currentSource={shaderSource}
          onApply={onShaderSourceChange}
          onResetShader={onResetShader}
        />
      </aside>
    </section>
  );
}
