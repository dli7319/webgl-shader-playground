import React from "react";

import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { Switch } from "./ui/Switch";
import { ImageIcon } from "./ui/icons";
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
  downloadShaderFilename: string;
  onDownloadShaderFilenameChange: (filename: string) => void;
  onDownloadShader: () => void;
  onPickImage: (dataUrl: string) => void;
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

/** GLSL editor plus run/download/texture controls. */
export function EditorPane({
  shaderSource,
  onShaderSourceChange,
  onRunShader,
  downloadShaderFilename,
  onDownloadShaderFilenameChange,
  onDownloadShader,
  onPickImage,
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
    <div className="flex w-1/2 grow flex-col gap-4 max-[900px]:w-full">
      <div
        id="editorParent"
        role="region"
        aria-label="Shader editor"
        className="flex flex-col gap-4"
      >
        <section>
          <h2 className="section-label">Shader source</h2>
          <div className="frame-1px">
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
                  fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
                  minimap: { enabled: false },
                  overviewRulerLanes: 0,
                }}
                theme={themeMode}
                onChange={onShaderSourceChange}
              />
            </React.Suspense>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <Button variant="contained" className="w-full" onClick={onRunShader}>
              Run Shader (Ctrl+Enter)
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outlined" onClick={onUndo} disabled={!canUndo}>
                Undo
              </Button>
              <Button variant="outlined" onClick={onRedo} disabled={!canRedo}>
                Redo
              </Button>
              <Switch
                checked={autoRun}
                onChange={onToggleAutoRun}
                label="Auto-run while typing"
              />
              <Button variant="outlined" tone="warning" onClick={onResetShader}>
                Reset to default shader
              </Button>
            </div>
          </div>
        </section>
        <section>
          <h2 className="section-label">Download</h2>
          <div className="surface-panel flex flex-row flex-wrap items-center gap-2 p-3">
            <TextField
              label="Filename"
              type="text"
              className="grow"
              value={downloadShaderFilename}
              aria-label="Shader download filename"
              onChange={onDownloadShaderFilenameChange}
            />
            <Button variant="outlined" onClick={onDownloadShader}>
              Download Shader (Ctrl+S)
            </Button>
          </div>
        </section>
        <section>
          <h2 className="section-label">Saved shaders</h2>
          <ShaderHistory currentSource={shaderSource} onApply={onShaderSourceChange} />
        </section>
        <section>
          <h2 className="section-label">Texture</h2>
          <label className="inline-flex h-9 min-w-16 cursor-pointer items-center justify-center gap-2 rounded border border-edge bg-app px-4 text-xs font-semibold uppercase tracking-[0.08em] text-ink transition-colors [font:inherit] hover:border-accent hover:text-strong">
            <ImageIcon /> Pick tDiffuse Image
            <input
              type="file"
              className="sr-only"
              aria-label="Choose a texture image"
              accept="image/*"
              onChange={(e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const dataUrl = e.target?.result;
                    if (typeof dataUrl === "string") {
                      onPickImage(dataUrl);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
        </section>
      </div>
    </div>
  );
}
