import './style.css';
import { initHelloWorldExercise, disposeHelloWorldExercise } from './exercises/hello-world/index.js';
import { initSphereExercise, disposeSphereExercise } from './exercises/sphere/index.js';
import { initSuzanneExercise, disposeSuzanneExercise } from './exercises/suzanne/index.js';

let currentDispose = null;

const demos = {
    helloWorldExercise: {
        init: initHelloWorldExercise,
        dispose: disposeHelloWorldExercise
    },
    sphereExercise: {
        init: initSphereExercise,
        dispose: disposeSphereExercise
    },
    suzanneExercise: {
        init: initSuzanneExercise,
        dispose: disposeSuzanneExercise
    },
};

function switchDemo(demoName, updateUrl = true) {
    if (currentDispose) {
        currentDispose();
        currentDispose = null;
    }

    const demo = demos[demoName];
    if (demo) {
        const { cleanup } = demo.init();
        currentDispose = () => {
            cleanup();
            if (demo.dispose) demo.dispose();
        };

        document.querySelectorAll('#nav button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.demo === demoName);
        });

        // Update URL without reloading the page
        if (updateUrl) {
            const url = new URL(window.location);
            url.searchParams.set('exo', demoName);
            window.history.pushState({ demo: demoName }, '', url);
        }
    }
}

// Helper function to get demo from URL
function getDemoFromUrl() {
    const url = new URL(window.location);
    return url.searchParams.get('exo') || 'helloWorldExercise';
}

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('#nav button');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchDemo(btn.dataset.demo);
        });
    });

    // Load initial demo from URL params
    const currentDemo = getDemoFromUrl();
    switchDemo(currentDemo, false); // Don't update URL on initial load
});

// Handle browser back/forward navigation
window.addEventListener('popstate', (event) => {
    const demo = event.state?.demo || getDemoFromUrl();
    switchDemo(demo, false); // Don't update URL when navigating history
});