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

/** Pane 1 of the workspace: the GLSL source editor. */
export function EditorPane({
  shaderSource,
  onShaderSourceChange,
  editorFontSize,
  wordWrap,
  themeMode,
}: EditorPaneProps) {
  return (
    <div className="pane min-w-0 flex-[1.2_1_0%] max-[900px]:w-full max-[900px]:flex-auto">
      <div id="editorParent" role="region" aria-label="Shader editor">
        <div className="pane-header">
          <div className="flex min-w-0 flex-wrap items-baseline gap-2" aria-hidden="true">
            <span className="section-label">1:editor</span>
            <span className="micro-label grow opacity-60">glsl source · buffer 01</span>
          </div>
        </div>
        <div className="pane-body">
          <React.Suspense
            fallback={
              <div className="min-h-[40vh] box-border p-4 text-sm opacity-70">
                Loading editor…
              </div>
            }
          >
            <MonacoGlslEditor
              height="50vh"
              width="100%"
              defaultValue={shaderSource}
              options={{
                fontSize: editorFontSize,
                wordWrap: wordWrap ? "on" : "off",
                fontFamily:
                  '"IBM Plex Mono", ui-monospace, SFMono-Regular, Monaco, "Cascadia Code", monospace',
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
