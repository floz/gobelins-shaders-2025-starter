// Perlin Noise
// Classic Perlin noise implementation

#import("random")

float perlinNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Get gradients
  vec2 g00 = random2(i + vec2(0.0, 0.0));
  vec2 g10 = random2(i + vec2(1.0, 0.0));
  vec2 g01 = random2(i + vec2(0.0, 1.0));
  vec2 g11 = random2(i + vec2(1.0, 1.0));

  // Compute dot products
  float n00 = dot(g00, f - vec2(0.0, 0.0));
  float n10 = dot(g10, f - vec2(1.0, 0.0));
  float n01 = dot(g01, f - vec2(0.0, 1.0));
  float n11 = dot(g11, f - vec2(1.0, 1.0));

  // Smooth interpolation
  vec2 u = f * f * (3.0 - 2.0 * f);

  // Bilinear interpolation
  float n0 = mix(n00, n10, u.x);
  float n1 = mix(n01, n11, u.x);
  return mix(n0, n1, u.y) * 0.5 + 0.5;
}