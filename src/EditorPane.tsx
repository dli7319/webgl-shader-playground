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

const MONO_STACK =
  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

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
    <div className="flex w-1/2 grow flex-col max-[900px]:w-full">
      <div id="editorParent" role="region" aria-label="Shader editor">
        <div aria-hidden="true" className="mb-2">
          <span className="section-label">Source · Fragment Shader</span>
        </div>
        <div className="border-[3px] border-solid border-edge bg-panel shadow-[6px_6px_0_var(--border)]">
          <React.Suspense
            fallback={
              <div className="min-h-[40vh] box-border p-4 text-sm">Loading editor…</div>
            }
          >
            <MonacoGlslEditor
              height="40vh"
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
        <div className="mt-5 flex flex-col items-start gap-3">
          <div aria-hidden="true">
            <span className="section-label">Controls</span>
          </div>
          <div className="flex flex-row flex-wrap items-stretch gap-3">
            <Button variant="outlined" onClick={onUndo} disabled={!canUndo}>
              Undo
            </Button>
            <Button variant="outlined" onClick={onRedo} disabled={!canRedo}>
              Redo
            </Button>
          </div>
          <Button
            variant="contained"
            onClick={onRunShader}
            className="w-full py-3 text-base tracking-[0.14em]"
          >
            Run Shader (Ctrl+Enter)
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
        <div className="mt-5">
          <div aria-hidden="true" className="mb-2">
            <span className="section-label">Export</span>
          </div>
          <div className="surface-panel flex flex-row flex-wrap items-stretch gap-3 p-3">
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
        <label className="btn mt-4">
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
