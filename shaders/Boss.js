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
	aNorm=normalize(vNorm);
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
void main()
{
	highp vec3 aPos=vec3(verPos.x,verPos.y,verPos.z);
	highp vec4 ambientColor=texture2D(myTex,aTexCoord);
	ambientColor.x*=0.2;
//	if(ambientColor.y+ambientColor.z<0.8)
//	{
		ambientColor.y*=0.2;
		ambientColor.z*=0.2;
//	}
	highp float strength=length(lightPos-aPos);
	strength=1500.0/(strength*strength);
	highp vec3 lightDir=normalize(lightPos-aPos);
	highp vec3 outDir=normalize(viewPos-aPos);
	highp vec3 halfDir=normalize(lightDir+outDir);
	highp vec3 halfViewDir=normalize(lightDir-viewDir);
	highp float specular=pow(max(0.0,dot(halfDir,aNorm)),15.0)*max(0.0,dot(halfDir,halfViewDir));//镜面反射光
	highp float diffuse=max(0.0,dot(lightDir,aNorm));
	highp vec3 lColor=strength*(0.5*diffuse+0.5*specular)*lightColor;
	gl_FragColor=vec4(ambientColor.x+lColor.x,ambientColor.y+lColor.y,ambientColor.z+lColor.z,1.0);
}`