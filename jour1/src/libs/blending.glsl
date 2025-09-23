// Blend modes library
// Collection of common blending operations

vec3 blendMultiply(vec3 base, vec3 blend) {
  return base * blend;
}

vec3 blendScreen(vec3 base, vec3 blend) {
  return 1.0 - (1.0 - base) * (1.0 - blend);
}

vec3 blendOverlay(vec3 base, vec3 blend) {
  return mix(
    2.0 * base * blend,
    1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
    step(0.5, base)
  );
}

vec3 blendSoftLight(vec3 base, vec3 blend) {
  return mix(
    2.0 * base * blend + base * base * (1.0 - 2.0 * blend),
    2.0 * base * (1.0 - blend) + sqrt(base) * (2.0 * blend - 1.0),
    step(0.5, blend)
  );
}

vec3 blendHardLight(vec3 base, vec3 blend) {
  return blendOverlay(blend, base);
}

vec3 blendColorDodge(vec3 base, vec3 blend) {
  return base / (1.0 - blend);
}

vec3 blendColorBurn(vec3 base, vec3 blend) {
  return 1.0 - (1.0 - base) / blend;
}

vec3 blendLinearDodge(vec3 base, vec3 blend) {
  return base + blend;
}

vec3 blendLinearBurn(vec3 base, vec3 blend) {
  return base + blend - 1.0;
}

vec3 blendDifference(vec3 base, vec3 blend) {
  return abs(base - blend);
}

vec3 blendExclusion(vec3 base, vec3 blend) {
  return base + blend - 2.0 * base * blend;
}