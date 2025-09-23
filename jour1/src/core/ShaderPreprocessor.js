// Shader Preprocessor
// Handles #pragma glslify imports in GLSL shaders

// Import all library modules
import randomGlsl from '../libs/random.glsl?raw';
import simplexGlsl from '../libs/simplex.glsl?raw';
import perlinGlsl from '../libs/perlin.glsl?raw';
import valueNoiseGlsl from '../libs/value-noise.glsl?raw';
import fbmGlsl from '../libs/fbm.glsl?raw';
import blendingGlsl from '../libs/blending.glsl?raw';
import colorGlsl from '../libs/color.glsl?raw';
import mathGlsl from '../libs/math.glsl?raw';
import sdfGlsl from '../libs/sdf.glsl?raw';
import curlNoiseGlsl from '../libs/curl-noise.glsl?raw';
import kaleidoscope from '../libs/kaleidoscope.glsl?raw';

// Library map
const libraries = {
  'random': randomGlsl,
  'simplex': simplexGlsl,
  'perlin': perlinGlsl,
  'value-noise': valueNoiseGlsl,
  'fbm': fbmGlsl,
  'blending': blendingGlsl,
  'color': colorGlsl,
  'math': mathGlsl,
  'sdf': sdfGlsl,
  'curl-noise': curlNoiseGlsl,
  'kaleidoscope': kaleidoscope
};

export class ShaderPreprocessor {
  constructor() {
    this.includes = new Set();
    this.processedLibs = new Map();
  }

  process(shaderSource) {
    this.includes.clear();
    this.processedLibs.clear();

    // Extract precision declaration from source if present
    const precisionMatch = shaderSource.match(/precision\s+(highp|mediump|lowp)\s+float\s*;/);
    const hasPrecision = precisionMatch !== null;

    // Remove precision from source to avoid duplicates
    let processed = shaderSource.replace(/precision\s+(highp|mediump|lowp)\s+float\s*;\s*/g, '');

    // Process the shader recursively
    processed = this.processIncludes(processed);

    // Build the final shader
    let finalShader = '';

    // Add precision at the very top (use highp by default if not specified)
    if (hasPrecision || this.processedLibs.size > 0) {
      const precision = precisionMatch ? precisionMatch[1] : 'highp';
      finalShader += `precision ${precision} float;\n\n`;
    }

    // Add all included libraries
    for (const [name, content] of this.processedLibs) {
      finalShader += `// ===== Library: ${name} =====\n${content}\n\n`;
    }

    // Add the processed main shader code
    finalShader += processed;

    return finalShader;
  }

  processIncludes(source) {
    // Handle #import("...") syntax (new simplified syntax)
    const simpleImportRegex = /#import\s*\(\s*["']([^"']+)["']\s*\)/g;

    source = source.replace(simpleImportRegex, (match, libPath) => {
      const libName = this.extractLibName(libPath);

      this.includeLibrary(libName);

      return ''; // Remove the import line
    });

    return source;
  }

  includeLibrary(libName) {
    if (this.includes.has(libName)) return;

    this.includes.add(libName);

    if (libraries[libName]) {
      // Process the library for nested imports FIRST
      const processedLib = this.processLibraryIncludes(libraries[libName]);

      // Store the processed version (with imports removed)
      this.processedLibs.set(libName, processedLib);

      // Note: dependencies are now handled by processLibraryIncludes
      // which calls includeLibrary recursively
    } else {
      console.warn(`Library not found: ${libName}`);
    }
  }

  processLibraryIncludes(libSource) {
    // Process nested includes in libraries

    // Handle #import("...") syntax (preferred)
    const importRegex = /#import\s*\(\s*["']([^"']+)["']\s*\)/g;

    libSource = libSource.replace(importRegex, (match, libPath) => {
      const libName = this.extractLibName(libPath);

      // Use includeLibrary to properly handle dependencies
      this.includeLibrary(libName);

      return ''; // Remove the import line as the content will be included
    });

    return libSource;
  }

  extractLibName(path) {
    // Extract library name from path
    // e.g., "./random.glsl" -> "random"
    // e.g., "libs/simplex" -> "simplex"
    const match = path.match(/([^/\\]+?)(?:\.glsl)?$/);
    return match ? match[1] : path;
  }
}