// Generates a new THREE.js renderer and scene for 2D shaders
// Options should include a canvas, uniforms, vertexShader, and fragmentShader
function ShaderScene(options) {
  const scope = this;
  this.scene = null;
  this.camera = null;
  this.renderer = null;
  this.active = options.active;
  this.getScreenshotResolve = null;
  this.material = null;
  this.webGLVersion = options.webGLVersion || 1;

  this.canvas = options.canvas;
  this.uniforms = options.uniforms || options.shader.uniforms;
  this.vertexShader = options.vertexShader || options.shader.vertexShader;
  this.fragmentShader = options.fragmentShader || options.shader.fragmentShader;

  this.init();
}
Object.assign(ShaderScene.prototype, {
  constructor: ShaderScene,
  init: function() {
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
      10000); // Far -- enough to see the skybox
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

    const floorGeometry = new THREE.PlaneBufferGeometry(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 1, 1);
    const floor = new THREE.Mesh(floorGeometry, this.material);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    const context = this.webGLVersion === 2 ? this.canvas.getContext("webgl2") : this.canvas.getContext("webgl");
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      context: context,
      antialias: true
    });
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT, false);

    setTimeout(function() {
      scope.animate();
    });
  },
  animate: function() {
    if (this.active) {
      requestAnimationFrame(this.animate);
    }
    this.renderer.render(this.scene, this.camera);

    if (typeof this.getScreenshotResolve == "function") {
      let savedImageData = this.renderer.domElement.toDataURL();
      this.getScreenshotResolve(savedImageData);
      this.getScreenshotResolve = null;
    }
  },
  updateShader: function(options) {
    this.uniforms = options.uniforms || options.shader.uniforms;
    this.vertexShader = options.vertexShader || options.shader.vertexShader;
    this.fragmentShader = options.fragmentShader || options.shader.fragmentShader;
    this.material.uniforms = this.uniforms;
    this.material.vertexShader = this.vertexShader;
    this.material.fragmentShader = this.fragmentShader;
    this.material.needsUpdate = true;
    if (this.active) {
      this.animate();
    }
  },
  getScreenshot: function() {
    return new Promise(resolve => {
      this.getScreenshotResolve = resolve;
      this.animate();
    });
  }
});
