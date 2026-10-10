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

const CONTROL_PANEL = "surface-panel my-2 flex flex-col gap-2 p-3";
const PICK_LABEL =
  "hud-clip inline-flex min-w-16 cursor-pointer items-center justify-center gap-2 border border-edge bg-transparent px-4 py-[0.4rem] text-sm font-semibold uppercase tracking-[0.08em] text-ink transition-colors [font:inherit] hover:border-accent hover:bg-[var(--tint-accent)] hover:text-accent";

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
        <React.Suspense
          fallback={
            <div className="min-h-[40vh] box-border p-4 text-sm opacity-70">
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
              fontFamily: '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace',
            }}
            theme={themeMode}
            onChange={onShaderSourceChange}
          />
        </React.Suspense>
        <div className={CONTROL_PANEL}>
          <div className="flex flex-row flex-wrap gap-2">
            <Button variant="outlined" onClick={onUndo} disabled={!canUndo} className="grow">
              Undo
            </Button>
            <Button variant="outlined" onClick={onRedo} disabled={!canRedo} className="grow">
              Redo
            </Button>
          </div>
          <Button
            variant="contained"
            onClick={onRunShader}
            className="mx-auto block w-full"
          >
            Run Shader (<span className="key-hint">Ctrl+Enter</span>)
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
        <div className="surface-panel my-2 flex flex-row flex-wrap items-center gap-2 p-2">
          <TextField
            label="Filename"
            type="text"
            className="grow"
            value={downloadShaderFilename}
            aria-label="Shader download filename"
            onChange={onDownloadShaderFilenameChange}
          />
          <Button variant="outlined" onClick={onDownloadShader}>
            Download Shader (<span className="key-hint">Ctrl+S</span>)
          </Button>
        </div>
        <ShaderHistory currentSource={shaderSource} onApply={onShaderSourceChange} />
        <div className="btn-shell my-2">
          <label className={PICK_LABEL}>
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
    </div>
  );
}
