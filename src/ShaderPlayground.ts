import * as THREE from "three";
import { ShaderScene } from "./ShaderScene.ts";
// const ace = require("ace-builds");
import * as ace from "ace-builds";

export class ShaderPlayground {
  vertexShader: string;
  fragmentShader: string;
  texture: THREE.Texture;
  previewScene: ShaderScene;
  shader: any;
  texturePath = "cat-7738210_1920.jpg";
  webGLVersion = 1;
  resourcesUrl = "";
  fragmentShaderEditor: any;
  screenshotFilenameInput = <HTMLInputElement>(
    document.getElementById("screenshotFilenameInput")
  );
  downloadShaderFilenameInput = <HTMLInputElement>(
    document.getElementById("downloadShaderFilenameInput")
  );
  downloadShaderButton = <HTMLButtonElement>(
    document.getElementById("downloadShaderButton")
  );
  screenshotErrorArea = <HTMLParagraphElement>(
    document.getElementById("screenshotErrorArea")
  );

  constructor() {}

  start() {
    this.setupEditor();
    this.loadShaders();
    this.loadTexture();
    this.setListeners();
  }

  setupEditor() {
    ace.config.set("basePath", ".");
    const editor = ace.edit(document.getElementById("fragmentShaderEditor"));
    editor.session.setOptions({
      mode: "ace/mode/glsl",
      tabSize: 2,
      useSoftTabs: true
    });
    this.fragmentShaderEditor = editor;
  }

  updateResolution() {
    const widthElement = <HTMLInputElement>(
      document.getElementById("widthInput")
    );
    const heightElement = <HTMLInputElement>(
      document.getElementById("heightInput")
    );
    if (
      this.previewScene != null &&
      widthElement != null &&
      heightElement != null
    ) {
      const width = parseInt(widthElement.value);
      const height = parseInt(heightElement.value);
      this.previewScene.updateResolution(width, height);
    }
  }

  loadShaders() {
    fetch(this.resourcesUrl + "vertex_shader.vert")
      .then(response => response.text())
      .then(data => {
        this.vertexShader = data;
        this.startScene();
      });
    fetch(this.resourcesUrl + "fragment_shader.frag")
      .then(response => response.text())
      .then(data => {
        this.fragmentShader = data;
        if (this.fragmentShaderEditor != null) {
          this.fragmentShaderEditor.setValue(data, -1);
        }
        this.startScene();
      });
  }

  loadTexture() {
    const loader = new THREE.TextureLoader();
    loader.load(
      this.resourcesUrl + this.texturePath,
      // onLoad callback
      textureParam => {
        this.texture = textureParam;
        this.startScene();
      },
      // onProgress callback currently not supported
      undefined,
      // onError callback
      err => {
        console.error("An error happened loading texture.");
      }
    );
  }

  updateShader() {
    if (this.fragmentShaderEditor != null) {
      const fragmentShader = this.fragmentShaderEditor.getValue();
      if (this.previewScene != null && this.previewScene.material != null) {
        this.previewScene.material.fragmentShader = fragmentShader;
        this.previewScene.material.needsUpdate = true;
      }
    }
    if (!this.previewScene.active) {
      this.previewScene.animate();
    }
  }

  setListeners() {
    const updateResolutionButton = document.getElementById(
      "updateResolutionButton"
    );
    updateResolutionButton.addEventListener(
      "click",
      this.updateResolution.bind(this)
    );
    const updateShaderButton = document.getElementById("updateShaderButton");
    updateShaderButton.addEventListener("click", this.updateShader.bind(this));
    if (this.downloadShaderButton) {
      this.downloadShaderButton.addEventListener(
        "click",
        this.downloadFragmentShader.bind(this)
      );
    }
  }

  startScene() {
    if (
      typeof this.vertexShader !== "string" ||
      typeof this.fragmentShader !== "string" ||
      typeof this.texture === "undefined" ||
      !this.texture.isTexture
    ) {
      return;
    }

    const mainCanvas = <HTMLCanvasElement>document.getElementById("mainCanvas");
    mainCanvas.width = 1920;
    mainCanvas.height = 1080;
    this.shader = {
      uniforms: {
        tDiffuse: {
          value: this.texture
        },
        opacity: {
          value: 1.0
        }
      },
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader
    };
    this.previewScene = new ShaderScene({
      shader: this.shader,
      canvas: mainCanvas,
      webGLVersion: this.webGLVersion
    });

    const screenshotButton = document.getElementById("screenshotButton");
    screenshotButton.addEventListener("click", this.takeScreenshot.bind(this));
  }

  /**
   * takeScreenshot - Takes a screenshot and save it as a png file.
   *
   * @return {type}  description
   */
  takeScreenshot() {
    let downloadFilename = "screenshot.png";
    if (this.screenshotFilenameInput) {
      downloadFilename = this.screenshotFilenameInput.value;
    }
    const extensionRegex = /(?:\.([^.]+))?$/;
    const match = extensionRegex.exec(downloadFilename);
    let extension = "png";
    if (typeof match !== "undefined") {
      extension = match[1];
    }

    this.screenshotErrorArea.innerHTML = "";
    if (!["jpeg", "jpg", "png", "webp"].includes(extension)) {
      this.screenshotErrorArea.innerHTML = "Invalid file type";
      return;
    }

    this.previewScene.getScreenshot(extension).then((screenshot: string) => {
      const a = document.createElement("a");
      const extensionRegex = /^data:image\/([a-z]+);/;
      const retrievedExtension = extensionRegex.exec(screenshot)[1];
      if (typeof retrievedExtension !== "undefined") {
        if (
          retrievedExtension !== extension &&
          !(retrievedExtension === "jpeg" && extension === "jpg")
        ) {
          downloadFilename += "." + retrievedExtension;
        }
      }
      a.download = downloadFilename;
      a.href = screenshot;
      a.click();
    });
  }

  /**
   * downloadFragmentShader - Downloads the fragment shader as a file.
   *
   * @return {none}  description
   */
  downloadFragmentShader() {
    const a = document.createElement("a");
    a.download = "fragment_shader.frag";
    if (this.downloadShaderFilenameInput) {
      a.download = this.downloadShaderFilenameInput.value;
    }
    a.href =
      "data:text/plain;charset=utf-8," +
      encodeURIComponent(this.fragmentShaderEditor.getValue());
    a.click();
  }
}
