const ShadowVertexShader=
`attribute vec3 vPos;
uniform mat4 view;
uniform mat4 proj;
uniform mat4 model;
varying highp vec4 aPos;
void main()
{
    gl_Position=proj*view*model*vec4(vPos.x,vPos.y,vPos.z,1.0);
    aPos=gl_Position;
}`

const ShadowFragmentShader=
`varying highp vec4 aPos;
void main()
{
    gl_FragColor=vec4(0.0,0.0,0.0,aPos.z);
}`