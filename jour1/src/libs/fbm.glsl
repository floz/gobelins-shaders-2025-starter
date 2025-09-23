// Fractal Brownian Motion
// Generic FBM that can work with different noise functions

// FBM with value noise
float fbmValue(vec2 st, int octaves, float lacunarity, float gain) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * valueNoise(st * frequency);
    frequency *= lacunarity;
    amplitude *= gain;
  }

  return value;
}

// FBM with perlin noise
float fbmPerlin(vec2 st, int octaves, float lacunarity, float gain) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * perlinNoise(st * frequency);
    frequency *= lacunarity;
    amplitude *= gain;
  }

  return value;
}

// FBM with simplex noise
float fbmSimplex(vec2 st, int octaves, float lacunarity, float gain) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * simplexNoise(st * frequency);
    frequency *= lacunarity;
    amplitude *= gain;
  }

  return value;
}

// Default FBM (simplified parameters)
float fbm(vec2 st, int octaves) {
  return fbmValue(st, octaves, 2.0, 0.5);
}