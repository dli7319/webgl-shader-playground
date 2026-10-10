import React from "react";
import { Button, BUTTON_OUTLINED } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { ImageIcon } from "./ui/icons";

export interface ToolTrayProps {
  width: number;
  height: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  screenshotFilename: string;
  onScreenshotFilenameChange: (filename: string) => void;
  onCaptureScreenshot: () => void;
  downloadShaderFilename: string;
  onDownloadShaderFilenameChange: (filename: string) => void;
  onDownloadShader: () => void;
  texturePath: string;
  onPickImage: (dataUrl: string) => void;
  isRecording: boolean;
  recordingSupported: boolean;
  onToggleRecording: () => void;
}

type OpenPanel = "export" | "download" | null;

/** Texture summary beside the picker: what material is loaded right now. */
function textureLabel(texturePath: string): string {
  return texturePath.startsWith("data:") ? "picked image" : texturePath;
}

/**
 * Bottom "pencil case" tray: everything that takes work out of the book —
 * plate capture (still + motion), shader download, and the tDiffuse material.
 * Secondary settings hide in popovers, each summarized on its opener chip.
 */
export function ToolTray({
  width,
  height,
  onWidthChange,
  onHeightChange,
  screenshotFilename,
  onScreenshotFilenameChange,
  onCaptureScreenshot,
  downloadShaderFilename,
  onDownloadShaderFilenameChange,
  onDownloadShader,
  texturePath,
  onPickImage,
  isRecording,
  recordingSupported,
  onToggleRecording,
}: ToolTrayProps) {
  const [openPanel, setOpenPanel] = React.useState<OpenPanel>(null);

  function togglePanel(panel: Exclude<OpenPanel, null>) {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  return (
    <section
      className="tool-tray mx-2 mb-3 grid grid-cols-3 items-start gap-0 px-4 py-3.5 max-[900px]:grid-cols-1"
      aria-label="Tool tray"
    >
      {/* Plate capture: export size + filename + still/motion capture. */}
      <div className="tool-slot relative flex grow flex-col gap-2">
        <p className="note-label">Plate capture</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="chip-summary"
            aria-label="Export settings"
            aria-expanded={openPanel === "export"}
            onClick={() => togglePanel("export")}
          >
            {width}×{height} · {screenshotFilename}
          </button>
          <Button variant="outlined" onClick={onCaptureScreenshot}>
            Screenshot!
          </Button>
          {recordingSupported ? (
            <Button
              variant="outlined"
              className={isRecording ? "btn-recording" : undefined}
              onClick={onToggleRecording}
            >
              {isRecording ? "Stop recording" : "Record (WebM)"}
            </Button>
          ) : null}
        </div>
        {openPanel === "export" ? (
          <div className="tool-popover">
            <TextField
              label="Width"
              type="number"
              value={width}
              aria-label="Screenshot width in pixels"
              onChange={(v) => onWidthChange(Number(v))}
            />
            <TextField
              label="Height"
              type="number"
              value={height}
              aria-label="Screenshot height in pixels"
              onChange={(v) => onHeightChange(Number(v))}
            />
            <TextField
              label="Filename"
              type="text"
              value={screenshotFilename}
              aria-label="Screenshot filename"
              onChange={onScreenshotFilenameChange}
            />
          </div>
        ) : null}
      </div>

      {/* Shader download: filename + action as one group. */}
      <div className="tool-slot relative flex grow flex-col gap-2">
        <p className="note-label">Shader</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="chip-summary"
            aria-label="Download filename"
            aria-expanded={openPanel === "download"}
            onClick={() => togglePanel("download")}
          >
            {downloadShaderFilename}
          </button>
          <Button variant="outlined" onClick={onDownloadShader}>
            Download Shader (Ctrl+S)
          </Button>
        </div>
        {openPanel === "download" ? (
          <div className="tool-popover">
            <TextField
              label="Filename"
              type="text"
              value={downloadShaderFilename}
              aria-label="Shader download filename"
              onChange={onDownloadShaderFilenameChange}
            />
          </div>
        ) : null}
      </div>

      {/* Material: the tDiffuse texture loaded into the preview. */}
      <div className="tool-slot flex grow flex-col gap-2">
        <p className="note-label">Material</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip-note">tDiffuse · {textureLabel(texturePath)}</span>
          <label className={`${BUTTON_OUTLINED} cursor-pointer`}>
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
    </section>
  );
}
