const FloorVertexShader=
`attribute vec3 vPos;
attribute vec2 vTexCoord;
uniform mat4 view;
uniform mat4 lightView;
uniform mat4 proj;
varying highp vec4 verPos;
varying highp vec4 lightSpacePos;
varying highp vec3 aNorm;
varying highp vec2 aTexCoord;
void main()
{
	verPos=vec4(vPos.x,vPos.y,vPos.z,1.0);//verPos是世界空间坐标,proj*lightView*verPos会得到光源视角的透视空间坐标
	lightSpacePos=proj*lightView*verPos;
	gl_Position =proj*view*verPos;
	aNorm=vec3(0.0,1.0,0.0);
	aTexCoord=vTexCoord;
}`
const FloorFragmentShader=
`varying highp vec4 verPos;
varying highp vec4 lightSpacePos;
varying highp vec3 aNorm;
varying highp vec2 aTexCoord;
uniform sampler2D myTex;
uniform sampler2D ShadowMap;
uniform highp vec3 viewDir;
uniform highp vec3 viewPos;
uniform	highp vec3 lightPos;
uniform highp vec3 lightColor;
highp float linearize(highp float depth)
{
	highp float z = depth * 2.0 - 1.0;
    return 0.4 / (200.5 - z * 199.5);    
}
highp float renderShadow()
{
	highp vec3 lightSpaceCoord=lightSpacePos.xyz/lightSpacePos.w;
	lightSpaceCoord=0.5*lightSpaceCoord+0.5;//将三个维度坐标都要归一化
	highp float Z=linearize(lightSpaceCoord.z);
	highp float lightSpaceDepth=texture2D(ShadowMap,lightSpaceCoord.xy).x;
	return lightSpaceDepth+0.0025<Z?0.01:1.0;
}
void main()
{
	highp vec3 aPos=verPos.xyz;
	highp float sd=renderShadow();
	highp vec3 ambientColor=texture2D(myTex,aTexCoord).xyz;
	if(ambientColor.x<0.5)ambientColor.x*=0.2;
	ambientColor.y*=0.2;
	ambientColor.z*=0.2;
	highp float strength=length(lightPos-aPos);
	strength=1500.0/(strength*strength);
	highp vec3 lightDir=normalize(lightPos-aPos);
	highp vec3 outDir=normalize(viewPos-aPos);
	highp vec3 halfDir=normalize(lightDir+outDir);
	highp vec3 halfViewDir=normalize(lightDir-viewDir);
	highp float specular=pow(max(0.0,dot(halfDir,aNorm)),15.0)*max(0.0,dot(halfDir,halfViewDir));//镜面反射光
	highp float diffuse=max(0.0,dot(lightDir,aNorm));
	highp vec3 lColor=strength*(0.5*diffuse+0.2*specular)*lightColor;
	gl_FragColor=vec4(sd*(ambientColor+lColor).xyz,1.0);
}`