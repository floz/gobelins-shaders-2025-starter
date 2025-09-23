uniform vec3 uColorA;
uniform vec3 uColorB;

varying vec3 vNormal;
varying vec3 vPosition;
// TODO: Add varying for noise value

void main() {
    // TODO: Add simple lighting calculation
    vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
    // Hint: Use dot product between normal and light direction
    // Example: https://github.com/oframe/ogl/blob/385ce65c352c70734a36dc98c787fdd1d30ddb3b/examples/base-primitives.html#L41

    // TODO: Mix colors based on noise value

    // TODO: Apply lighting to the color

    // Fresnel, because why not
    vec3 viewDirection = normalize(-vPosition); 
    float fresnel = 1.0 - abs(dot(viewDirection, normalize(vNormal)));
    fresnel = pow(fresnel, 2.0);

    vec3 color = uColorA + fresnel;

    gl_FragColor = vec4(color, 1.0); // Replace with your final color calculation
}