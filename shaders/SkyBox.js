const SkyBoxVertexShader=
`attribute vec3 aPos;
uniform mat4 view;
uniform mat4 proj;
varying highp vec3 TexCoord;
void main()
{
   	gl_Position =proj*view*vec4(aPos.x, aPos.y, aPos.z, 1.0);
	TexCoord=aPos;
}`
const SkyBoxFragmentShader=
`varying highp vec3 TexCoord;
uniform samplerCube myTex;
void main()
{
	gl_FragColor = textureCube(myTex,TexCoord);
}`