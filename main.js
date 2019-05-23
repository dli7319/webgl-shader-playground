(function() {
  let vertexShader = null;
  let fragmentShader = null;
  let texture = null;
  let previewScene = null;
  let shader = null;
  let texturePath = 'valentinmalinov_wolf.jpg';
  let webGLVersion = 1;

  loadShaders();
  loadTexture();

  function loadShaders() {
    fetch("vertex_shader.vert")
      .then(response => response.text())
      .then(data => {
        vertexShader = data;
        startScene();
      });
    fetch("fragment_shader.frag")
      .then(response => response.text())
      .then(data => {
        fragmentShader = data;
        startScene();
      });
  }

  function loadTexture() {
    var loader = new THREE.TextureLoader();
    loader.load(
      texturePath,
      // onLoad callback
      function(textureParam) {
        texture = textureParam;
        startScene();
      },
      // onProgress callback currently not supported
      undefined,
      // onError callback
      function(err) {
        console.error('An error happened.');
      }
    );
  }

  function startScene() {
    if (typeof vertexShader !== "string" || typeof fragmentShader !== "string" ||
      texture === null || !texture.isTexture) {
      return;
    }

    const mainCanvas = document.getElementById("mainCanvas");
    mainCanvas.width = 1920;
    mainCanvas.height = 1080;
    shader = {
      uniforms: {
        "tDiffuse": {
          value: texture
        },
        "opacity": {
          value: 1.0
        }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    };
    previewScene = new ShaderScene({
      shader: shader,
      canvas: mainCanvas,
      webGLVersion: webGLVersion
    });

    const screenshotButton = document.getElementById("screenshotButton");
    screenshotButton.onclick = takeScreenshot;
  }

  function takeScreenshot() {
    previewScene.getScreenshot()
    .then(screenshot => {
      var a = document.createElement('a');
      a.download = "screenshot.png";
      a.href = screenshot;
      a.click();
    });
  }

})();
