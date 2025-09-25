import * as THREE from 'three';

// Noise functions
THREE.ShaderChunk['noise2D'] = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}
`;

// Cel shading lighting
THREE.ShaderChunk['celShading'] = `
vec3 celShading(vec3 color, vec3 normal, vec3 lightDir) {
    float NdotL = dot(normal, lightDir);

    // 3 bandes nettes pour style illustration
    float lightIntensity;
    if (NdotL > 0.5) {
        lightIntensity = 1.0;  // Zone éclairée
    } else if (NdotL > 0.0) {
        lightIntensity = 0.7;  // Zone mi-ombre
    } else {
        lightIntensity = 0.4;  // Zone ombre
    }

    return color * lightIntensity;
}

vec3 celShadingWithSteps(vec3 color, vec3 normal, vec3 lightDir, float steps) {
    float NdotL = dot(normal, lightDir);

    // Quantization pour créer les bandes
    float lightIntensity = floor(NdotL * steps) / steps;
    lightIntensity = clamp(lightIntensity, 0.3, 1.0);

    return color * lightIntensity;
}
`;

// Rim lighting
THREE.ShaderChunk['rimLight'] = `
vec3 addRimLight(vec3 color, vec3 normal, vec3 viewDir, vec3 rimColor) {
    float rim = 1.0 - abs(dot(normal, viewDir));
    rim = smoothstep(0.6, 0.8, rim);
    return color + rimColor * rim * 0.3;
}

vec3 addEdgyRimLight(vec3 color, vec3 normal, vec3 viewDir, vec3 rimColor, float power) {
    float rim = 1.0 - abs(dot(normal, viewDir));
    rim = step(0.7, rim); // Version edgy avec step
    return color + rimColor * rim * power;
}
`;

// Edgy reveal helpers
THREE.ShaderChunk['edgyReveal'] = `
float edgyCircleReveal(vec2 center, float radius, float progress, float edgeWidth) {
    float dist = length(center);
    return smoothstep(progress * radius - edgeWidth, progress * radius + edgeWidth, dist);
}

float edgyMaskReveal(float maskValue, float progress) {
    return step(maskValue, progress);
}

float detectRevealEdge(float revealValue, float progress, float edgeWidth) {
    float edgeDistance = abs(revealValue - progress);
    return 1.0 - smoothstep(0.0, edgeWidth, edgeDistance);
}
`;

// Complete lighting system
THREE.ShaderChunk['applyLighting'] = `
vec3 applyStylizedLighting(vec3 baseColor, vec3 normal, vec3 lightDir, vec3 viewDir) {
    // Cel shading
    vec3 color = celShading(baseColor, normal, lightDir);

    // Rim light
    color = addRimLight(color, normal, viewDir, vec3(1.0, 0.8, 0.6));

    return color;
}
`;

export function initializeShaderChunks() {
    console.log('Shader chunks initialized');
}