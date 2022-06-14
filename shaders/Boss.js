const BossVertexShader=
`attribute vec3 vPos;
attribute vec3 vNorm;
attribute vec2 vTexCoord;
uniform mat4 view;
uniform mat4 proj;
uniform mat4 model;
varying highp vec4 verPos;
varying highp vec3 aNorm;
varying highp vec2 aTexCoord;
void main()
{
	verPos=model*vec4(vPos.x,vPos.y,vPos.z,1.0);
	gl_Position =proj*view*verPos;
	aNorm=mat3(model)*vNorm;
	aNorm=normalize(aNorm);
	aTexCoord=vTexCoord;
}`
const BossFragmentShader=
`varying highp vec4 verPos;
varying highp vec3 aNorm;
varying highp vec2 aTexCoord;
uniform sampler2D myTex;
uniform highp vec3 viewDir;
uniform highp vec3 viewPos;
uniform	highp vec3 lightPos;
uniform highp vec3 lightColor;
const highp float gamma=2.2;
// highp float GeometryTerm(highp vec3 inLight,highp vec3 outLight)
// {

// }
// highp float NormalDistribution(highp vec3 h)
// {

// }
// highp float FresnelTerm(highp vec3 inLight,highp vec3 h)
// {

// }
void main()
{
	highp vec3 aPos=vec3(verPos.x,verPos.y,verPos.z);
	highp vec3 ambientColor=pow(texture2D(myTex,aTexCoord).rgb,vec3(gamma));
	ambientColor.x*=0.05;
	ambientColor.y*=0.05;
	ambientColor.z*=0.05;
	highp float strength=length(lightPos-aPos);
	strength=1500.0/(strength*strength);
	highp vec3 lightDir=normalize(lightPos-aPos);
	highp vec3 outDir=normalize(viewPos-aPos);
	highp vec3 halfDir=normalize(lightDir+outDir);
	highp vec3 halfViewDir=normalize(lightDir-viewDir);
	highp float specular=pow(max(0.0,dot(halfDir,aNorm)),15.0)*max(0.0,dot(halfDir,halfViewDir));//镜面反射光
	highp float diffuse=max(0.0,dot(lightDir,aNorm));
	highp vec3 lColor=strength*(0.5*diffuse+0.5*specular)*lightColor;
	gl_FragColor=vec4(pow((ambientColor+lColor).rgb,vec3(1.0/gamma)),1.0);
}`