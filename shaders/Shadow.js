const ShadowVertexShader=
`attribute vec3 vPos;
uniform mat4 view;
uniform mat4 proj;
uniform mat4 model;
void main()
{
    gl_Position=proj*view*model*vec4(vPos.x,vPos.y,vPos.z,1.0);
}`

const ShadowFragmentShader=
`highp float linearize(highp float depth)
{
	highp float z = depth * 2.0 - 1.0;
    return 0.4 / (200.1 - z * 199.9);    
}
void main()
{
    highp float Z=linearize(gl_FragCoord.z);
    gl_FragColor=vec4(Z,Z,Z,1.0);
}`