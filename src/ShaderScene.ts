import * as THREE from "three";

// Generates a new THREE.js renderer and scene for 2D shaders
// Options should include a canvas, uniforms, vertexShader, and fragmentShader
export class ShaderScene {
  scene: any;
  camera: any;
  renderer: any;
  active: boolean;
  getScreenshotResolve: any;
  material: any;
  webGLVersion = 1;
  canvas: HTMLCanvasElement;
  uniforms: any;
  vertexShader: string;
  fragmentShader: string;
  screenshotType: string;

  constructor(options: any) {
    this.active = options.active == null ? true : options.active;
    this.webGLVersion = options.webGLVersion || 1;
    this.canvas = options.canvas;
    this.uniforms = options.uniforms || options.shader.uniforms;
    this.vertexShader = options.vertexShader || options.shader.vertexShader;
    this.fragmentShader =
      options.fragmentShader || options.shader.fragmentShader;
    this._init();
  }

  _init() {
    // Copied from Ruofei Du
    const scope = this;
    this.scene = new THREE.Scene();
    const SCREEN_WIDTH = this.canvas.width,
      SCREEN_HEIGHT = this.canvas.height;
    const VIEW_ANGLE = 45; //Camera frustum vertical field of view, from bottom to top of view, in degrees.
    const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
    const NEAR = 0.1,
      FAR = 20000;

    this.camera = new THREE.OrthographicCamera(
      SCREEN_WIDTH / -4, // Left
      SCREEN_WIDTH / 4, // Right
      SCREEN_HEIGHT / 4, // Top
      SCREEN_HEIGHT / -4, // Bottom
      -5000, // Near
      10000
    ); // Far -- enough to see the skybox
    this.camera.up = new THREE.Vector3(0, 0, -1);
    this.camera.lookAt(new THREE.Vector3(0, -1, 0));
    this.scene.add(this.camera);

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      side: THREE.DoubleSide
    });

    const floorGeometry = new THREE.PlaneBufferGeometry(
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2,
      1,
      1
    );
    const floor = new THREE.Mesh(floorGeometry, this.material);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    const context =
      this.webGLVersion === 2
        ? this.canvas.getContext("webgl2")
        : this.canvas.getContext("webgl");
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      context: context,
      antialias: true
    });
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT, false);

    setTimeout(function() {
      scope.animate();
    });
  }

  animate() {
    const scope = this;
    if (this.active) {
      requestAnimationFrame(() => {
        scope.animate();
      });
    }
    this.renderer.render(this.scene, this.camera);

    if (typeof this.getScreenshotResolve == "function") {
      let savedImageData = "";
      if (this.screenshotType == "png") {
        savedImageData = this.renderer.domElement.toDataURL("image/png");
      } else if (
        this.screenshotType == "jpg" ||
        this.screenshotType == "jpeg"
      ) {
        savedImageData = this.renderer.domElement.toDataURL("image/jpeg", 1.0);
      } else if (this.screenshotType == "webp") {
        savedImageData = this.renderer.domElement.toDataURL("image/webp", 1.0);
      } else {
        console.error("Unknown screenshot type: " + this.screenshotType);
      }

      this.getScreenshotResolve(savedImageData);
      this.getScreenshotResolve = null;
    }
  }

  updateShader(options: any) {
    this.uniforms = options.uniforms || options.shader.uniforms;
    this.vertexShader = options.vertexShader || options.shader.vertexShader;
    this.fragmentShader =
      options.fragmentShader || options.shader.fragmentShader;
    this.material.uniforms = this.uniforms;
    this.material.vertexShader = this.vertexShader;
    this.material.fragmentShader = this.fragmentShader;
    this.material.needsUpdate = true;
    if (this.active) {
      this.animate();
    }
  }

  updateResolution(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this._init();
  }

  getScreenshot(screenshotType = "png") {
    this.screenshotType = screenshotType;
    return new Promise<string>(resolve => {
      this.getScreenshotResolve = resolve;
      this.animate();
    });
  }
}
