const gl=canvas.getContext("webgl2");
const SkyBoxShader=initShader(gl,SkyBoxVertexShader,SkyBoxFragmentShader);
const BossShader=initShader(gl,BossVertexShader,BossFragmentShader);
const FloorShader=initShader(gl,FloorVertexShader,FloorFragmentShader);
const SkyBoxTex=initSkyBoxTexture(gl);
const SkyBoxVAO=initModel(gl,SkyBoxShader,SkyBoxVer,BoxIdx,3);
const SwordShader=initShader(gl,SwordVertexShader,SwordFragmentShader);
const SwordVAO=initModel(gl,SwordShader,SwordVer,SwordIdx,6);
const BossVAO=initModel(gl,BossShader,BossHeadVer,BossHeadIdx,8);
const FloorVAO=initModel(gl,FloorShader,FloorVer,BarIdx,5);
const BossHeadTex=initTex(gl,"head",true);
const FloorTex=initTex(gl,"floor",true);
const NormalMap=initTex(gl,"norm",false);
const CircleShader=initShader(gl,CircleVertexShader,CircleFragmentShader);
const CircleVAO=initModel(gl,CircleShader,TexSq,BarIdx,5);
const CircleTex=initTex(gl,"ring",true);
const LaserShader=initShader(gl,LaserVertexShader,LaserFragmentShader);
const LaserVAO=initModel(gl,LaserShader,Cylinder,CylinderIdx,3);
const ThornShader=initShader(gl,ThornVertexShader,ThornFragmentShader);
const ThornVAO=initModel(gl,ThornShader,Cone,ConeIdx,6);
const BarShader=initShader(gl,BarVertexShader,BarFragmentShader);
const HPVAO=initModel(gl,BarShader,HPver,BarIdx,3);
const SPVAO=initModel(gl,BarShader,SPver,BarIdx,3);
const EyeTex=initTex(gl,"eye",true);
const LEyeTex=initTex(gl,"Leye",true);
const REyeTex=initTex(gl,"Reye",true);
const BulletsShader=initShader(gl,CircleVertexShader,BulletsFragmentShader);
const BulletsVAO=initModel(gl,BulletsShader,BulletsVer,BulletsIdx,5);//其实这也不止用来渲染子弹，因为子弹和眼睛的渲染原理一模一样所以换个纹理就可以渲染眼睛
let Eyestex=new Array(16);//再放8个眼睛...让Boss丑一点
for(let i=0;i<16;i++)
{
    const opt=Math.floor(Math.random()*3);
    if(!opt)Eyestex[i]=EyeTex;
    else if(opt==1)Eyestex[i]=LEyeTex;
    else Eyestex[i]=REyeTex;
}