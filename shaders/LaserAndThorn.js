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
const ThornVertexShader=
`attribute vec3 vPos;
attribute vec3 vNorm;
uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;
varying highp vec4 verPos;
varying highp vec3 aNorm;
void main()
{
    gl_Position=proj*view*model*vec4(vPos.xyz,1.0);
    aNorm=mat3(model)*vNorm;
	aNorm=normalize(aNorm);
    verPos=gl_Position;
}
`
const ThornFragmentShader=
`varying highp vec4 verPos;
varying highp vec3 aNorm;
uniform highp vec3 lightPos;
uniform highp vec3 viewPos;
uniform highp vec3 viewDir;
uniform highp vec3 lightColor;
void main()
{
    highp vec3 aPos=verPos.xyz/verPos.w;
    highp vec3 ambientColor=vec3(0.33,0.1569,0.1059);
	ambientColor.x*=0.2;
	ambientColor.y*=0.2;
	ambientColor.z*=0.2;
	highp float strength=length(lightPos-aPos);
	strength=1500.0/(strength*strength);
	highp vec3 lightDir=normalize(lightPos-aPos);
	highp vec3 outDir=normalize(viewPos-aPos);
	highp vec3 halfDir=normalize(lightDir+outDir);
	highp vec3 halfViewDir=normalize(lightDir-viewDir);
	highp float specular=pow(max(0.0,dot(halfDir,aNorm)),15.0)*max(0.0,dot(halfDir,halfViewDir));
	highp float diffuse=max(0.0,dot(lightDir,aNorm));
	highp vec3 lColor=strength*(0.8*diffuse+0.2*specular)*lightColor;
	gl_FragColor=vec4((ambientColor+lColor).xyz,1.0);
}`