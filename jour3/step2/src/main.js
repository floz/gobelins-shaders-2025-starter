import * as THREE from 'three';
import GUI from 'lil-gui';
import gsap from 'gsap';
import { createScene } from './utils/scene.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { initializeShaderChunks } from './utils/shaderChunks.js';

import groundVertexShader from './shaders/ground/vertex.glsl';
import groundFragmentShader from './shaders/ground/fragment.glsl';
import suzanneVertexShader from './shaders/suzanne/vertex.glsl';
import suzanneFragmentShader from './shaders/suzanne/fragment.glsl';

// Initialize shader chunks - wink wink Sam 
initializeShaderChunks();

const params = {
    progress: 0,
    groundProgress: 0,
    suzanneProgress: 0,
    noiseScale: 2.5,
    noiseSpeed: 0.3,
    displacementScale: 2,
    skyBrightness: 0.7
};

const { scene, camera, start } = createScene({
    cameraPosition: new THREE.Vector3(2, 1, 6),
    clearColor: 0x0a0a0a,
    enableOrbitControls: true
});

camera.lookAt(0, 0, 0);

const textureLoader = new THREE.TextureLoader();
const maskTexture = textureLoader.load('/textures/mask.jpg');
maskTexture.wrapS = maskTexture.wrapT = THREE.RepeatWrapping;

// Textures pour le ground
const vegetalTexture = textureLoader.load('/textures/vegetal_floor.jpg');
vegetalTexture.wrapS = vegetalTexture.wrapT = THREE.RepeatWrapping;
vegetalTexture.repeat.set(8, 8);

const levelTexture = textureLoader.load('/textures/level.jpg');
levelTexture.wrapS = levelTexture.wrapT = THREE.RepeatWrapping;

const groundGeometry = new THREE.PlaneGeometry(15, 15, 15, 15);
// Apply rotation to the ground geometry using applyMatrix
const rotationMatrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
groundGeometry.applyMatrix4(rotationMatrix);


const groundMaterial = new THREE.ShaderMaterial({
    vertexShader: groundVertexShader,
    fragmentShader: groundFragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uMask: { value: maskTexture },
        uVegetalTexture: { value: vegetalTexture },
        uLevelTexture: { value: levelTexture },
        uNoiseScale: { value: params.noiseScale },
        uNoiseSpeed: { value: params.noiseSpeed },
        uColor1: { value: new THREE.Color(0xff4444) }, // Vert comme dans la ref
        uColor2: { value: new THREE.Color(0xf4de24) },
        uDisplacementScale: { value: params.displacementScale}
    },
    transparent: true,
    side: THREE.DoubleSide,
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.position.y = -1;
scene.add(ground);

const loader = new GLTFLoader();
let suzanne = null;
let suzanneMaterial = null;
let suzanneBBox = null;

loader.load(
    './models/suzanne.glb',
    (gltf) => {
        const originalMesh = gltf.scene.children[0];
        const geometry = originalMesh.geometry;

        suzanneBBox = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);

        suzanneMaterial = new THREE.ShaderMaterial({
            vertexShader: suzanneVertexShader,
            fragmentShader: suzanneFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uProgress: { value: 0 },
                uMask: { value: maskTexture },
                uMinY: { value: suzanneBBox.min.y },
                uMaxY: { value: suzanneBBox.max.y },
                uColor1: { value: new THREE.Color(0xff4444) },
                uColor2: { value: new THREE.Color(0x4444ff) },
                uNoiseScale: { value: params.noiseScale }
            },
            transparent: true,
            side: THREE.DoubleSide
        });

        suzanne = new THREE.Mesh(geometry, suzanneMaterial);
        suzanne.scale.setScalar(0.8);
        scene.add(suzanne);

        // Tween global progress from 0 to 1 over 3 seconds
        gsap.to(params, {
            progress: 1,
            duration: 3,
            onUpdate: () => {
                params.groundProgress = params.progress;
                params.suzanneProgress = params.progress;
            }
        })
    }
);

const gui = new GUI();

const animationFolder = gui.addFolder('Animation');
animationFolder.add(params, 'progress', 0, 1, 0.01).name('Global Progress').onChange((value) => {
    params.groundProgress = value;
    params.suzanneProgress = value;
    params.skyProgress = value;
});
animationFolder.add(params, 'groundProgress', 0, 1, 0.01).name('Ground Progress');
animationFolder.add(params, 'suzanneProgress', 0, 1, 0.01).name('Suzanne Progress');

const noiseFolder = gui.addFolder('Noise');
noiseFolder.add(params, 'noiseScale', 0.5, 5, 0.1).name('Noise Scale');
noiseFolder.add(params, 'noiseSpeed', 0, 1, 0.01).name('Noise Speed');
noiseFolder.add(params, 'displacementScale', 0, 5, 0.01).name('Displacement');

const skyFolder = gui.addFolder('Sky');
skyFolder.add(params, 'skyBrightness', 0, 1.2, 0.01).name('Brightness');

animationFolder.open();

start((elapsedTime) => {
    groundMaterial.uniforms.uTime.value = elapsedTime;
    groundMaterial.uniforms.uProgress.value = params.groundProgress;
    groundMaterial.uniforms.uNoiseScale.value = params.noiseScale;
    groundMaterial.uniforms.uNoiseSpeed.value = params.noiseSpeed;
    groundMaterial.uniforms.uDisplacementScale.value = params.displacementScale;

    if (suzanneMaterial) {
        suzanneMaterial.uniforms.uTime.value = elapsedTime;
        suzanneMaterial.uniforms.uProgress.value = params.suzanneProgress;
        suzanneMaterial.uniforms.uNoiseScale.value = params.noiseScale;
    }
});