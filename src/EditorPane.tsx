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
    <div className="card-surface flex w-1/2 grow flex-col p-6 max-[900px]:w-full">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-base font-semibold tracking-[-0.01em]">Shader source</h2>
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
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outlined" onClick={onUndo} disabled={!canUndo}>
              Undo
            </Button>
            <Button variant="outlined" onClick={onRedo} disabled={!canRedo}>
              Redo
            </Button>
            <Button
              variant="outlined"
              tone="danger"
              className="ml-auto"
              onClick={onResetShader}
            >
              Reset to default shader
            </Button>
          </div>
          {/* The one filled primary action in this pane. */}
          <Button variant="contained" size="lg" onClick={onRunShader} className="w-full">
            Run Shader (Ctrl+Enter)
          </Button>
          <div className="inset-row flex items-center px-5 py-2.5">
            <Switch
              checked={autoRun}
              onChange={onToggleAutoRun}
              label="Auto-run while typing"
            />
          </div>
        </div>
        <div className="mt-4">
          <div className="inset-row flex flex-row flex-wrap items-center gap-3 p-4">
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
        </div>
        <ShaderHistory currentSource={shaderSource} onApply={onShaderSourceChange} />
        <label className="mt-4 inline-flex h-10 min-w-16 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-edge-strong bg-panel px-4 text-sm font-semibold text-ink transition-colors hover:bg-[var(--hover-fill)]">
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
      </div>
    </div>
  );
}
