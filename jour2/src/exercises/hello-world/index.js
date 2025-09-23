import * as THREE from 'three';
import GUI from 'lil-gui';
import { createScene } from '../../utils/scene.js';
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

let gui;

export function initHelloWorldExercise() {
    const { scene, start, cleanup } = createScene({
        cameraPosition: new THREE.Vector3(0, 0, 3),
        enableOrbitControls: true
    });

    const uniforms = {
        uTime: { value: 0 },
        // TODO: Add uniforms for noise control
        // uNoiseScale: { value: ??? },
        // uNoiseSpeed: { value: ??? },
        // uNoiseAmplitude: { value: ??? },
        uColorA: { value: new THREE.Color(0x6366f1) },
        uColorB: { value: new THREE.Color(0xec4899) }
    };

    const sphereGeometry = new THREE.SphereGeometry(1, 128, 64);

    const shaderMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms
    });

    const sphere = new THREE.Mesh(sphereGeometry, shaderMaterial);
    scene.add(sphere);

    // TODO: Add GUI controls for noise parameters
    const params = {
        colorA: '#6366f1',
        colorB: '#ec4899'
    };

    //

    gui = new GUI();

    const colorFolder = gui.addFolder('Colors');
    colorFolder.addColor(params, 'colorA').onChange(value => {
        uniforms.uColorA.value.set(value);
    });
    colorFolder.addColor(params, 'colorB').onChange(value => {
        uniforms.uColorB.value.set(value);
    });
    colorFolder.open();

    start((elapsedTime) => {
        uniforms.uTime.value = elapsedTime;
    });

    return {
        cleanup: () => {
            cleanup();
            if (gui) gui.destroy();
        }
    };
}

export function disposeHelloWorldExercise() {
    if (gui) {
        gui.destroy();
        gui = null;
    }
}