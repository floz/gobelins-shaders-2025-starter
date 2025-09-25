uniform float uTime;
uniform float uProgress;
uniform sampler2D uMask;
uniform float uMinY;
uniform float uMaxY;
uniform float uNoiseScale;

varying float vReveal;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vMaskValue;

#include <noise2D>

mat2 rotate2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

float cubicOut(float t) {
  float f = t - 1.0;
  return f * f * f + 1.0;
}

float cubicIn(float t) {
  return t * t * t;
}

void main() {
  vUv = uv;

  vNormal = normal;

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}