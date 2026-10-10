import React from "react";
import * as THREE from "three";
import * as monaco from "monaco-editor";
import Editor, { loader } from "@monaco-editor/react";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ImageIcon from "@mui/icons-material/Image";

import styles from "./styles/ShaderPlayground.module.css";
import { ShaderPreview } from "./preview";
import { captureAndDownloadSceneScreenshot } from "./screenshot";
import { downloadTextFile } from "./download";
import defaultVertexShader from "./shaders/vertex_shader.vert";
import defaultFragmentShader from "./shaders/fragment_shader.frag";
import { language } from "./glsl";

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

monaco.languages.register({ id: "glsl" });
monaco.languages.setMonarchTokensProvider("glsl", language);
loader.config({ monaco });

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
      <div className={styles.leftColumn}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{
            aspectRatio: width / height,
            width: "unset",
            height: "unset",
          }}
        />
        <div className={styles.screenshotControls}>
          <TextField
            label="Width"
            type="number"
            className={styles.screenshotOption}
            value={width}
            variant="outlined"
            onChange={(e) => setWidth(Number(e.target.value))}
          />
          <TextField
            label="Height"
            type="number"
            className={styles.screenshotOption}
            value={height}
            variant="outlined"
            onChange={(e) => setHeight(Number(e.target.value))}
          />
          <TextField
            label="Filename"
            type="text"
            className={styles.screenshotOption}
            value={screenshotFilename}
            variant="outlined"
            onChange={(e) => setScreenshotFilename(e.target.value)}
          />
          <Button
            className={styles.screenshotButton}
            variant="outlined"
            onClick={captureScreenshot}
          >
            Screenshot!
          </Button>
        </div>
      </div>
      <div className={styles.rightColumn}>
        <div id="editorParent">
          <Editor
            height="40vh"
            width="80vh"
            language="glsl"
            defaultValue={inputFragmentShader}
            onChange={(value, _event) => {
              setInputFragmentShader(value ?? "");
            }}
          />
          <div>
            <Button
              variant="outlined"
              onClick={updateShader}
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
              onChange={(e) => setDownloadShaderFilename(e.target.value)}
            />
            <Button variant="outlined" onClick={downloadShader}>
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
                      setTDiffuseImagePath(dataUrl);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
