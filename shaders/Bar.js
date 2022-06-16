const BarVertexShader=
`attribute vec3 vPos;
uniform mat4 model;
void main()
{
	gl_Position=model*vec4(vPos,1.0);
}`
const BarFragmentShader=
`uniform highp vec3 myColor;
void main()
{
	gl_FragColor=vec4(myColor,1.0);
}`