import React from "react";
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import styles from "./styles/ShaderPlayground.module.css";
import controls from "./styles/controls.module.css";
import { language } from "./glsl";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { Switch } from "./ui/Switch";
import { ImageIcon } from "./ui/icons";

monaco.languages.register({ id: "glsl" });
monaco.languages.setMonarchTokensProvider("glsl", language);
loader.config({ monaco });

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
}: EditorPaneProps) {
  return (
    <div className={styles.rightColumn}>
      <div id="editorParent" role="region" aria-label="Shader editor">
        <Editor
          height="40vh"
          width="100%"
          language="glsl"
          defaultValue={shaderSource}
          onChange={(value, _event) => {
            onShaderSourceChange(value ?? "");
          }}
        />
        <div>
          <Button
            variant="outlined"
            onClick={onRunShader}
            className={styles.runShaderButton}
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
        <div className={styles.downloadShaderOptions}>
          <TextField
            label="Filename"
            type="text"
            className={styles.screenshotOption}
            value={downloadShaderFilename}
            aria-label="Shader download filename"
            onChange={onDownloadShaderFilenameChange}
          />
          <Button variant="outlined" onClick={onDownloadShader}>
            Download Shader (Ctrl+S)
          </Button>
        </div>
        <label className={`${controls.button} ${controls.contained}`}>
          <ImageIcon /> Pick tDiffuse Image
          <input
            type="file"
            className={controls.visuallyHidden}
            aria-label="Choose a texture image"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
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
