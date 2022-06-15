const CircleVertexShader=
`attribute vec3 vPos;
attribute vec2 vTexCoord;
uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;
varying highp vec2 aTexCoord;
void main()
{
    gl_Position=proj*view*model*vec4(vPos.xyz,1.0);
    aTexCoord=vTexCoord;
}
`
const CircleFragmentShader=
`varying highp vec2 aTexCoord;
uniform sampler2D myTex;
void main()
{
    highp vec4 color=texture2D(myTex,aTexCoord);
    if(color.w<0.75)discard;
    gl_FragColor=color;
}`