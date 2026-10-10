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

const FILE_PICKER_LABEL =
  "edge-accent inline-flex min-h-9 min-w-16 cursor-pointer items-center justify-center gap-2 rounded-[2px] px-4 py-[0.45rem] font-display text-[1.15rem] leading-none uppercase tracking-[0.14em] text-accent glow transition-colors hover:bg-accent hover:text-on-accent hover:shadow-[0_0_12px_var(--glow)]";

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
        <div className="mb-1 flex items-baseline gap-2" aria-hidden="true">
          <span className="section-label">GLSL source</span>
          <span className="micro-label grow opacity-60">buffer 01</span>
        </div>
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
              fontFamily:
                '"IBM Plex Mono", ui-monospace, SFMono-Regular, Monaco, "Cascadia Code", monospace',
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
            variant="contained"
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
          <Button variant="outlined" tone="danger" onClick={onResetShader}>
            Reset to default shader
          </Button>
        </div>
        <div className="surface-panel my-2 flex flex-row flex-wrap items-center gap-2 p-2">
          <span className="micro-label" aria-hidden="true">
            [ export ]
          </span>
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
        <label className={FILE_PICKER_LABEL}>
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
