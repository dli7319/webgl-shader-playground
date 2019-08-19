(function() {
  let vertexShader = null;
  let fragmentShader = null;
  let texture = null;
  let previewScene = null;
  let shader = null;
  let texturePath = 'valentinmalinov_wolf.jpg';
  let webGLVersion = 1;
  const resourcesUrl = window.resourcesUrl || "";

  loadShaders();
  loadTexture();
  setListeners();

  function updateResolution() {
    const widthElement = document.getElementById("widthInput");
    const heightElement = document.getElementById("heightInput");
    if (previewScene != null && widthElement != null && heightElement != null) {
      const width = widthElement.value;
      const height = heightElement.value;
      previewScene.updateResolution(width, height);
    }
  }

  function loadShaders() {
    fetch(resourcesUrl + "vertex_shader.vert")
      .then(response => response.text())
      .then(data => {
        vertexShader = data;
        startScene();
      });
    fetch(resourcesUrl + "fragment_shader.frag")
      .then(response => response.text())
      .then(data => {
        fragmentShader = data;
        const textArea = document.getElementById("fragmentShaderTextArea");
        if (textArea != null) {
          textArea.value = data;
        }
        startScene();
      });
  }

  function loadTexture() {
    var loader = new THREE.TextureLoader();
    loader.load(
      resourcesUrl + texturePath,
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

  function updateShader() {
    window.tempA  = previewScene;
    const textArea = document.getElementById("fragmentShaderTextArea");
    if (textArea != null) {
      let fragmentShader = textArea.value;
      if (previewScene != null && previewScene.material != null) {
        previewScene.material.fragmentShader = fragmentShader;
        previewScene.material.needsUpdate = true;
      }
    }
    if (!previewScene.active) {
      previewScene.animate();
    }
  }

  function setListeners() {
    const updateResolutionButton = document.getElementById("updateResolutionButton");
    updateResolutionButton.onclick = updateResolution;
    const updateShaderButton = document.getElementById("updateShaderButton");
    updateShaderButton.onclick = updateShader;
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
