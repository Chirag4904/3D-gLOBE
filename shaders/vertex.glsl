
varying vec2 vUV;
varying vec3 vNormal;

void main() {
    vNormal = normalize(normalMatrix*normal);
    vUV=uv;
    gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);
}