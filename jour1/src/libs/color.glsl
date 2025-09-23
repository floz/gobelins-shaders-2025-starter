// Color utilities
// Color space conversions and adjustments

// Apply contrast
vec3 contrast(vec3 color, float amount) {
  return (color - 0.5) * amount + 0.5;
}

float contrast(float value, float amount) {
  return (value - 0.5) * amount + 0.5;
}

// Apply brightness
vec3 brightness(vec3 color, float amount) {
  return color + amount;
}

// Apply saturation
vec3 saturation(vec3 color, float amount) {
  float gray = dot(color, vec3(0.299, 0.587, 0.114));
  return mix(vec3(gray), color, amount);
}

// RGB to HSV
vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// HSV to RGB
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Gamma correction
vec3 gamma(vec3 color, float g) {
  return pow(color, vec3(1.0 / g));
}

// Linear to sRGB
vec3 linearToSRGB(vec3 color) {
  return pow(color, vec3(1.0 / 2.2));
}

// sRGB to Linear
vec3 sRGBToLinear(vec3 color) {
  return pow(color, vec3(2.2));
}