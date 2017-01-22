(function(global) {

  /*
  * Constants and Main
  * www.programmingtil.com
  * www.codenameparkerllc.com
  */
  var state = {
    gl: null,
    program: null,
    ui: {
      pressedKeys: {},
    },
    animation: {
    },
    app: {
      eye: {
        x:0.20,
        y:0.25,
        z:0.25,
      },
    },
  };

  var DEFAULT_VERT = [
     0.0,  0.5, -4, 1, Math.random(),Math.random(),Math.random(),1,
    -0.5, -0.5, -4, 1, Math.random(),Math.random(),Math.random(),1,
     0.5, -0.5, -4, 1, Math.random(),Math.random(),Math.random(),1,

     // Red triangle
     0.5,  0.4, -2, 1, 1,0,0,1,
    -0.5,  0.4, -2, 1, 1,0,0,1,
     0.0, -0.6, -2, 1, 1,0,0,1,

     // Green triangle
     0.0,  0.5, -1., 1, 0,1,0,1,
    -0.5, -0.5, -1., 1, 0,1,0,1,
     0.5, -0.5, -1., 1, 0,1,0,1,
  ];

  glUtils.SL.init({ callback:function() { main(); } });

  function main() {
    state.canvas = document.getElementById("glcanvas");
    state.gl = glUtils.checkWebGL(state.canvas);
    initCallbacks();
    initShaders();
    initGL();
    animate();
  }

  /*
  * Initialization
  * www.programmingtil.com
  * www.codenameparkerllc.com
  */
  function initCallbacks() {
    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
  }

  function initShaders() {
    var vertexShader = glUtils.getShader(state.gl, state.gl.VERTEX_SHADER, glUtils.SL.Shaders.v1.vertex),
      fragmentShader = glUtils.getShader(state.gl, state.gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v1.fragment);
    state.program = glUtils.createProgram(state.gl, vertexShader, fragmentShader);
  }

  function initGL() {
    state.gl.clearColor(0,0,0,1);
  }

  /*
  * Rendering / Drawing / Animation
  * www.programmingtil.com
  * www.codenameparkerllc.com
  */
  function animate() {
    state.animation.tick = function() {
      updateState();
      draw();
      requestAnimationFrame(state.animation.tick);
    };
    state.animation.tick();
  }

  function updateState() {
    if (state.ui.pressedKeys[37]) {
      // left
      state.app.eye.x += 0.01;
    } else if (state.ui.pressedKeys[39]) {
      // right
      state.app.eye.x -= 0.01;
    } else if (state.ui.pressedKeys[40]) {
      // down
      state.app.eye.z -= 0.01;
    } else if (state.ui.pressedKeys[38]) {
      // up
      state.app.eye.z += 0.01;
    }
  }

  function draw(args) {
    var p = (args && args.p) ? args.p : DEFAULT_VERT;
    var uModelViewMatrix = state.gl.getUniformLocation(state.program, 'uModelViewMatrix');
    var uProjectionMatrix = state.gl.getUniformLocation(state.program, 'uProjectionMatrix');

    state.gl.useProgram(state.program);
    state.gl.clear(state.gl.COLOR_BUFFER_BIT);

    var n = initVertexBuffers(p).n;
    var mvm = mat4.create();
    var pm = mat4.create();

    // ModelView matrix
    mvm = mat4.lookAt(mvm,
      vec3.fromValues(state.app.eye.x,state.app.eye.y,state.app.eye.z),
      vec3.fromValues(0,0,0),
      vec3.fromValues(0,1,0)
    );
    // mvm = mat4.rotateX(mvm,mvm,-10);

    // Projection matrix- using the perspective "Box" view
    // mat4.perspective = function (out, fovy, aspect, near, far)
    // * @param {number} fovy Vertical field of view in radians
    // * @param {number} aspect Aspect ratio. typically viewport width/height
    // * @param {number} near Near bound of the frustum
    // * @param {number} far Far bound of the frustum
    var fovy = 90.0;
    var aspect = state.canvas.width/state.canvas.height;
    var near = 0.0;
    var far = 10;
    pm = mat4.perspective(pm,
      fovy,
      aspect,
      near,
      far
    );

    state.gl.uniformMatrix4fv(uModelViewMatrix, false, mvm);
    state.gl.uniformMatrix4fv(uProjectionMatrix, false, pm);
    state.gl.drawArrays(state.gl.TRIANGLES, 0, n);
  }

  function initVertexBuffers(p) {
    var vertices = new Float32Array(p);
    vertices.stride = 8;
    vertices.attributes = [
      {name:'aPosition', size:3, offset:0},
      {name:'aColor',    size:3, offset:4},
    ];
    vertices.n = vertices.length/vertices.stride;
    state.program.renderBuffers(vertices);
    return vertices;
  }

  /*
  * UI Events
  * www.programmingtil.com
  * www.codenameparkerllc.com
  */
  function keyDown(event) {
    state.ui.pressedKeys[event.keyCode] = true;
  }

  function keyUp(event) {
    state.ui.pressedKeys[event.keyCode] = false;
  }
})(window || this);
