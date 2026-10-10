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
    <div className="flex w-1/2 grow flex-col gap-2 max-[900px]:w-full">
      <section className="surface-panel flex flex-col">
        <div className="panel-title">
          <span>Shader</span>
          <span className="font-mono text-[10px] tracking-[0.1em] opacity-70">GLSL</span>
        </div>
        <div id="editorParent" role="region" aria-label="Shader editor" className="flex flex-col gap-2 p-2">
          <React.Suspense
            fallback={
              <div className="well min-h-[40vh] box-border p-4 text-[11px] uppercase tracking-[0.1em] opacity-70">
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
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
              }}
              theme={themeMode}
              onChange={onShaderSourceChange}
            />
          </React.Suspense>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button variant="outlined" onClick={onUndo} disabled={!canUndo}>
              Undo
            </Button>
            <Button variant="outlined" onClick={onRedo} disabled={!canRedo}>
              Redo
            </Button>
            <span className="mx-1 h-5 w-px bg-edge" aria-hidden="true" />
            <Button variant="contained" onClick={onRunShader}>
              Run Shader (Ctrl+Enter)
            </Button>
            <span className="grow" />
            <Switch
              checked={autoRun}
              onChange={onToggleAutoRun}
              label="Auto-run while typing"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
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
          <div className="flex flex-wrap items-center gap-1.5">
            <label className="inline-flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-[3px] border border-edge px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:bg-[var(--hover)]">
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
            <span className="grow" />
            <Button variant="outlined" tone="danger" onClick={onResetShader}>
              Reset to default shader
            </Button>
          </div>
        </div>
      </section>
      <ShaderHistory currentSource={shaderSource} onApply={onShaderSourceChange} />
    </div>
  );
}
