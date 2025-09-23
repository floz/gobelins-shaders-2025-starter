// Math utilities
// Common math functions and constants

#define PI 3.14159265359
#define TAU 6.28318530718
#define HALF_PI 1.57079632679
#define GOLDEN_RATIO 1.61803398875

// Rotation matrix
mat2 rotate2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

// 2D rotation
vec2 rotate(vec2 p, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

// Remap value from one range to another
float remap(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

// Clamp to 0-1
float saturate(float x) {
  return clamp(x, 0.0, 1.0);
}

vec3 saturate(vec3 x) {
  return clamp(x, 0.0, 1.0);
}

// Smooth minimum
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Smooth maximum
float smax(float a, float b, float k) {
  return -smin(-a, -b, k);
}

// Cubic pulse
float cubicPulse(float c, float w, float x) {
  x = abs(x - c);
  if (x > w) return 0.0;
  x /= w;
  return 1.0 - x * x * (3.0 - 2.0 * x);
}

// Exponential impulse
float expImpulse(float x, float k) {
  float h = k * x;
  return h * exp(1.0 - h);
}

// Parabola
float parabola(float x, float k) {
  return pow(4.0 * x * (1.0 - x), k);
}

// Gain function
float gain(float x, float k) {
  float a = 0.5 * pow(2.0 * ((x < 0.5) ? x : 1.0 - x), k);
  return (x < 0.5) ? a : 1.0 - a;
}