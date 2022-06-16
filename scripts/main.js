const gl=canvas.getContext("webgl2"); 
function Reset()
{
    canvas.height= document.documentElement.clientHeight;
    canvas.width = document.documentElement.clientWidth; 
    gl.viewport(0,0,canvas.width,canvas.height);
}
let view=mat4.create();
let proj=mat4.create(),lightProj=mat4.create();
const lightView=mat4.create();
const lightPos=vec3.fromValues(40,16,16),lightColor=vec3.fromValues(0.6,0.0,0.0);
mat4.perspective(proj,45*Math.PI/180.0,canvas.width/canvas.height,0.1,100.0);
mat4.perspective(lightProj,45*Math.PI/180.0,canvas.width/canvas.height,5.0,100.0);
let cameraPos=vec3.fromValues(0.0,0.0,2.0),cameraFront=vec3.fromValues(0.0,0.0,-1.0),cameraUp=vec3.fromValues(0.0,1.0,0.0);
let deltaFrame,dashEndFrame=0,velocity=0,tmp=vec3.create(),dashDir=vec3.create(),ATKEndFrame,ATKopt;
let bossModel=mat4.create();
let inAir=false;
let stamina=1.0,HP=1.0;
let BossPos=vec3.fromValues(0.0,0.0,0.0),BossDir=0;
let BarModelBase=mat4.create(),BarModel=mat4.create();
mat4.translate(BarModelBase,BarModelBase,vec3.fromValues(-0.9,0.0,0.0));
let phase=1;
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
const PlayerCV=new CollisionVolume(0,vec2.fromValues(cameraPos[0],cameraPos[2]),-1.0,0.5,1.0);
const CVM=new CVManager();
let CircleQ=new Queue();//这些队列都用于存放并管理特效
let CylinderQ=new Queue();
let ConeQ=new Queue();
function processInput(currentFrame)
{
    let dir=vec3.fromValues(cameraFront[0],0.0,cameraFront[2]),vdir=vec3.fromValues(0.0,1.0,0.0);
    vec3.normalize(dir,dir);
	vec3.cross(vdir,vdir,dir);
	let spd = 4.5*deltaFrame;
    if(currentFrame >= dashEndFrame)//冲刺阶段不能处理平面移动
	{
		if (W)vec3.scaleAndAdd(cameraPos,cameraPos,dir,spd);
		if (S)vec3.scaleAndAdd(cameraPos,cameraPos,dir,-spd);
		if (A)vec3.scaleAndAdd(cameraPos,cameraPos,vdir,spd);
		if (D)vec3.scaleAndAdd(cameraPos,cameraPos,vdir,-spd);
		if(cameraPos[0]< -BOUND)cameraPos[0]=-BOUND;
		if(cameraPos[0]>BOUND)cameraPos[0]=BOUND;
		if(cameraPos[2]< -BOUND)cameraPos[2]=-BOUND;
		if(cameraPos[2]>BOUND)cameraPos[2]=BOUND;
	}
	else
	{
		spd = 10.0*deltaFrame;
        vec3.scaleAndAdd(cameraPos,cameraPos,dashDir,spd);
		if(cameraPos[0]< -BOUND)cameraPos[0]=-BOUND;
		if(cameraPos[0]>BOUND)cameraPos[0]=BOUND;
		if(cameraPos[2]< -BOUND)cameraPos[2]=-BOUND;
		if(cameraPos[2]>BOUND)cameraPos[2]=BOUND;
	}
	if (SPACE)
	{
		if (stamina>=0.1 &&!inAir)
		{
			inAir = true;
			velocity = 45.0;
			stamina-=0.1;
		}
	}
	if (LSHIFT)
	{
		if(stamina>=0.1&&currentFrame>=dashEndFrame)
		{
			dashEndFrame = currentFrame + 0.3;
			dashDir=[0.0,0.0,0.0];
			if (W)vec3.add(dashDir,dashDir,dir);
			if (S)vec3.subtract(dashDir,dashDir,dir);
			if (A)vec3.add(dashDir,dashDir,vdir);
			if (D)vec3.subtract(dashDir,dashDir,vdir);
			if (vec3.equals(dashDir,[0.0,0.0,0.0]))dashDir=dir;
			else vec3.normalize(dashDir,dashDir);
			if(cameraPos[0]< -BOUND)cameraPos[0]=-BOUND;
			if(cameraPos[0]>BOUND)cameraPos[0]=BOUND;
			if(cameraPos[2]< -BOUND)cameraPos[2]=-BOUND;
			if(cameraPos[2]>BOUND)cameraPos[2]=BOUND;
			stamina -= 0.1;
		}
	}
	if (MLB)
	{
		if (stamina>=0.1&&currentFrame > ATKEndFrame)//更新攻击结束帧
		{
			ATKEndFrame=currentFrame+0.3;
			if(currentFrame<ATKEndFrame+0.2)ATKopt^=1;
			else ATKopt=0;
			stamina-=0.1;
		}
	}
	if (inAir)
	{
        vec3.add(cameraPos,cameraPos,vec3.scale(tmp,cameraUp,0.2*velocity*deltaFrame));
		velocity -= 1.5;
		if (cameraPos[1] <= 0.0)
		{
			cameraPos[1] = 0.0;
			inAir = 0;
		}
    }
}
function renderObject(Shader,UniVar,VAO,tot,Tex=null)//传入着色器程序，uniform变量列表，顶点数组对象VAO和三角面个数tot来绘制对象
{
	gl.useProgram(Shader.shader);
	for(let i=0;i<UniVar.length;i++)
	{
		const u=UniVar[i];
		if(u[0]=='mat4')gl.uniformMatrix4fv(Shader.UniLoc[i],false,u[1]);
		else if(u[0]=='mat3')gl.uniformMatrix3fv(Shader.UniLoc[i],false,u[1]);
		else if(u[0]=='vec4')gl.uniform4f(Shader.UniLoc[i],u[1][0],u[1][1],u[1][2],u[1][3]);
		else if(u[0]=='vec3')gl.uniform3f(Shader.UniLoc[i],u[1][0],u[1][1],u[1][2]);
		else if(u[0]=='vec2')gl.uniform2f(Shader.UniLoc[i],u[1][0],u[1][1]);
		else gl.uniform1i(Shader.UniLoc[i],u[1]);
	}
	gl.bindTexture(gl.TEXTURE_2D,Tex);
	gl.bindVertexArray(VAO);
    gl.drawElements(gl.TRIANGLES,tot,gl.UNSIGNED_SHORT,0);//统一使用顶点索引绘制
	gl.bindVertexArray(null);
	gl.bindTexture(gl.TEXTURE_2D,null);
}
function Rotate(M,p,theta,A)//使得物体绕着自身坐标系中的p点A轴旋转，p为零向量时等效于glm的rotate
{
	M = mat4.rotate(M, M, theta,A);//注意这种情况下是先旋转再平移
	p[0]=-p[0];
	p[1]=-p[1];
	p[2]=-p[2];
	M = mat4.translate(M,M,p);
	return M;
}
function initSwdModel(currentFrame)
{
	let model=mat4.create();
	if (currentFrame <= ATKEndFrame)//攻击状态
	{
		if(currentFrame>=ATKEndFrame-0.3)
		{
			const theta = ATKEndFrame - currentFrame;
			if(!ATKopt)
			{
				model = mat4.translate(model,model, vec3.clone([-0.1, -0.2, -0.2]));
				model = mat4.rotate(model,model, -45.0*Math.PI/180, vec3.clone([0.0,0.0,1.0]));
				model = Rotate(model,vec3.clone([0.0,-0.5,0.0]),10*(0.3-theta), vec3.clone([-1.0,0.0,0.0]));
			}
			else
			{
				model = mat4.translate(model,model, vec3.clone([0.1, 0.0, -0.2]));
				model = mat4.rotate(model,model, 110.0*Math.PI/180, vec3.clone([0.0, 0.0, 1.0]));
				model = Rotate(model,vec3.clone([0.0,-0.5,0.0]),10*( 0.3 - theta), vec3.clone([-1.0,0.0,0.0]));
			}
		}
		else mat4.set(model,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
	}
	else 
	{
		model = mat4.translate(model,model, vec3.clone([0.3, -0.2, -0.5]));//结束了第二刀，处于未攻击状态
		ATKopt=1;
	}
	mat4.scale(model,model,vec3.clone([0.05,0.05,0.05]));
	return model;
}
function main()
{
    Reset();
    if (!gl) 
    {
        alert("无法初始化WebGL，你的浏览器、操作系统或硬件等可能不支持WebGL。");
        return;
    }
    let lastFrame=0;
	ATKEndFrame=0;
	ATKopt=1;
	console.log("Start Game Loop");
	const ShadowShader=initShader(gl,ShadowVertexShader,ShadowFragmentShader);
	const BossVAO_S=initModel(gl,ShadowShader,BossHeadVer,BossHeadIdx,8);
	const FloorVAO_S=initModel(gl,ShadowShader,FloorVer,BarIdx,5);
	const ShadowFBO=initFrameBuffer(gl);
    function gameLoop(currentFrame)
    {
        currentFrame*=0.001;
        deltaFrame=currentFrame-lastFrame;
        lastFrame=currentFrame;
		stamina+=deltaFrame*0.1;
		if(stamina>=1.0)stamina=1.0;
        processInput(currentFrame);
		PlayerCV.setPos(vec2.fromValues(cameraPos[0],cameraPos[2]));
		PlayerCV.setY(cameraPos[1]);
		CVM.DetectCollision(PlayerCV);
		cameraPos=vec3.fromValues(PlayerCV.getPos()[0],PlayerCV.getY(),PlayerCV.getPos()[1]);
		if(HP<0.0)HP=0.0;
		BossDir+=Math.random()*0.02;
		let BossFront=vec3.fromValues(Math.cos(BossDir),0.0,Math.sin(BossDir));
		mat4.lookAt(lightView,vec3.scaleAndAdd(tmp,BossPos,lightPos,0.5),BossPos,vec3.clone([0.0,1.0,0.0]));
        mat4.lookAt(view,cameraPos,vec3.add(tmp,cameraPos,cameraFront),cameraUp);
		const bossModel=mat4.create();
		mat4.translate(bossModel,bossModel,BossPos);
		mat4.rotate(bossModel,bossModel,BossDir,vec3.fromValues(0.0,1.0,0.0));
		gl.bindFramebuffer(gl.FRAMEBUFFER,ShadowFBO);
		gl.viewport(0,0,canvas.width,canvas.height);
		gl.clearColor(0.0,0.0,0.0,1.0);
		gl.clear(gl.COLOR_BUFFER5_BIT|gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		const Var=[['mat4',lightView],['mat4',lightProj],['mat4',mat4.create()]];
		renderObject(ShadowShader,Var,FloorVAO_S,6,ShadowFBO.texture);
		Var[2]=['mat4',bossModel];
		renderObject(ShadowShader,Var,BossVAO_S,36,ShadowFBO.texture);
		gl.bindFramebuffer(gl.FRAMEBUFFER,null);
		gl.viewport(0,0,canvas.width,canvas.height);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		const SkyBoxVar=[['mat4',view],['mat4',proj],['sampler',SkyBoxTex]];
		const swordModel=initSwdModel(currentFrame);
		const SwordVar=[['mat4',proj],['mat4',swordModel]];
		const BossVar=[['mat4',view],['mat4',proj],['mat4',bossModel],['sampler',BossHeadTex],
						['vec3',cameraFront],['vec3',cameraPos],['vec3',lightPos],['vec3',lightColor]];
		const FloorVar=[['mat4',view],['mat4',lightView],['mat4',proj],['mat4',lightProj],['sampler',FloorTex],['sampler',TexCnt-1],['sampler',NormalMap],
						['vec3',cameraFront],['vec3',cameraPos],['vec3',lightPos],['vec3',lightColor],['vec2',[1.0/canvas.width,1.0/canvas.height]]];
		mat4.scale(BarModel,BarModelBase,vec3.fromValues(stamina,1.0,1.0));
		const BarVar=[['mat4',BarModel],['vec3',vec3.fromValues(0.0,0.8,0.4)]];
		renderObject(BarShader,BarVar,SPVAO,6);
		BarVar[1][1]=vec3.fromValues(1.0,1.0,1.0);
		mat4.scale(BarModel,BarModelBase,vec3.fromValues(HP,1.0,1.0))
		renderObject(BarShader,BarVar,HPVAO,6);
		runBossAI(currentFrame);
		renderCircle(currentFrame);
		processLaser(currentFrame);
		processThorn(currentFrame);
		renderObject(SwordShader,SwordVar,SwordVAO,558);
		renderObject(BossShader,BossVar,BossVAO,36);
		renderObject(FloorShader,FloorVar,FloorVAO,6,ShadowFBO.texture);
		renderObject(SkyBoxShader,SkyBoxVar,SkyBoxVAO,36);
		vec3.scaleAndAdd(BossPos,BossPos,BossFront,0.05);
        requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}