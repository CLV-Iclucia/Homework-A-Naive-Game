//用于游戏逻辑运转的变量在此定义
const canvas=document.querySelector("#glcanvas");
const Identity=mat4.create();
let view=mat4.create();
let proj=mat4.create(),lightProj=mat4.create();
const lightView=mat4.create();
const lightPos=vec3.fromValues(40,16,16),lightColor=vec3.fromValues(0.6,0.0,0.0);
mat4.perspective(proj,45*Math.PI/180.0,canvas.width/canvas.height,0.1,100.0);
mat4.perspective(lightProj,45*Math.PI/180.0,canvas.width/canvas.height,5.0,100.0);
const cameraPos=vec3.fromValues(0.0,0.0,1.0),cameraFront=vec3.fromValues(0.0,0.0,-1.0),cameraUp=vec3.fromValues(0.0,1.0,0.0);
let deltaFrame=0.0,dashEndFrame=0,velocity=0,tmp=vec3.create(),dashDir=vec3.create(),ATKEndFrame=0.0,ATKopt=1,unhurtTime=0.0;
let BossunhurtTime=0.0;
const BossModel=mat4.create();
let inAir=false;
let stamina=1.0,HP=1.0;
const BossPos=vec3.fromValues(0.0,-1.0,0.0),BossDir=vec2.fromValues(1.0,0.0),BossMovDir=vec2.fromValues(1.0,0.0),BossRotDir=vec2.fromValues(0,1.0);
let BossMovSpd=0.01,BossRotSpd=0.1;
let lastAIRefreshTime=0.0;
const BarModelBase=mat4.create(),BarModel=mat4.create(),BossBarModelBase=mat4.create();
mat4.translate(BarModelBase,BarModelBase,vec3.fromValues(-0.9,0.0,0.0));
mat4.translate(BossBarModelBase,BossBarModelBase,vec3.fromValues(-0.5,-1.5,0.0));
let phase=1;
let BossHP=2.0;
const EyeDir=vec3.create(),EyePos=vec3.create();
const BGM=document.getElementById("BGM");
let EyesPos=new Array(16);
for(let i=0;i<16;i++)
{
    let dx=Math.random()*2-1.0;
    let dy=Math.random()*2-1.0;
    let dz=Math.random()*2-1.0;
    EyesPos[i]=vec3.fromValues(dx,dy,dz);
    vec3.normalize(EyesPos[i],EyesPos[i]);
}