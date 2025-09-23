// Random and hashing functions

float random(float n) {
  return fract(sin(n) * 43758.5453123);
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 random2(vec2 st) {
  st = vec2(dot(st, vec2(127.1, 311.7)),
            dot(st, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}

vec3 random3(vec3 st) {
  st = vec3(dot(st, vec3(127.1, 311.7, 74.7)),
            dot(st, vec3(269.5, 183.3, 246.1)),
            dot(st, vec3(113.5, 271.9, 124.6)));
  return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}

// Hash functions
float hash(float n) {
  return fract(sin(n) * 1e4);
}

float hash(vec2 p) {
  return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
}