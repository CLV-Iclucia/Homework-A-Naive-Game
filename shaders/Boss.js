const BossVertexShader=
`attribute vec3 aPos;
uniform mat4 view;
uniform mat4 proj;
uniform mat4 model;
void main()
{
   	gl_Position =proj*view*model*vec4(aPos.x, aPos.y, aPos.z, 1.0);
}`
const BossFragmentShader=
`void main()
{
	gl_FragColor = vec4(0.8,0.0,0.0,1.0);
}`