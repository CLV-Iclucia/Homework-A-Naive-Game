const BossVertexBuffer_S=
`attribute vec3 vPos;
uniform mat4 view;
uniform mat4 proj;
uniform mat4 model;
varying highp vec3 aPos;
void main()
{
    gl_Position=proj*view*model*vec4(vPos.x,vPos.y,vPos.z,1.0);
    aPos=vec3(gl_Position.x,gl_Position.y,gl_Position.z);
}`

const BossFragmentShader_S=
`varying vec3 aPos;
void main()
{
    gl_FragCoord=aPos.z;
}`