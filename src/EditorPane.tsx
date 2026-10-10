import React from "react";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ImageIcon from "@mui/icons-material/Image";
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import styles from "./styles/ShaderPlayground.module.css";
import { language } from "./glsl";

monaco.languages.register({ id: "glsl" });
monaco.languages.setMonarchTokensProvider("glsl", language);
loader.config({ monaco });

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export interface EditorPaneProps {
  shaderSource: string;
  onShaderSourceChange: (source: string) => void;
  onRunShader: () => void;
  downloadShaderFilename: string;
  onDownloadShaderFilenameChange: (filename: string) => void;
  onDownloadShader: () => void;
  onPickImage: (dataUrl: string) => void;
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
}: EditorPaneProps) {
  return (
    <div className={styles.rightColumn}>
      <div id="editorParent">
        <Editor
          height="40vh"
          width="80vh"
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
            Run Shader
          </Button>
        </div>
        <div className={styles.downloadShaderOptions}>
          <TextField
            label="Filename"
            type="text"
            className={styles.screenshotOption}
            value={downloadShaderFilename}
            variant="outlined"
            onChange={(e) => onDownloadShaderFilenameChange(e.target.value)}
          />
          <Button variant="outlined" onClick={onDownloadShader}>
            Download Shader
          </Button>
        </div>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<ImageIcon />}
        >
          Pick tDiffuse Image
          <VisuallyHiddenInput
            type="file"
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
        </Button>
      </div>
    </div>
  );
}
