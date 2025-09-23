// Kaleidoscope transformation functions
// Creates symmetrical patterns through angular repetition

#ifndef TAU
#define TAU 6.28318530718
#endif

// Basic kaleidoscope transformation
// segments: number of angular segments
vec2 kaleidoscope(vec2 uv, float segments) {
  // Convert to polar coordinates
  vec2 centered = uv - 0.5;
  float angle = atan(centered.y, centered.x);
  float radius = length(centered);

  // Kaleidoscope effect
  float segmentAngle = TAU / segments;
  angle = mod(angle, segmentAngle);

  // Mirror every other segment
  if (mod(floor(atan(centered.y, centered.x) / segmentAngle), 2.0) == 1.0) {
    angle = segmentAngle - angle;
  }

  // Convert back to cartesian
  return vec2(cos(angle), sin(angle)) * radius + 0.5;
}

// Advanced kaleidoscope with rotation
vec2 kaleidoscopeRotate(vec2 uv, float segments, float rotation) {
  vec2 centered = uv - 0.5;

  // Apply rotation
  float s = sin(rotation);
  float c = cos(rotation);
  centered = vec2(c * centered.x - s * centered.y, s * centered.x + c * centered.y);

  // Apply kaleidoscope
  vec2 result = kaleidoscope(centered + 0.5, segments);

  return result;
}

// Kaleidoscope with adjustable center
vec2 kaleidoscopeCenter(vec2 uv, float segments, vec2 center) {
  vec2 shifted = uv - center + 0.5;
  return kaleidoscope(shifted, segments) + center - 0.5;
}