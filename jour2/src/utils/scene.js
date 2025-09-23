import * as THREE from 'three';

export function createScene(options = {}) {
    const {
        cameraPosition = new THREE.Vector3(0, 0, 4),
        clearColor = 0x000000,
        enableOrbitControls = false
    } = options;

    const canvas = document.getElementById('canvas');

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(clearColor);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );
    camera.position.copy(cameraPosition);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.far = 20;
    directionalLight.shadow.camera.left = -5;
    directionalLight.shadow.camera.right = 5;
    directionalLight.shadow.camera.top = 5;
    directionalLight.shadow.camera.bottom = -5;
    directionalLight.shadow.mapSize.set(2048, 2048);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    let controls = null;
    if (enableOrbitControls) {
        import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
            controls = new OrbitControls(camera, canvas);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.target.set(0, 0, 0);
        });
    }

    const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', handleResize);

    let animationId = null;
    const clock = new THREE.Clock();

    const animate = (onUpdate) => {
        const elapsedTime = clock.getElapsedTime();

        if (onUpdate) {
            onUpdate(elapsedTime);
        }

        if (controls) {
            controls.update();
        }

        renderer.render(scene, camera);
        animationId = requestAnimationFrame(() => animate(onUpdate));
    };

    const start = (onUpdate) => {
        animate(onUpdate);
    };

    const stop = () => {
        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    };

    const cleanup = () => {
        stop();
        window.removeEventListener('resize', handleResize);

        scene.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        renderer.dispose();
    };

    return {
        renderer,
        scene,
        camera,
        controls,
        directionalLight,
        ambientLight,
        start,
        stop,
        cleanup
    };
}