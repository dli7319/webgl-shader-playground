import React, { useEffect, useMemo } from "react";
import { Suspense } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  OrthographicCamera,
  shaderMaterial,
  useTexture,
} from "@react-three/drei";
import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";

import styles from "./styles/ShaderPlayground.module.css";
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

const imageExtensionToMime = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

function Scene({
  fragmentShader,
  tDiffuseImagePath,
  screenshotFilename,
  setScreenshotFilename,
  screenshotWidth,
  screenshotHeight,
}: {
  fragmentShader: string;
  tDiffuseImagePath: string;
  screenshotFilename: string;
  setScreenshotFilename: any;
  screenshotWidth: number;
  screenshotHeight: number;
}) {
  const shaderMaterialRef = React.useRef<THREE.ShaderMaterial>(null);
  if (shaderMaterialRef.current) {
    shaderMaterialRef.current.needsUpdate = true;
  }
  const texture = useTexture(tDiffuseImagePath, (texture) => {
    if (shaderMaterialRef.current) {
        console.log("Setting tDiffuse")
        shaderMaterialRef.current.uniforms.tDiffuse.value = null;
      shaderMaterialRef.current.uniforms.tDiffuse.value = texture;
      shaderMaterialRef.current.needsUpdate = true;
    }
  });
  const uniforms = {
    tDiffuse: { value: texture },
    opacity: { value: 1.0 },
  };

  const { scene, camera } = useThree();

  if (screenshotFilename) {
    const filenameExtension = screenshotFilename.split(".").pop();
    if (!filenameExtension || !(filenameExtension in imageExtensionToMime)) {
      console.error("Invalid screenshot filename");
      return;
    }
    const mimeType =
      imageExtensionToMime[
        filenameExtension as keyof typeof imageExtensionToMime
      ];
    const renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
    });
    renderer.setSize(screenshotWidth, screenshotHeight);
    renderer.render(scene, camera);
    const imageData = renderer.domElement.toDataURL(mimeType);
    if (imageData) {
      const a = document.createElement("a");
      a.download = screenshotFilename;
      a.href = imageData;
      a.click();
    }
    setScreenshotFilename("");
  }

  return (
    <>
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[10, 10]} />
        <shaderMaterial
          vertexShader={defaultVertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          side={THREE.DoubleSide}
          ref={shaderMaterialRef}
          needsUpdate={true}
        />
      </mesh>
    </>
  );
}

export default function ShaderPlayground() {
  const [fragmentShader, setFragmentShader] = React.useState(
    defaultFragmentShader
  );
  const [inputFragmentShader, setInputFragmentShader] = React.useState(
    defaultFragmentShader
  );
  const cameraRef = React.useRef<THREE.OrthographicCamera>(null);
  const [width, setWidth] = React.useState(1920);
  const [height, setHeight] = React.useState(1080);
  const [screenshotFilename, setScreenshotFilename] =
    React.useState("screenshot.png");
  const [captureScreenshotFilename, setCaptureScreenshotFilename] =
    React.useState("");
  const [downloadShaderFilename, setDownloadShaderFilename] =
    React.useState("fragment.frag");
  const [tDiffuseImagePath, setTDiffuseImagePath] = React.useState(
    "cat-7738210_1920.jpg"
  );

  function updateShader() {
    setFragmentShader(inputFragmentShader);
  }

  function downloadShader() {
    const a = document.createElement("a");
    a.download = downloadShaderFilename;
    a.href = "data:text/plain," + encodeURIComponent(inputFragmentShader);
    a.click();
  }

  function captureScreenshot() {
    setCaptureScreenshotFilename(screenshotFilename);
  }

  return (
    <div className={styles.mainDiv}>
      <div className={styles.leftColumn}>
        <Canvas
          className={styles.canvas}
          orthographic={true}
          camera={
            {
              left: -5,
              right: 5,
              top: 5,
              bottom: -5,
              near: 0.1,
              far: 1000,
              position: [0, 0, 1],
              rotation: [0, 0, 0],
            } as any
          }
          style={{
            aspectRatio: width / height,
            width: "unset",
            height: "unset",
          }}
        >
          <Suspense fallback={null}>
            <Scene
              fragmentShader={fragmentShader}
              tDiffuseImagePath={tDiffuseImagePath}
              screenshotFilename={captureScreenshotFilename}
              setScreenshotFilename={setCaptureScreenshotFilename}
              screenshotWidth={width}
              screenshotHeight={height}
            />
          </Suspense>
        </Canvas>
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
            onChange={(value, event) => {
              setInputFragmentShader(value);
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
