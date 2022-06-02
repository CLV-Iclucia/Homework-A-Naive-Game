const LaserVertexShader=
`attribute vec3 vPos;
uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;
void main()
{
    gl_Position=proj*view*model*vec4(vPos.xyz,1.0);
}
`
const LaserFragmentShader=
`void main()
{
    gl_FragColor=vec4(1.0,1.0,1.0,1.0);
}`