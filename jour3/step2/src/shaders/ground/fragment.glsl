uniform float uTime;
uniform float uProgress;
uniform sampler2D uMask;
uniform sampler2D uVegetalTexture;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform vec3 uColor1;
uniform vec3 uColor2;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying float vDisplacement;
varying vec3 vNormal;

#include <noise2D>
#include <celShading>
#include <rimLight>

float cubicIn(float t) {
  return t * t * t;
}

void main() {
    gl_FragColor = vec4(vUv, 0., uProgress);
}