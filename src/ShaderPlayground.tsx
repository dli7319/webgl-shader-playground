import React, { useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from "three";
import { OrthographicCamera } from '@react-three/drei';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-glsl";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import styles from './styles/ShaderPlayground.module.css';
import defaultVertexShader from './shaders/vertex_shader.vert';
import defaultFragmentShader from './shaders/fragment_shader.frag';


const imageExtensionToMime = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
};


export default function ShaderPlayground() {
    const [fragmentShader, setFragmentShader] = React.useState(defaultFragmentShader);
    const [inputFragmentShader, setInputFragmentShader] = React.useState(defaultFragmentShader);
    const shaderMaterialRef = React.useRef<THREE.ShaderMaterial>(null);
    const sceneRef = React.useRef<THREE.Scene>(null);
    const cameraRef = React.useRef<THREE.OrthographicCamera>(null);
    const [width, setWidth] = React.useState(1920);
    const [height, setHeight] = React.useState(1080);
    const [screenshotFilename, setScreenshotFilename] = React.useState("screenshot.png");
    const [downloadShaderFilename, setDownloadShaderFilename] = React.useState("fragment.frag");
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const aspect = width / height;

    function updateShader() {
        setFragmentShader(inputFragmentShader);
        shaderMaterialRef.current!.needsUpdate = true
    }

    function downloadShader() {
        const a = document.createElement("a");
        a.download = downloadShaderFilename;
        a.href = "data:text/plain," + encodeURIComponent(inputFragmentShader);
        a.click();
    }

    const texture = useLoader(THREE.TextureLoader, 'cat-7738210_1920.jpg');
    const uniforms = {
        tDiffuse: { value: texture },
        opacity: { value: 1.0 },
    };

    function captureScreenshot() {
        const filenameExtension = screenshotFilename.split('.').pop();
        if (!filenameExtension || !(filenameExtension in imageExtensionToMime)) {
            console.error("Invalid screenshot filename");
            return;
        }
        const mimeType = imageExtensionToMime[filenameExtension as keyof typeof imageExtensionToMime];
        const renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true,
        });
        renderer.setSize(width, height);
        renderer.render(sceneRef.current!, cameraRef.current!);
        const imageData = renderer.domElement.toDataURL(mimeType);
        if (imageData) {
            const a = document.createElement("a");
            a.download = screenshotFilename;
            a.href = imageData;
            a.click();
        }
    }

    return <div className={styles.mainDiv}>
        <div className={styles.leftColumn}>
            <Canvas
                ref={canvasRef}
                className={styles.canvas}
                style={{
                    aspectRatio: aspect,
                    width: "unset",
                    height: "unset",
                }}
            >
                <OrthographicCamera
                    left={-5}
                    right={5}
                    top={5}
                    bottom={-5}
                    near={0.1}
                    far={1000}
                    position={[0, 0, 1]}
                    rotation={[0, 0, 0]}
                    makeDefault
                    manual
                    ref={cameraRef}
                />
                <scene ref={sceneRef}>
                    <mesh
                        position={[0, 0, -1]}
                    >
                        <planeGeometry args={[10, 10]} />
                        <shaderMaterial
                            vertexShader={defaultVertexShader}
                            fragmentShader={fragmentShader}
                            uniforms={uniforms}
                            side={THREE.DoubleSide}
                            ref={shaderMaterialRef}
                        />
                    </mesh>
                </scene>
            </Canvas>
            <div className={styles.screenshotControls}>
                <TextField label="Width" type="number" className={styles.screenshotOption} value={width} variant="outlined"
                    onChange={e => setWidth(Number(e.target.value))} />
                <TextField label="Height" type="number" className={styles.screenshotOption} value={height} variant="outlined"
                    onChange={e => setHeight(Number(e.target.value))} />
                {/* <input type="text" id="screenshotFilenameInput" value="screenshot.png" readOnly={true} /> */}
                <TextField label="Filename" type="text" className={styles.screenshotOption} value="screenshot.png" variant="outlined"
                    onChange={e => setScreenshotFilename(e.target.value)} />
                <Button className={styles.screenshotButton} variant="outlined" onClick={captureScreenshot}>Screenshot!</Button>
            </div>
        </div>
        <div className={styles.rightColumn}>
            <div id="editorParent">
                <AceEditor
                    mode="glsl"
                    value={inputFragmentShader}
                    onChange={(e) => {
                        setInputFragmentShader(e);
                    }}
                />
                <div>
                    <Button variant="outlined" onClick={updateShader} className={styles.runShaderButton}>Run Shader</Button>
                </div>
                <div className={styles.downloadShaderOptions}>
                    <TextField label="Filename" type="text" className={styles.screenshotOption} value="fragment.frag" variant="outlined"
                        onChange={e => setDownloadShaderFilename(e.target.value)} />
                    <Button variant="outlined" onClick={downloadShader}>Download Shader</Button>
                </div>
            </div>
        </div>
    </div>;
}