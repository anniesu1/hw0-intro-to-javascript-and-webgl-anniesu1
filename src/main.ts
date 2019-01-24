import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  shape: 'cube',
  tesselations: 5,
  'load scene': loadScene, // A function pointer, essentially
  red: 0,
  green: 255, 
  blue: 0,
  shader: 'lambert'
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let prevTesselations: number = 5;

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'shape', [ 'cube', 'sphere', 'square']);
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'load scene');
  gui.add(controls, 'red', 0, 255);
  gui.add(controls, 'green', 0, 255);
  gui.add(controls, 'blue', 0, 255);
  gui.add(controls, 'shader', [ 'lambert', 'gradient' ]);
  

  // Get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  // Initialize both lambert and custom shaders
  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const custom = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/custom-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/custom-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    if (controls.tesselations != prevTesselations) {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      icosphere.create();
    }

    // Pull colors from GUI controls and update u_Color of lambertian shader 
    let newColor = vec4.fromValues(controls.red / 255.0, controls.green / 255.0, 
                                   controls.blue / 255.0, 1);
    lambert.setGeometryColor(newColor);

    // Pull selected shader from GUI and set as selected
    let selectedShader: ShaderProgram;
    if (controls.shader == 'lambert') {
      selectedShader = lambert;
    }
    else if (controls.shader == 'gradient') {
      selectedShader = custom;
    }

    // Pull selected shape from GUI and render
    if (controls.shape == 'cube') {
      renderer.render(camera, selectedShader, [
        cube
      ]);
    }
    else if (controls.shape == 'sphere') {
      renderer.render(camera, selectedShader, [
        icosphere
      ]);
    }
    else if (controls.shape == 'square') {
      renderer.render(camera, selectedShader, [
        square,
      ]);
    }
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
