precision highp float;

uniform vec3 u_color;
uniform sampler2D u_texture;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  gl_FragColor = vec4(u_color, 1.0);
  // gl_FragColor = texture2D( u_texture, uv );
}