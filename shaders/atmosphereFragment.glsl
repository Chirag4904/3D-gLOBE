varying vec3 vNormal;
void main() {
    float intensity =pow(0.6- dot(vNormal,vec3(0,0,1.0)),2.0);
    // vec3 atmosphere = vec3(0.2,0.4,1)*pow(intensity,1.5);
    gl_FragColor = vec4(0.3,0.6,1.0,1.0)*intensity;
}