import GUI from 'lil-gui';

export class GuiBinder {
  constructor(containerEl) {
    this.containerEl = containerEl;
    this.gui = null;
    this.folders = {};
  }

  bindExercise(exercise, uniforms, callbacks = {}) {
    this.destroy();
    this.gui = new GUI({ container: this.containerEl, width: 300 });

    // Add controls directly to main GUI
    for (const [name, def] of Object.entries(exercise.uniforms)) {
      if (!def.gui) continue;

      const label = def.label || name;

      if (def.type === 'float') {
        this.gui
          .add(uniforms[name], 'value', def.min ?? 0, def.max ?? 1, def.step ?? 0.01)
          .name(label)
          .onChange(callbacks.onChange);

      } else if (def.type === 'color') {
        // lil-gui expects RGB in [0,255] format
        // OGL Color class extends Array, so we can access values directly
        const currentValue = uniforms[name].value;
        const proxy = {
          [name]: [
            Math.round(currentValue[0] * 255),
            Math.round(currentValue[1] * 255),
            Math.round(currentValue[2] * 255)
          ]
        };

        this.gui
          .addColor(proxy, name)
          .name(label)
          .onChange(v => {
            // lil-gui returns array in [0,255] format
            // OGL Color class has a set method that accepts arrays
            if (uniforms[name].value.set) {
              // If it's an OGL Color instance, use its set method
              uniforms[name].value.set([v[0], v[1], v[2]]);
            } else {
              // Fallback for plain arrays
              uniforms[name].value[0] = v[0];
              uniforms[name].value[1] = v[1];
              uniforms[name].value[2] = v[2];
            }
            if (callbacks.onChange) callbacks.onChange();
          });

      } else if (def.type === 'vec2') {
        const folder = this.gui.addFolder(label);
        const min = def.min ?? [0, 0];
        const max = def.max ?? [1, 1];
        const step = def.step ?? 0.01;

        const proxy = {
          x: uniforms[name].value[0],
          y: uniforms[name].value[1]
        };

        folder
          .add(proxy, 'x', min[0], max[0], step)
          .name('X')
          .onChange(v => {
            uniforms[name].value[0] = v;
            if (callbacks.onChange) callbacks.onChange();
          });

        folder
          .add(proxy, 'y', min[1], max[1], step)
          .name('Y')
          .onChange(v => {
            uniforms[name].value[1] = v;
            if (callbacks.onChange) callbacks.onChange();
          });

        folder.open();

      } else if (def.type === 'bool') {
        const proxy = { [name]: !!uniforms[name].value };

        this.gui
          .add(proxy, name)
          .name(label)
          .onChange(v => {
            uniforms[name].value = v ? 1.0 : 0.0;
            if (callbacks.onChange) callbacks.onChange();
          });

      } else if (def.type === 'select' || def.type === 'enum') {
        // Create options object for dropdown
        const options = {};
        def.options.forEach((opt, index) => {
          options[opt.label || opt] = opt.value !== undefined ? opt.value : index;
        });

        const proxy = { [name]: uniforms[name].value };

        this.gui
          .add(proxy, name, options)
          .name(label)
          .onChange(v => {
            uniforms[name].value = v;
            if (callbacks.onChange) callbacks.onChange();
          });
      }
    }

    // Add Reset button directly
    if (callbacks.onReset) {
      const actions = { reset: callbacks.onReset };
      this.gui.add(actions, 'reset').name('Reset');
    }
  }

  updateValues(uniforms, uniformDefs) {
    if (!this.gui) return;

    // Update GUI to reflect current uniform values
    const controllers = this.gui.controllersRecursive();

    for (const controller of controllers) {
      // The controller's property matches the uniform name
      const uniformName = controller.property;

      if (uniforms[uniformName]) {
        const def = uniformDefs[uniformName];
        if (!def) continue;

        if (def.type === 'float') {
          controller.setValue(uniforms[uniformName].value);
        } else if (def.type === 'bool') {
          controller.setValue(uniforms[uniformName].value > 0.5);
        } else if (def.type === 'select' || def.type === 'enum') {
          controller.setValue(uniforms[uniformName].value);
        } else if (def.type === 'color') {
          const colorValue = [
            Math.round(uniforms[uniformName].value[0] * 255),
            Math.round(uniforms[uniformName].value[1] * 255),
            Math.round(uniforms[uniformName].value[2] * 255)
          ];
          controller.setValue(colorValue);
        }
      }
    }
  }

  destroy() {
    if (this.gui) {
      this.gui.destroy();
      this.gui = null;
      this.folders = {};
    }
  }
}