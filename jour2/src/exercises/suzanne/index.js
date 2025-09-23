import * as THREE from 'three';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createScene } from '../../utils/scene.js';

let gui;

export function initSuzanneExercise() {
    const { scene, start, cleanup } = createScene({
        cameraPosition: new THREE.Vector3(0, 0, 4),
        enableOrbitControls: true
    });

    const textureLoader = new THREE.TextureLoader();
    const textureA = textureLoader.load('/assets/textures/a.jpg');
    const textureB = textureLoader.load('/assets/textures/b.jpg');

    const uniforms = {
        uThreshold: { value: 0.5 },
        uTwist: { value: 0.0 },
        uDispAmp: { value: 0.0 },
        uTime: { value: 0 },
        uUseTextures: { value: false },
        uColorA: { value: new THREE.Color(0x00ffff) },
        uColorB: { value: new THREE.Color(0xff00ff) },
        uMapA: { value: textureA },
        uMapB: { value: textureB }
    };

    let suzanne;
    let customMaterial;

    const loader = new GLTFLoader();

    function createFallbackGeometry() {
        return new THREE.TorusKnotGeometry(0.8, 0.3, 128, 32);
    }

    function setupModel(geometry) {
        customMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.3,
            roughness: 0.5
        });

        // FIXED SIMPLIFIED APPROACH
        customMaterial.onBeforeCompile = (shader) => {
            // STEP 1: Add uniforms
            Object.keys(uniforms).forEach(key => {
                shader.uniforms[key] = uniforms[key];
            });

            // ======================================
            // VERTEX SHADER
            // ======================================
            // Add declarations before main()
            shader.vertexShader = shader.vertexShader.replace(
                'void main() {',
                `
                // === CUSTOM VERTEX DECLARATIONS ===
                uniform float uTwist;
                uniform float uDispAmp;
                uniform float uTime;
                varying vec2 vCustomUv;

                // Simple noise function
                float hash(vec3 p) {
                    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
                }

                // 2D rotation
                mat2 rotate2D(float angle) {
                    float s = sin(angle);
                    float c = cos(angle);
                    return mat2(c, -s, s, c);
                }

                void main() {`
            );

            // STEP 3: VERTEX SHADER - Use begin_vertex include replacement
            // This is more reliable than replacing the exact string
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                // Pass UV to fragment shader
                vCustomUv = uv;

                // Start with original position
                vec3 transformed = vec3( position );

                // === APPLY DEFORMATIONS ===
                // TODO: Twist around Y axis

                // TODO: Displacement with noise, using hash function and uDispAmp
                `
            );

             // ======================================
            // FRAGMENT SHADER
            // ======================================
            // Add declarations before main()
            shader.fragmentShader = shader.fragmentShader.replace(
                'void main() {',
                `
                // === CUSTOM FRAGMENT DECLARATIONS ===
                uniform float uThreshold;
                uniform bool uUseTextures;
                uniform vec3 uColorA;
                uniform vec3 uColorB;
                uniform sampler2D uMapA;
                uniform sampler2D uMapB;
                varying vec2 vCustomUv;

                void main() {`
            );

            // STEP 5: FRAGMENT SHADER - Override after map_fragment
            // This ensures our colors aren't overwritten by Three.js texture mapping
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <map_fragment>',
                `
                #include <map_fragment>

                // === APPLY CUSTOM COLORS ===
                vec3 colorA = uUseTextures ? texture2D(uMapA, vCustomUv).rgb : uColorA;
                vec3 colorB = uUseTextures ? texture2D(uMapB, vCustomUv).rgb : uColorB;

                // TODO: Create smooth transition between colorA and colorB using uThreshold
                `
            );
        };

        suzanne = new THREE.Mesh(geometry, customMaterial);
        suzanne.castShadow = true;
        suzanne.receiveShadow = true;
        scene.add(suzanne);

        setupGUI();
        startAnimation();
    }

    loader.load(
        '/assets/models/suzanne.glb',
        (gltf) => {
            const model = gltf.scene.children[0];
            if (model && model.geometry) {
                setupModel(model.geometry);
            } else {
                console.warn('Suzanne model not found, using fallback geometry');
                setupModel(createFallbackGeometry());
            }
        },
        (progress) => {
            console.log('Loading model...', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
            console.warn('Failed to load model, using fallback geometry', error);
            setupModel(createFallbackGeometry());
        }
    );

    const params = {
        threshold: 0.5,
        twist: 0.0,
        dispAmp: 0.0,
        useTextures: false,
        colorA: '#00ffff',
        colorB: '#ff00ff',
        autoRotate: true,
        reset: () => {
            params.threshold = 0.5;
            params.twist = 0.0;
            params.dispAmp = 0.0;
            params.useTextures = false;
            params.autoRotate = true;
            if (gui) gui.controllers.forEach(c => c.updateDisplay());
        }
    };

    function setupGUI() {
        gui = new GUI();

        const shaderFolder = gui.addFolder('Shader Parameters');
        shaderFolder.add(params, 'threshold', 0, 1, 0.01).onChange(value => {
            uniforms.uThreshold.value = value;
        });
        shaderFolder.add(params, 'twist', -1, 1, 0.01).onChange(value => {
            uniforms.uTwist.value = value;
        });
        shaderFolder.add(params, 'dispAmp', 0, 0.3, 0.01).onChange(value => {
            uniforms.uDispAmp.value = value;
        });
        shaderFolder.open();

        const textureFolder = gui.addFolder('Texture/Color');
        textureFolder.add(params, 'useTextures').name('Use Textures').onChange(value => {
            uniforms.uUseTextures.value = value;
        });
        textureFolder.addColor(params, 'colorA').onChange(value => {
            uniforms.uColorA.value.set(value);
        });
        textureFolder.addColor(params, 'colorB').onChange(value => {
            uniforms.uColorB.value.set(value);
        });
        textureFolder.open();

        const animFolder = gui.addFolder('Animation');
        animFolder.add(params, 'autoRotate');
    }

    function startAnimation() {
        start((elapsedTime) => {
            uniforms.uTime.value = elapsedTime;
            if (suzanne && params.autoRotate) {
                suzanne.rotation.y = elapsedTime * 0.2;
            }
        });
    }

    return {
        cleanup: () => {
            cleanup();
            if (gui) gui.destroy();
        }
    };
}

export function disposeSuzanneExercise() {
    if (gui) {
        gui.destroy();
        gui = null;
    }
}