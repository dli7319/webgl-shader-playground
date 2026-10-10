import React from "react";

import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { Slab, slabPanelId } from "./ui/Slab";
import { ImageIcon } from "./ui/icons";
import { ShaderHistory } from "./ShaderHistory";
import type { SavedShader } from "./shaderStore";

export type SlabId = "capture" | "file" | "history" | "texture";

export const SLAB_IDS: SlabId[] = ["capture", "file", "history", "texture"];

const SLAB_TITLES: Record<SlabId, string> = {
  capture: "Capture",
  file: "Source File",
  history: "Saved Shaders",
  texture: "Texture · tDiffuse",
};

/** Read-only state each slab reports beside (and inside) its opener. */
export interface SlabStateInfo {
  width: number;
  height: number;
  screenshotFilename: string;
  isRecording: boolean;
  downloadShaderFilename: string;
  savedCount: number;
  textureLabel: string;
}

export function slabTitle(id: SlabId): string {
  return SLAB_TITLES[id];
}

export function slabSummaryText(info: SlabStateInfo, id: SlabId): string {
  switch (id) {
    case "capture":
      return `${info.width}×${info.height} · ${info.screenshotFilename}`;
    case "file":
      return info.downloadShaderFilename;
    case "history":
      return info.savedCount === 0 ? "Empty" : `${info.savedCount} saved`;
    case "texture":
      return info.textureLabel;
  }
}

/** State flags swapped in place (never layout moves) — currently REC. */
export function slabFlag(info: SlabStateInfo, id: SlabId): React.ReactNode {
  if (id === "capture" && info.isRecording) {
    return <span className="rec-flag">● REC</span>;
  }
  return null;
}

export { slabPanelId };

export interface ToolSlabsProps {
  openSlabs: Record<SlabId, boolean>;
  info: SlabStateInfo;
  width: number;
  height: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  screenshotFilename: string;
  onScreenshotFilenameChange: (filename: string) => void;
  onCaptureScreenshot: () => void;
  recordingSupported: boolean;
  isRecording: boolean;
  onToggleRecording: () => void;
  downloadShaderFilename: string;
  onDownloadShaderFilenameChange: (filename: string) => void;
  onDownloadShader: () => void;
  onResetShader: () => void;
  entries: SavedShader[];
  onSaveShader: (name: string) => void;
  onRemoveShader: (id: string) => void;
  onApplyShader: (source: string) => void;
  onPickImage: (dataUrl: string) => void;
}

/**
 * The stack of collapsible tool slabs. Each object's controls stay in ONE
 * group: capture size+filename+Screenshot!+record, source filename+download+
 * reset, saved shaders (name+save+list), texture pick.
 */
export function ToolSlabs({
  openSlabs,
  info,
  width,
  height,
  onWidthChange,
  onHeightChange,
  screenshotFilename,
  onScreenshotFilenameChange,
  onCaptureScreenshot,
  recordingSupported,
  isRecording,
  onToggleRecording,
  downloadShaderFilename,
  onDownloadShaderFilenameChange,
  onDownloadShader,
  onResetShader,
  entries,
  onSaveShader,
  onRemoveShader,
  onApplyShader,
  onPickImage,
}: ToolSlabsProps) {
  return (
    <div className="flex flex-col gap-4">
      <Slab
        id="capture"
        title={SLAB_TITLES.capture}
        summary={
          <>
            {slabSummaryText(info, "capture")} {slabFlag(info, "capture")}
          </>
        }
        open={openSlabs.capture}
      >
        <div className="flex flex-row flex-wrap items-stretch gap-3">
          <TextField
            label="Width"
            type="number"
            className="grow"
            value={width}
            aria-label="Screenshot width in pixels"
            onChange={(v) => onWidthChange(Number(v))}
          />
          <TextField
            label="Height"
            type="number"
            className="grow"
            value={height}
            aria-label="Screenshot height in pixels"
            onChange={(v) => onHeightChange(Number(v))}
          />
          <TextField
            label="Filename"
            type="text"
            className="grow"
            value={screenshotFilename}
            aria-label="Screenshot filename"
            onChange={onScreenshotFilenameChange}
          />
          <Button className="grow" variant="outlined" onClick={onCaptureScreenshot}>
            Screenshot!
          </Button>
        </div>
        {recordingSupported ? (
          <Button variant="outlined" onClick={onToggleRecording}>
            {isRecording ? "Stop recording" : "Record (WebM)"}
          </Button>
        ) : null}
      </Slab>
      <Slab
        id="file"
        title={SLAB_TITLES.file}
        summary={slabSummaryText(info, "file")}
        open={openSlabs.file}
      >
        <div className="flex flex-row flex-wrap items-stretch gap-3">
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
        <Button variant="outlined" tone="warning" onClick={onResetShader}>
          Reset to default shader
        </Button>
      </Slab>
      <Slab
        id="history"
        title={SLAB_TITLES.history}
        summary={slabSummaryText(info, "history")}
        open={openSlabs.history}
      >
        <ShaderHistory
          entries={entries}
          onSave={onSaveShader}
          onRemove={onRemoveShader}
          onApply={onApplyShader}
        />
      </Slab>
      <Slab
        id="texture"
        title={SLAB_TITLES.texture}
        summary={slabSummaryText(info, "texture")}
        open={openSlabs.texture}
      >
        <label className="btn">
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
      </Slab>
    </div>
  );
}
