import React from "react";
import * as THREE from "three";

import styles from "./styles/ShaderPlayground.module.css";
import { ShaderPreview } from "./preview";
import { PreviewPane } from "./PreviewPane";
import { EditorPane } from "./EditorPane";
import { captureAndDownloadSceneScreenshot } from "./screenshot";
import { downloadTextFile } from "./download";
import defaultVertexShader from "./shaders/vertex_shader.vert";
import defaultFragmentShader from "./shaders/fragment_shader.frag";

export default function ShaderPlayground() {
  const [fragmentShader, setFragmentShader] = React.useState(defaultFragmentShader);
  const [inputFragmentShader, setInputFragmentShader] =
    React.useState(defaultFragmentShader);
  const [width, setWidth] = React.useState(1920);
  const [height, setHeight] = React.useState(1080);
  const [screenshotFilename, setScreenshotFilename] = React.useState("screenshot.png");
  const [captureScreenshotFilename, setCaptureScreenshotFilename] = React.useState("");
  const [downloadShaderFilename, setDownloadShaderFilename] =
    React.useState("fragment.frag");
  const [tDiffuseImagePath, setTDiffuseImagePath] =
    React.useState("cat-7738210_1920.jpg");

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const previewRef = React.useRef<ShaderPreview | null>(null);

  // Create the renderer once and tear it down on unmount.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const preview = new ShaderPreview({
      canvas,
      vertexShader: defaultVertexShader,
      fragmentShader,
    });
    previewRef.current = preview;
    if (canvas.clientWidth > 0 && canvas.clientHeight > 0) {
      preview.setSize(canvas.clientWidth, canvas.clientHeight);
    }
    preview.render();
    return () => {
      preview.dispose();
      previewRef.current = null;
    };
    // Mount-only: updates flow through the effects below.
  }, []);

  // Apply the compiled shader whenever it changes.
  React.useEffect(() => {
    previewRef.current?.setFragmentShader(fragmentShader);
  }, [fragmentShader]);

  // Load the tDiffuse texture (bundled path or picked image data URL).
  React.useEffect(() => {
    let cancelled = false;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(tDiffuseImagePath, (texture) => {
      if (cancelled) {
        texture.dispose();
        return;
      }
      previewRef.current?.setTexture(texture);
    });
    return () => {
      cancelled = true;
    };
  }, [tDiffuseImagePath]);

  // Keep the drawing buffer in sync with the canvas' CSS size.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const observer = new ResizeObserver(() => {
      const preview = previewRef.current;
      if (!preview) {
        return;
      }
      preview.setSize(canvas.clientWidth, canvas.clientHeight);
      preview.render();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Screenshot flow (a side effect, so it lives in an effect).
  React.useEffect(() => {
    if (!captureScreenshotFilename) {
      return;
    }
    const preview = previewRef.current;
    if (preview) {
      captureAndDownloadSceneScreenshot(preview.scene, preview.camera, {
        filename: captureScreenshotFilename,
        width,
        height,
      });
    }
    setCaptureScreenshotFilename("");
  }, [captureScreenshotFilename, width, height]);

  function updateShader() {
    setFragmentShader(inputFragmentShader);
  }

  function downloadShader() {
    downloadTextFile(downloadShaderFilename, inputFragmentShader);
  }

  function captureScreenshot() {
    setCaptureScreenshotFilename(screenshotFilename);
  }

  return (
    <div className={styles.mainDiv}>
      <PreviewPane
        canvasRef={canvasRef}
        width={width}
        height={height}
        onWidthChange={setWidth}
        onHeightChange={setHeight}
        screenshotFilename={screenshotFilename}
        onScreenshotFilenameChange={setScreenshotFilename}
        onCaptureScreenshot={captureScreenshot}
      />
      <EditorPane
        shaderSource={inputFragmentShader}
        onShaderSourceChange={setInputFragmentShader}
        onRunShader={updateShader}
        downloadShaderFilename={downloadShaderFilename}
        onDownloadShaderFilenameChange={setDownloadShaderFilename}
        onDownloadShader={downloadShader}
        onPickImage={setTDiffuseImagePath}
      />
    </div>
  );
}
