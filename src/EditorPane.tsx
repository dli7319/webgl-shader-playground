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
  onRunShader: () => void;
  editorFontSize: number;
  wordWrap: boolean;
  themeMode: "light" | "dark";
}

/**
 * Center desk: one restrained action row (the single filled action) over the
 * dominant code surface. Secondary edit controls live in the left rail's
 * Editor inspector section.
 */
export function EditorPane({
  shaderSource,
  onShaderSourceChange,
  onRunShader,
  editorFontSize,
  wordWrap,
  themeMode,
}: EditorPaneProps) {
  return (
    <div className="editor-column">
      <div className="action-row">
        <Button variant="contained" onClick={onRunShader}>
          Run Shader (Ctrl+Enter)
        </Button>
        <span className="action-hint">fragment shader · GLSL</span>
      </div>
      <div
        id="editorParent"
        role="region"
        aria-label="Shader editor"
        className="editor-frame"
      >
        <div className="editor-surface frame-1px">
          <React.Suspense
            fallback={
              <div className="editor-loading text-sm text-muted">Loading editor…</div>
            }
          >
            <MonacoGlslEditor
              height="100%"
              width="100%"
              defaultValue={shaderSource}
              options={{
                fontSize: editorFontSize,
                wordWrap: wordWrap ? "on" : "off",
                fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
                minimap: { enabled: false },
                overviewRulerLanes: 0,
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
