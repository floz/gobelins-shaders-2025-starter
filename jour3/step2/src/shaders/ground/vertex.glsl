uniform float uTime;
uniform float uProgress;
uniform sampler2D uMask;
uniform sampler2D uLevelTexture;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uDisplacementScale;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying float vDisplacement;
varying vec3 vNormal;

#include <noise2D>

void main() {
    vUv = uv;

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}