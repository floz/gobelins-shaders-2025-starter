import './styles/main.css';
import { Renderer, Mesh, Triangle, Program } from 'ogl';
import { ShaderExerciseManager } from './core/ShaderExerciseManager.js';
import { GuiBinder } from './core/GuiBinder.js';
import { exercises } from './exercises/manifest.js';

// Vertex shader commun pour fullscreen triangle
const vertexShader = /* glsl */ `
  attribute vec2 position;
  varying vec2 vUv;
  
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

class App {
  constructor() {
    this.canvas = null;
    this.renderer = null;
    this.gl = null;
    this.mesh = null;
    this.manager = null;
    this.guiBinder = null;
    this.currentExercise = null;
    this.startTime = performance.now();
    this.lastTime = this.startTime;
    this.sidebarWidth = 360; // Default sidebar width from CSS
  }

  getCanvasDimensions() {
    // Check if mobile view (matches CSS media query)
    if (window.innerWidth <= 768) {
      return {
        width: window.innerWidth,
        height: window.innerHeight * 0.5 // 50vh on mobile
      };
    }
    return {
      width: window.innerWidth - this.sidebarWidth,
      height: window.innerHeight
    };
  }

  async init() {
    // Setup canvas
    this.canvas = document.getElementById('canvas');

    // Calculate canvas size accounting for sidebar
    const { width: canvasWidth, height: canvasHeight } = this.getCanvasDimensions();

    // Create renderer
    this.renderer = new Renderer({
      canvas: this.canvas,
      width: canvasWidth,
      height: canvasHeight,
      dpr: Math.min(window.devicePixelRatio, 2)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 1);

    // Create fullscreen triangle
    const geometry = new Triangle(this.gl);
    this.mesh = new Mesh(this.gl, { geometry });

    // Initialize managers
    this.manager = new ShaderExerciseManager(this.gl, vertexShader);
    this.guiBinder = new GuiBinder(document.getElementById('gui'));

    // Setup exercise selector
    this.setupExerciseSelector();

    // Load selected exercise or first one
    if (exercises.length > 0) {
      let selectedExercise;

      // Check URL parameters first
      const urlParams = new URLSearchParams(window.location.search);
      const exerciseId = urlParams.get('exercise');

      if (exerciseId) {
        // Try to find exercise by ID from URL
        selectedExercise = exercises.find(ex => ex.id === exerciseId);
      }

      // If not found in URL, look for one marked as selected in manifest
      if (!selectedExercise) {
        selectedExercise = exercises.find(ex => ex.selected);
      }

      // Default to first exercise if none selected
      if (!selectedExercise) {
        selectedExercise = exercises[0];
      }

      const selectedIndex = exercises.indexOf(selectedExercise);

      // Update selector to match
      const selector = document.getElementById('exercise-selector');
      if (selector) {
        selector.value = selectedIndex;
      }

      await this.loadExercise(selectedExercise);
    }

    // Setup resize handler
    this.setupResize();

    // Start render loop
    this.animate();
  }

  setupExerciseSelector() {
    const selector = document.getElementById('exercise-selector');
    
    // Clear and populate selector
    selector.innerHTML = '';
    
    exercises.forEach((exercise, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = exercise.name;
      selector.appendChild(option);
    });

    // Handle change
    selector.addEventListener('change', async (e) => {
      const index = parseInt(e.target.value);
      const exercise = exercises[index];

      // Update URL without reloading the page
      const url = new URL(window.location);
      url.searchParams.set('exercise', exercise.id);
      window.history.pushState({}, '', url);

      await this.loadExercise(exercise);
    });
  }

  async loadExercise(exercise) {
    try {
      // Load exercise
      const result = await this.manager.loadExercise(exercise);
      this.currentExercise = result;

      // Update mesh program
      this.mesh.program = result.program;

      // Update resolution uniform (always present as built-in)
      result.uniforms.u_resolution.value = [
        this.renderer.width,
        this.renderer.height
      ];

      // Bind GUI
      this.guiBinder.bindExercise(exercise, result.uniforms, {
        onChange: () => this.render(),
        onReset: () => {
          this.manager.reset();
          this.guiBinder.updateValues(result.uniforms, exercise.uniforms);
          this.render();
        }
      });

      // Update info display
      const infoEl = document.getElementById('exercise-info');
      if (infoEl) {
        infoEl.textContent = exercise.description || exercise.name;
      }

    } catch (error) {
      console.error('Error loading exercise:', error);
    }
  }

  setupResize() {
    const resize = () => {
      // Account for sidebar width (and mobile responsiveness)
      const { width, height } = this.getCanvasDimensions();

      this.renderer.setSize(width, height);

      // Update resolution uniform (always present as built-in)
      if (this.currentExercise?.uniforms) {
        this.manager.resize(this.renderer.width, this.renderer.height);
      }

      this.render();
    };

    window.addEventListener('resize', resize);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) * 0.001; // Convert to seconds
    this.lastTime = currentTime;

    // Update time uniform
    this.manager.update(deltaTime);

    // Render
    this.render();
  };

  render() {
    this.renderer.render({ scene: this.mesh });
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
  });
} else {
  const app = new App();
  app.init();
}