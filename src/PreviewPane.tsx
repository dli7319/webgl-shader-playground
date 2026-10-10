import React from "react";

import { StatusBar } from "./StatusBar";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { InspectorSection } from "./ui/InspectorSection";
import type { CompileStatus } from "./status";

export interface PreviewPaneProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  screenshotFilename: string;
  onScreenshotFilenameChange: (filename: string) => void;
  onCaptureScreenshot: () => void;
  compileError?: string | null;
  textureError?: string | null;
  screenshotError?: string | null;
  status: CompileStatus;
  runDurationMs: number | null;
  zoomPercent: number;
  downloadShaderFilename: string;
  onDownloadShaderFilenameChange: (filename: string) => void;
  onDownloadShader: () => void;
  isRecording: boolean;
  recordingSupported: boolean;
  onToggleRecording: () => void;
}

const ERROR_BOX =
  "frame-1px border-l-2 border-l-danger bg-app px-3 py-2 text-sm text-danger-ink [&_pre]:mt-1 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre]:font-mono [&_pre]:text-[0.8rem]";
const COMPILE_ERROR = ERROR_BOX;
const WARN_ERROR = ERROR_BOX;

/**
 * Monitor column: the preview output, the read-only status strip, a reserved
 * diagnostics slot, and the output strip (one group per output object, each
 * reporting its state in a summary that opens its settings).
 */
export function PreviewPane({
  canvasRef,
  width,
  height,
  onWidthChange,
  onHeightChange,
  screenshotFilename,
  onScreenshotFilenameChange,
  onCaptureScreenshot,
  compileError,
  textureError,
  screenshotError,
  status,
  runDurationMs,
  zoomPercent,
  downloadShaderFilename,
  onDownloadShaderFilenameChange,
  onDownloadShader,
  isRecording,
  recordingSupported,
  onToggleRecording,
}: PreviewPaneProps) {
  const [exportOpen, setExportOpen] = React.useState(false);
  const [shaderOpen, setShaderOpen] = React.useState(false);

  return (
    <div className="monitor-column">
      <section>
        <h2 className="section-label">Preview</h2>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Shader preview output"
          className="frame-1px bg-app"
          style={{
            aspectRatio: `${width / height}`,
            width: `${zoomPercent}%`,
            height: "unset",
          }}
        />
        <StatusBar
          status={status}
          runDurationMs={runDurationMs}
          width={width}
          height={height}
        />
        <div className="mt-2 flex flex-col gap-2">
          {compileError ? (
            <div className={COMPILE_ERROR} role="alert">
              <strong>Shader error</strong>
              <pre>{compileError}</pre>
            </div>
          ) : null}
          {textureError ? (
            <div className={WARN_ERROR} role="alert">
              <strong>Texture error</strong>
              <pre>{textureError}</pre>
            </div>
          ) : null}
          {screenshotError ? (
            <div className={WARN_ERROR} role="alert">
              <strong>Screenshot error</strong>
              <pre>{screenshotError}</pre>
            </div>
          ) : null}
        </div>
      </section>
      <section>
        <h2 className="section-label">Output</h2>
        <div className="surface-panel output-strip">
          <InspectorSection
            id="output-export"
            title="Export"
            summary={
              <span className="tabular-nums">
                {width}×{height} · {screenshotFilename}
              </span>
            }
            open={exportOpen}
            onToggle={() => setExportOpen((open) => !open)}
            action={
              <Button variant="outlined" onClick={onCaptureScreenshot}>
                Screenshot!
              </Button>
            }
          >
            <div className="flex flex-row flex-wrap items-center gap-2">
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
            </div>
          </InspectorSection>
          <InspectorSection
            id="output-shader"
            title="Shader file"
            summary={<span className="truncate">{downloadShaderFilename}</span>}
            open={shaderOpen}
            onToggle={() => setShaderOpen((open) => !open)}
            action={
              <Button variant="outlined" onClick={onDownloadShader}>
                Download Shader (Ctrl+S)
              </Button>
            }
          >
            <TextField
              label="Filename"
              type="text"
              value={downloadShaderFilename}
              aria-label="Shader download filename"
              onChange={onDownloadShaderFilenameChange}
            />
          </InspectorSection>
          {recordingSupported ? (
            <div className="output-record">
              <Button
                variant="outlined"
                tone={isRecording ? "warning" : undefined}
                onClick={onToggleRecording}
              >
                {isRecording ? "Stop recording" : "Record (WebM)"}
              </Button>
              <span className="output-record-note">
                {isRecording ? "Recording preview…" : "Captures the preview as WebM"}
              </span>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
