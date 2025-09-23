import { Program, Texture } from 'ogl';
import { ShaderPreprocessor } from './ShaderPreprocessor.js';

export class ShaderExerciseManager {
  constructor(gl, vertexSource) {
    this.gl = gl;
    this.vertexSource = vertexSource;
    this.current = null; // { program, uniforms, fragSource, def }
    this.preprocessor = new ShaderPreprocessor();
  }

  async loadExercise(def) {
    let fragSource;

    if (def.fragSource) {
      fragSource = def.fragSource;
    } else if (def.fragPath) {
      fragSource = await fetch(def.fragPath).then(r => r.text());
    } else {
      throw new Error('Exercise must have either fragSource or fragPath');
    }

    // Process shader includes
    fragSource = this.preprocessor.process(fragSource);

    const uniforms = this._buildUniforms(def.uniforms);

    // Add built-in uniforms (these are always present)
    uniforms.u_time = { value: 0 };
    uniforms.u_resolution = { value: [this.gl.canvas.width, this.gl.canvas.height] };

    const program = new Program(this.gl, {
      vertex: this.vertexSource,
      fragment: fragSource,
      uniforms
    });

    if (this.current?.program) {
      this.current.program.remove();
    }

    this.current = { program, uniforms, fragSource, def };
    return this.current;
  }

  update(dt) {
    if (!this.current) return;
    const u = this.current.uniforms;
    // u_time is now always present as a built-in uniform
    u.u_time.value += dt;
  }

  resize(width, height) {
    if (!this.current) return;
    const u = this.current.uniforms;
    // u_resolution is now always present as a built-in uniform
    u.u_resolution.value[0] = width;
    u.u_resolution.value[1] = height;
  }

  dispose() {
    if (this.current?.program) {
      this.current.program.remove();
      this.current = null;
    }
  }
  
  reset() {
    if (!this.current) return;

    const def = this.current.def;
    const uniforms = this.current.uniforms;

    // Reset u_time to 0 (built-in uniform)
    uniforms.u_time.value = 0;

    for (const [name, u] of Object.entries(def.uniforms || {})) {
      if (uniforms[name]) {
        switch (u.type) {
          case 'float':
            uniforms[name].value = Number(u.value ?? 0);
            break;
          case 'bool':
            uniforms[name].value = u.value ? 1.0 : 0.0;
            break;
          case 'select':
          case 'enum':
            uniforms[name].value = Number(u.value ?? 0);
            break;
          case 'color':
            // Reset color by replacing array values
            const defaultColor = u.value ?? [1,1,1];
            uniforms[name].value[0] = defaultColor[0];
            uniforms[name].value[1] = defaultColor[1];
            uniforms[name].value[2] = defaultColor[2];
            break;
          case 'vec2':
            const defaultVec2 = u.value ?? [0,0];
            uniforms[name].value[0] = defaultVec2[0];
            uniforms[name].value[1] = defaultVec2[1];
            break;
          case 'texture':
            break;
          default:
            uniforms[name].value = u.value;
        }
      }
    }
  }
  
  randomize() {
    if (!this.current) return;

    const def = this.current.def;
    const uniforms = this.current.uniforms;

    for (const [name, u] of Object.entries(def.uniforms || {})) {
      if (!u.gui || !uniforms[name]) continue;

      switch (u.type) {
        case 'float':
          const min = u.min ?? 0;
          const max = u.max ?? 1;
          uniforms[name].value = Math.random() * (max - min) + min;
          break;
        case 'bool':
          uniforms[name].value = Math.random() > 0.5 ? 1.0 : 0.0;
          break;
        case 'select':
        case 'enum':
          // Pick a random option
          const optionValues = u.options.map(opt =>
            opt.value !== undefined ? opt.value : u.options.indexOf(opt)
          );
          uniforms[name].value = optionValues[Math.floor(Math.random() * optionValues.length)];
          break;
        case 'color':
          uniforms[name].value = [Math.random(), Math.random(), Math.random()];
          break;
        case 'vec2':
          const min2 = u.min ?? [0,0];
          const max2 = u.max ?? [1,1];
          uniforms[name].value = [
            Math.random() * (max2[0] - min2[0]) + min2[0],
            Math.random() * (max2[1] - min2[1]) + min2[1]
          ];
          break;
      }
    }
  }

  _buildUniforms(defUniforms = {}) {
    const uniforms = {};

    for (const [name, u] of Object.entries(defUniforms)) {
      switch (u.type) {
        case 'float':
          uniforms[name] = { value: Number(u.value ?? 0) };
          break;
        case 'bool':
          // Convert boolean to float (0.0 or 1.0) for shader
          uniforms[name] = { value: u.value ? 1.0 : 0.0 };
          break;
        case 'select':
        case 'enum':
          // Use numeric value directly for shader
          uniforms[name] = { value: Number(u.value ?? 0) };
          break;
        case 'color':
          // Use a simple array for colors - OGL will handle it correctly
          uniforms[name] = { value: [...(u.value ?? [1,1,1])] };
          break;
        case 'vec2':
          uniforms[name] = { value: [...(u.value ?? [0,0])] };
          break;
        case 'texture':
          if (u.value) {
            // Create texture from image URL
            const texture = new Texture(this.gl);
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              texture.image = img;
            };
            img.src = u.value;
            uniforms[name] = { value: texture };
          } else {
            uniforms[name] = { value: null };
          }
          break;
        default:
          uniforms[name] = { value: u.value };
      }
    }

    return uniforms;
  }
}