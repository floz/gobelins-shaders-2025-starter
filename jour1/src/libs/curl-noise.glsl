// Curl Noise
// Creates divergence-free noise fields useful for fluid-like motion

#import("simplex")

vec2 curlNoise2D(vec2 p, float epsilon) {
  // Sample noise at offset positions
  float n1 = simplexNoise(vec2(p.x, p.y + epsilon));
  float n2 = simplexNoise(vec2(p.x, p.y - epsilon));
  float n3 = simplexNoise(vec2(p.x + epsilon, p.y));
  float n4 = simplexNoise(vec2(p.x - epsilon, p.y));

  // Compute partial derivatives
  float dx = (n1 - n2) / (2.0 * epsilon);
  float dy = (n4 - n3) / (2.0 * epsilon);

  // Return curl (perpendicular to gradient)
  return vec2(dx, dy);
}

vec3 curlNoise3D(vec3 p, float epsilon) {
  // Sample noise at offset positions for each axis
  float x0 = simplexNoise(vec2(p.y - epsilon, p.z));
  float x1 = simplexNoise(vec2(p.y + epsilon, p.z));
  float y0 = simplexNoise(vec2(p.x, p.z - epsilon));
  float y1 = simplexNoise(vec2(p.x, p.z + epsilon));
  float z0 = simplexNoise(vec2(p.x - epsilon, p.y));
  float z1 = simplexNoise(vec2(p.x + epsilon, p.y));

  // Compute curl components
  float x = (x1 - x0) / (2.0 * epsilon);
  float y = (y1 - y0) / (2.0 * epsilon);
  float z = (z1 - z0) / (2.0 * epsilon);

  return vec3(x, y, z);
}

// Simplified version with default epsilon
vec2 curlNoise(vec2 p) {
  return curlNoise2D(p, 0.01);
}