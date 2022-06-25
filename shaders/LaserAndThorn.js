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
uniform	highp vec3 lightPos;
uniform highp vec3 viewPos;
uniform highp vec3 lightColor;
const highp float gamma=2.2;
const highp float alpha=0.2;
const highp float PI=3.14159265359;
const highp float k=(alpha+1.0)*(alpha+1.0)/8.0;
const highp float metalness=0.9;
highp vec3 R0;
highp vec3 baseColor;
highp float GeometryTerm(highp vec3 v)
{
	highp float VdotN=dot(v,aNorm);
	return VdotN/(VdotN*(1.0-k)+k);
}
highp float NormalDistribution(highp vec3 h)
{
	highp float projLength=dot(h,aNorm);
	projLength*=projLength;
	projLength+=0.001;
	highp float distanceSqr=1.0-projLength;
	highp float D=exp(-distanceSqr/projLength/alpha/alpha);
	D/=PI*alpha*alpha*projLength*projLength;
	return D;
}
highp vec3 FresnelTerm(highp float cosTheta)
{
	return R0+(vec3(1.0)-R0)*pow(1.0-cosTheta,5.0);
}
highp vec3 BRDF(highp vec3 inLight,highp vec3 outLight)
{
	highp vec3 h=normalize(inLight+outLight);
	highp float G=GeometryTerm(inLight)*GeometryTerm(outLight);
	highp float HdotI=max(dot(h,inLight),0.0);
	highp float NdotI=max(dot(aNorm,inLight),0.0);
	highp float NdotO=max(dot(aNorm,outLight),0.0);
	R0=mix(vec3(0.04),baseColor,metalness);
	highp vec3 F=FresnelTerm(HdotI);
	highp vec3 Diffuse=(vec3(1.0)-F)*baseColor/PI;
	return (1.0-metalness)*Diffuse+F*G*NormalDistribution(h)/(4.0*NdotI*NdotO+0.001);
}
void main()
{
	highp vec3 aPos=vec3(verPos.x,verPos.y,verPos.z);
	baseColor=pow(vec3(0.33,0.1569,0.1059),vec3(gamma));
	highp float strength=length(lightPos-aPos);
	strength=45000.0/(strength*strength);
	highp vec3 inLight=normalize(lightPos-aPos);
	highp vec3 outLight=normalize(viewPos-aPos);
	highp vec3 color=0.03*baseColor+strength*BRDF(inLight,outLight)*lightColor*max(dot(inLight,aNorm),0.0);
	color=color/(color+vec3(1.0));
	gl_FragColor=vec4(pow(color,vec3(1.0/gamma)),1.0);
}`