import * as THREE from 'three';
import GUI from 'lil-gui';
import { createScene } from '../../utils/scene.js';

let gui;

export function initSphereExercise() {
    const { scene, start, cleanup } = createScene({
        cameraPosition: new THREE.Vector3(0, 0, 4),
        enableOrbitControls: true
    });

    const uniforms = {
        uTime: { value: 0 },
        uNoiseScale: { value: 3.0 },
        uNoiseSpeed: { value: 0.2 },
        uNoiseAmplitude: { value: 0.15 },
        uColorA: { value: new THREE.Color(0x6366f1) },
        uColorB: { value: new THREE.Color(0xec4899) }
    };

    const sphereGeometry = new THREE.SphereGeometry(1, 256, 128);

    // Create MeshPhysicalMaterial with PBR properties
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.3,
        roughness: 0.4,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1
    });

    // SIMPLIFIED APPROACH - Only 4 replacements total!
    material.onBeforeCompile = (shader) => {
        // Add uniforms to the shader
        Object.keys(uniforms).forEach(key => {
            shader.uniforms[key] = uniforms[key];
        });

        // ======================================
        // VERTEX SHADER - Only 2 replacements!
        // ======================================

        // 1. Add declarations before main()
        shader.vertexShader = shader.vertexShader.replace(
            'void main() {',
            `
            // === CUSTOM UNIFORMS & FUNCTIONS ===
            uniform float uTime;
            uniform float uNoiseScale;
            uniform float uNoiseSpeed;
            uniform float uNoiseAmplitude;

            varying float vNoise;
            varying vec3 vCustomViewPosition;

            //	Simplex 3D Noise by Ian McEwan, Ashima Arts
            vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
            vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

            float snoise(vec3 v){
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

                vec3 i = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);

                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);

                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + 2.0 * C.xxx;
                vec3 x3 = x0 - D.yyy;

                i = mod(i, 289.0);
                vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;

                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);

                vec4 x = x_ * ns.x + ns.yyyy;
                vec4 y = y_ * ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);

                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);

                vec4 s0 = floor(b0) * 2.0 + 1.0;
                vec4 s1 = floor(b1) * 2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));

                vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);

                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;

                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }

            void main() {`
        );

        // 2. Apply deformations at begin_vertex
        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            // === APPLY VERTEX DEFORMATIONS ===
            vec3 transformed = vec3(position);

            // TODO: Calculate noise

						// TODO: Apply to transformed position
            `
        );

        // ======================================
        // FRAGMENT SHADER - Only 2 replacements!
        // ======================================

        // 3. Add declarations before main()
        shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {',
            `
            // === CUSTOM UNIFORMS & VARYINGS ===
            uniform vec3 uColorA;
            uniform vec3 uColorB;

            varying float vNoise;
            varying vec3 vCustomViewPosition;

            void main() {`
        );

        // 4. Apply custom colors and effects
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <color_fragment>',
            `
            #include <color_fragment>

            // === APPLY CUSTOM COLORS & EFFECTS ===
            // TODO: Mix colors based on noise and apply on diffuseColor.rgb
            `
        );

        console.log('✅ Simplified sphere shader complete! Only 4 replacements used.');
    };

    const sphere = new THREE.Mesh(sphereGeometry, material);
    sphere.receiveShadow = true;
    scene.add(sphere);

    // GUI Controls
    const params = {
        noiseScale: 3.0,
        noiseSpeed: 0.2,
        noiseAmplitude: 0.15,
        colorA: '#6366f1',
        colorB: '#ec4899',
        metalness: 0.3,
        roughness: 0.4,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1,
        autoRotate: true
    };

    gui = new GUI();

    // Noise controls
    const noiseFolder = gui.addFolder('🌊 Noise Parameters');
    noiseFolder.add(params, 'noiseScale', 0.5, 10).onChange(value => {
        uniforms.uNoiseScale.value = value;
    });
    noiseFolder.add(params, 'noiseSpeed', 0, 1).onChange(value => {
        uniforms.uNoiseSpeed.value = value;
    });
    noiseFolder.add(params, 'noiseAmplitude', 0, 0.5).onChange(value => {
        uniforms.uNoiseAmplitude.value = value;
    });
    noiseFolder.open();

    // Color controls
    const colorFolder = gui.addFolder('🎨 Colors');
    colorFolder.addColor(params, 'colorA').onChange(value => {
        uniforms.uColorA.value.set(value);
    });
    colorFolder.addColor(params, 'colorB').onChange(value => {
        uniforms.uColorB.value.set(value);
    });
    colorFolder.open();

    // Material PBR properties
    const materialFolder = gui.addFolder('✨ Material PBR');
    materialFolder.add(params, 'metalness', 0, 1).onChange(value => {
        material.metalness = value;
    });
    materialFolder.add(params, 'roughness', 0, 1).onChange(value => {
        material.roughness = value;
    });
    materialFolder.add(params, 'clearcoat', 0, 1).onChange(value => {
        material.clearcoat = value;
    });
    materialFolder.add(params, 'clearcoatRoughness', 0, 1).onChange(value => {
        material.clearcoatRoughness = value;
    });
    materialFolder.open();

    // Animation control
    gui.add(params, 'autoRotate');

    start((elapsedTime) => {
        uniforms.uTime.value = elapsedTime;

        if (params.autoRotate) {
            sphere.rotation.y = elapsedTime * 0.1;
        }
    });

    return {
        cleanup: () => {
            cleanup();
            if (gui) gui.destroy();
        }
    };
}

export function disposeSphereExercise() {
    if (gui) {
        gui.destroy();
        gui = null;
    }
}