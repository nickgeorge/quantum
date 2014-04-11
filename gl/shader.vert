attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec4 aVertexColor;
attribute vec2 aTextureCoord;

uniform vec3 uScale;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;

uniform vec3 uAmbientColor;
uniform vec3 uLightingDirection;
uniform vec3 uDirectionalColor;
uniform vec4 uColorOverride;

uniform bool uUseLighting;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying vec3 vLightWeighting;

void main(void) {
  gl_Position = uPMatrix * uMVMatrix * 
      vec4(aVertexPosition * uScale, 1.0);
  vTextureCoord = aTextureCoord;

  vec3 transformedNormal = uNMatrix * aVertexNormal;
  float directionalLightWeighting = max(
      dot(transformedNormal, uLightingDirection),
      0.0);

  if (!uUseLighting) {
    vLightWeighting = vec3(1.0, 1.0, 1.0);
  } else {
    vLightWeighting = 
        uAmbientColor + uDirectionalColor * directionalLightWeighting;
  }
  if (uColorOverride[0] > -.5) vColor = uColorOverride;
  else vColor = aVertexColor;
}