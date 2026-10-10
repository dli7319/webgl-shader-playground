import React from "react";

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
}

/**
 * SOURCE module — the GLSL editor alone. Its controls live beside the object
 * they act on elsewhere: edit transport + saves in HISTORY, export in OUTPUT,
 * run/record in the bottom action bar.
 */
export function EditorPane({
  shaderSource,
  onShaderSourceChange,
  editorFontSize,
  wordWrap,
  themeMode,
}: EditorPaneProps) {
  return (
    <div className="flex w-1/2 min-w-0 grow flex-col max-[900px]:w-full">
      <div
        id="editorParent"
        role="region"
        aria-label="Shader editor"
        className="surface-panel flex min-h-0 min-w-0 grow flex-col overflow-hidden"
      >
        <div className="hud-module-head">
          <span className="hud-module-title">SOURCE</span>
          <span className="hud-readout grow overflow-hidden text-ellipsis whitespace-nowrap opacity-75">
            GLSL · Fragment · {editorFontSize}px
          </span>
        </div>
        <div className="min-h-[40vh] min-w-0 grow overflow-hidden">
          <React.Suspense
            fallback={
              <div className="box-border p-4 text-sm opacity-70">
                Loading editor…
              </div>
            }
          >
            <MonacoGlslEditor
              height="100%"
              width="100%"
              defaultValue={shaderSource}
              options={{
                fontSize: editorFontSize,
                wordWrap: wordWrap ? "on" : "off",
                fontFamily: '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace',
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
