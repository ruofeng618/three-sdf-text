//@ts-nocheck
import * as THREE from 'three';
import {SdfText} from "./SdfText"
import {OrbitControls} from "three/addons/controls/OrbitControls";
import * as dat from 'dat.gui';

let container;
let camera, scene, renderer,controls;
const gui = new dat.GUI();
let mesh,sdf;
const textFeatures=[
  {text:'5CM',position:[0,10]},
  {text:'6CM',position:[20,20]},
  {text:'7CM',position:[0,30]},
  {text:'8CM',position:[-40,40]},
]
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext("2d");
init();
animate();

function init() {

  container = document.getElementById( 'container' );

  //

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 200);
  camera.position.z = 80;
  sdf=new SdfText({textFeatures:textFeatures});
  const textFolder = gui.addFolder('font');
  textFolder.add(sdf, 'fontFamily', [
    'Monaco, monospace',
    'sans-serif',
  ]).onChange(() => {

  });
  textFolder.add(sdf, 'fontWeight', 400, 1000).onChange(() => {
  });
  textFolder.add(sdf, 'fontSize', 8, 128).onChange(() => {

  });
  textFolder.addColor(sdf, 'fontColor').onChange(() => {

  });
  textFolder.add(sdf, 'fontOpacity', 0, 1, 0.1).onChange(() => {

  });
  textFolder.addColor(sdf, 'haloColor').onChange(() => {

  });
  textFolder.add(sdf, 'haloWidth', 0, 24, 0.1).onChange(() => {

  });
  textFolder.add(sdf, 'haloBlur', 0, 2, 0.1).onChange(() => {

  });

  const layoutFolder = gui.addFolder('label layout');
  layoutFolder.add(sdf, 'symbolAnchor', [ 'center', 'left', 'right', 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right' ]).onChange(() => {

  });
  layoutFolder.add(sdf, 'textSpacing', 0, 10, 0.1).onChange(() => {

  });
  layoutFolder.add(sdf, 'textOffsetX', -20, 20, 0.1).onChange(() => {

  });
  layoutFolder.add(sdf, 'textOffsetY', -20, 20, 0.1).onChange(() => {

  });
  const {glyphAtlas}=sdf;
  const {data,width,height}=glyphAtlas.image;
  let pixels = [].slice.call(data);
  let imageData=new Array(width*height*4);
  for (let i = 0; i < pixels.length; i++) {
    imageData[4 * i + 0] = pixels[i];
    imageData[4 * i + 1] = pixels[i];
    imageData[4 * i + 2] = pixels[i];
    imageData[4 * i + 3] = 255;
    
  }
  const image = new ImageData(new Uint8ClampedArray(imageData),width,height);
  ctx.putImageData(image, 0, 0);
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0,0,0 );
  // scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );

  //
  scene.add(sdf)
  scene.add( new THREE.AmbientLight( 0x444444 ) );

  const light1 = new THREE.DirectionalLight( 0xffffff, 0.5 );
  light1.position.set( 1, 1, 1 );
  scene.add( light1 );
 

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.outputEncoding = THREE.sRGBEncoding;
  const geometry1 = new THREE.PlaneGeometry( 100, 100 );
  const material1 = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide,wireframe:true} );
  const plane = new THREE.Mesh( geometry1, material1 );
  scene.add( plane );
  container.appendChild( renderer.domElement );

  //

  //
  controls = new OrbitControls( camera, renderer.domElement );
  controls.update();
  window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

  requestAnimationFrame( animate );

  render();

}

function render() {

  const time = Date.now() * 0.001;
  controls.update(); 
  renderer.render( scene, camera );

}
