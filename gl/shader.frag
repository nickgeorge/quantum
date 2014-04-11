precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying vec3 vLightWeighting;

uniform bool uUseTexture;
uniform sampler2D uSampler;

void main(void) {
  vec4 textureColor;
  if (uUseTexture && vTextureCoord.s > -.5) {
    textureColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor = vec4(
        textureColor.rgb * vColor.rgb  * vLightWeighting,
        textureColor.a);
  } else {
    gl_FragColor = vec4(
        vColor.rgb  * vLightWeighting,
        vColor.a);
  }
}