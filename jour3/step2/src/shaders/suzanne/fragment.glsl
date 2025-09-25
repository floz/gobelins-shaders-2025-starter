uniform float uTime;
uniform float uProgress;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform sampler2D uMask;
uniform float uNoiseScale;

varying float vReveal;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying float vMaskValue;

// Include utility functions from chunks
#include <noise2D>
#include <celShading>
#include <rimLight>

void main() {
    /////// STYLING
        // Couleur de base
        vec3 color = uColor1;

        // Direction de lumière stylisée (depuis le haut-droite)
        vec3 lightDir = normalize(vec3(1.0, 2.0, 1.0));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);

        // Applique cel shading
        color = celShading(color, vNormal, lightDir);

        // Détection face avant/arrière pour l'intérieur
        float facingRatio = dot(vNormal, viewDir);
        if (facingRatio < 0.0) {
            // Face intérieure : beaucoup plus sombre
            color *= 0.3;
        }

        // Ajoute rim light
        color = addRimLight(color, vNormal, viewDir, vec3(1.0, 0.8, 0.6));
    ////////

    gl_FragColor = vec4(color, uProgress);
}