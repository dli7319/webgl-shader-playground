import React from "react";

import type { ThemeMode } from "./settings";

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
  themeMode: ThemeMode;
}

/** The editor surface paired with the stage: source code and nothing else. */
export function EditorPane({
  shaderSource,
  onShaderSourceChange,
  editorFontSize,
  wordWrap,
  themeMode,
}: EditorPaneProps) {
  return (
    <section className="card-surface flex flex-col p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-base font-semibold tracking-[-0.01em]">
          Shader source
        </h2>
        <span className="text-[13px] text-quiet">GLSL</span>
      </div>
      <div id="editorParent" role="region" aria-label="Shader editor">
        <div className="overflow-hidden rounded-xl border border-edge">
          <React.Suspense
            fallback={
              <div className="box-border min-h-[40vh] p-5 text-sm text-quiet">
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
                  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
              theme={themeMode}
              onChange={onShaderSourceChange}
            />
          </React.Suspense>
        </div>
      </div>
    </section>
  );
}
