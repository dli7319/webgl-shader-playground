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
            }}
            theme={themeMode}
            onChange={onShaderSourceChange}
          />
        </React.Suspense>
        <div>
          <Button variant="outlined" onClick={onUndo} disabled={!canUndo}>
            Undo
          </Button>{" "}
          <Button variant="outlined" onClick={onRedo} disabled={!canRedo}>
            Redo
          </Button>
          <Button
            variant="outlined"
            onClick={onRunShader}
            className="mx-auto my-2 block w-full"
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
        <div className="my-2 flex flex-row flex-wrap gap-2 rounded-lg bg-panel p-2">
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
        <ShaderHistory currentSource={shaderSource} onApply={onShaderSourceChange} />
        <label className="min-w-16 cursor-pointer rounded border border-accent bg-accent px-4 py-[0.4rem] text-sm font-medium uppercase tracking-[0.02857em] text-white transition-colors [font:inherit] hover:brightness-110">
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
