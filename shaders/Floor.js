const FloorVertexShader=
`attribute vec3 vPos;
attribute vec2 vTexCoord;
uniform mat4 view;
uniform mat4 lightView;
uniform mat4 proj;
uniform mat4 lightProj;
varying highp vec4 verPos;
varying highp vec4 lightSpacePos;
varying highp vec2 aTexCoord;
void main()
{
	verPos=vec4(vPos.x,vPos.y,vPos.z,1.0);//verPos是世界空间坐标,proj*lightView*verPos会得到光源视角的透视空间坐标
	lightSpacePos=lightProj*lightView*verPos;
	gl_Position =proj*view*verPos;
	aTexCoord=vTexCoord;
}`
const FloorFragmentShader=
`varying highp vec4 verPos;
varying highp vec4 lightSpacePos;
varying highp vec2 aTexCoord;
uniform sampler2D myTex;
uniform sampler2D ShadowMap;
uniform sampler2D NormalMap;
uniform highp vec3 viewDir;
uniform highp vec3 viewPos;
uniform	highp vec3 lightPos;
uniform highp vec3 lightColor;
uniform highp vec2 pixelSize;
const highp float lightSrcWidth=0.5;
const highp float eps=0.004;
highp float Z;//这是当前片段线性化并且归一化以后的深度
highp vec3 lightSpaceCoord;
highp vec4 opt=vec4(1.0,1.0,1.0,1.0);
highp float linearize(highp float depth)
{
	highp float z = depth * 2.0 - 1.0;
    return 10.0 / (105.0 - z * 95.0);
}
highp float renderShadow(highp vec2 offset)
{
	highp vec3 tmpCoord=vec3((lightSpaceCoord.xy+0.5*offset).xy,lightSpaceCoord.z);
	highp float lightSpaceDepth=texture2D(ShadowMap,tmpCoord.xy).x;
	return lightSpaceDepth+eps<Z?0.0:1.0;
}
highp float getLightSpaceDepth(highp vec2 pos)
{
	return texture2D(ShadowMap,pos).x;
}
void main()
{
	highp vec3 aPos=verPos.xyz;
	lightSpaceCoord=lightSpacePos.xyz/lightSpacePos.w;
	highp float shadow=0.0;
	lightSpaceCoord=0.5*lightSpaceCoord+0.5;
	if(lightSpaceCoord.x<0.0||lightSpaceCoord.y>1.0||lightSpaceCoord.y<0.0||lightSpaceCoord.y>1.0)shadow=1.0;
	else
	{
		Z=linearize(lightSpaceCoord.z);
		highp float aveDepth=0.0;
		int cnt=0;
		for(int i=-1;i<=1;i++)
			for(int j=-1;j<=1;j++)
			{
				highp float tmpDepth=getLightSpaceDepth(lightSpaceCoord.xy+vec2(float(i),float(j))*0.2*pixelSize);
				if(tmpDepth+eps<Z)//如果挡住了，计入遮挡体深度
				{
					aveDepth+=tmpDepth;
					cnt++;
				}
			}
		if(cnt>0)
		{
			aveDepth/=float(cnt);//得到了平均遮挡体平面
			highp float penum=2.0*(Z-aveDepth)*lightSrcWidth/(aveDepth+0.05)/pixelSize.y;
			int Penumbra=int(penum);//得到了半影宽度
			if(Penumbra==0)shadow=renderShadow(vec2(0.0,0.0));
			else if(Penumbra==1)//真的要命，shader要求循环上限是固定的
			{
				for(int i=0;i<=1;i++)
				{
					for(int j=0;j<=1;j++)
					{
						shadow+=renderShadow(vec2(0.5*float(i)*pixelSize.x,0.5*float(j)*pixelSize.y));
						shadow+=renderShadow(vec2(0.5*float(-i)*pixelSize.x,0.5*float(j)*pixelSize.y));
						shadow+=renderShadow(vec2(0.5*float(i)*pixelSize.x,0.5*float(-j)*pixelSize.y));
						shadow+=renderShadow(vec2(0.5*float(-i)*pixelSize.x,0.5*float(-j)*pixelSize.y));
					}
				}
				shadow/=9.0;
			}
			else
			{
				for(int i=0;i<=2;i++)
				{
					for(int j=0;j<=2;j++)
					{
						shadow+=renderShadow(vec2(0.5*float(i)*pixelSize.x,0.5*float(j)*pixelSize.y));
						shadow+=renderShadow(vec2(0.5*float(-i)*pixelSize.x,0.5*float(j)*pixelSize.y));
						shadow+=renderShadow(vec2(0.5*float(i)*pixelSize.x,0.5*float(-j)*pixelSize.y));
						shadow+=renderShadow(vec2(0.5*float(-i)*pixelSize.x,0.5*float(-j)*pixelSize.y));
					}
				}
				shadow/=25.0;
			}
		}
		else shadow=1.0;
	}
	highp vec3 ambientColor=texture2D(myTex,aTexCoord*2.0).rgb;
	//highp vec3 aNorm=vec3(0.0,1.0,0.0);
	highp vec3 aNorm=normalize(texture2D(NormalMap,aTexCoord*32.0).gbr);
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
	gl_FragColor=vec4(shadow*(ambientColor+lColor).xyz,1.0);
}`