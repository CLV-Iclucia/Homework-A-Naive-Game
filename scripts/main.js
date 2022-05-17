const gl=canvas.getContext("webgl2"); 
let view=mat4.create(),Width,Height;
let proj=mat4.create();
const lightView=mat4.create();
mat4.lookAt(lightView,vec3.clone([40,16,16]),vec3.clone([-40.0,-16.0,-16.0]),vec3.clone([0.0,1.0,0.0]));
mat4.perspective(proj,45*Math.PI/180.0,canvas.width/canvas.height,0.1,100.0);
let cameraPos=vec3.create(),cameraFront=vec3.create(),cameraUp=vec3.create();
let deltaFrame,dashEndFrame=0,velocity=0,tmp=vec3.create(),dashDir=vec3.create(),ATKEndFrame,ATKopt;
let bossModel=mat4.create();
let inAir=false;
let stamina=-0.5;
cameraPos=[0.0,0.0,2.0];
cameraFront=[0.0,0.0,-1.0];
cameraUp=[0.0,1.0,0.0];
const SkyBoxShader=initShader(gl,SkyBoxVertexShader,SkyBoxFragmentShader);
const BossShader=initShader(gl,BossVertexShader,BossFragmentShader);
const FloorShader=initShader(gl,FloorVertexShader,FloorFragmentShader);
const SkyBoxTex=initSkyBoxTexture(gl);
const SkyBoxVAO=initModel(gl,SkyBoxShader,SkyBoxVer,BoxIdx);
const SwordShader=initShader(gl,SwordVertexShader,SwordFragmentShader);
const SwordVAO=initModel(gl,SwordShader,SwordVer,SwordIdx);
const BossVAO=initModel(gl,BossShader,BossHeadVer,BossHeadIdx);
const FloorVAO=initModel(gl,FloorShader,FloorVer,BarIdx);
const ShadowShader=initShader(gl,ShadowVertexShader,ShadowFragmentShader);
const BossVAO_S=initModel(gl,ShadowShader,BossHeadVer,BossHeadIdx);
const FloorVAO_S=initModel(gl,ShadowShader,FloorVer,BarIdx);
const ShadowFBO=initFrameBuffer(gl);
const BossHeadTex=initTex(gl,"head");
const FloorTex=initTex(gl,"floor");
function Reset() 
{
    canvas.height= document.documentElement.clientHeight;
    canvas.width = document.documentElement.clientWidth; 
	Width=canvas.width;
	Height=canvas.height;
    gl.viewport(0,0,canvas.width,canvas.height);
}
function processInput(currentFrame)
{
    let dir=vec3.create(),vdir=vec3.create();
	dir=[cameraFront[0],0,cameraFront[2]]; 
	dir[1]=0.0;
	vdir=[0.0,1.0,0.0];
    vec3.normalize(dir,dir);
	vec3.cross(vdir,vdir,dir);
	let spd = 2.5*deltaFrame;
    if(currentFrame >= dashEndFrame)//冲刺阶段不能处理平面移动
	{
		spd = 2.5*deltaFrame;
		if (W)vec3.scaleAndAdd(cameraPos,cameraPos,dir,spd);
		if (S)vec3.scaleAndAdd(cameraPos,cameraPos,dir,-spd);
		if (A)vec3.scaleAndAdd(cameraPos,cameraPos,vdir,spd);
		if (D)vec3.scaleAndAdd(cameraPos,cameraPos,vdir,-spd);
		if(cameraPos[0]< -35.5)cameraPos[0]=-35.5;
		if(cameraPos[0]>35.5)cameraPos[0]=35.5;
		if(cameraPos[2]< -35.5)cameraPos[2]=-35.5;
		if(cameraPos[2]>35.5)cameraPos[2]=35.5;
	}
	else
	{
		spd = 10.0*deltaFrame;
        vec3.scaleAndAdd(cameraPos,cameraPos,dashDir,spd);
		if(cameraPos[0]< -35.5)cameraPos[0]=-35.5;
		if(cameraPos[0]>35.5)cameraPos[0]=35.5;
		if(cameraPos[2]< -35.5)cameraPos[2]=-35.5;
		if(cameraPos[2]>35.5)cameraPos[2]=35.5;
	}
	if (SPACE)
	{
		if (!inAir)
		{
			inAir = true;
			velocity = 50.0;
		}
	}
	if (LSHIFT)
	{
		if(stamina>=-0.8&&currentFrame>=dashEndFrame)
		{
			dashEndFrame = currentFrame + 0.3;
			dashDir=[0.0,0.0,0.0];
			if (W)vec3.add(dashDir,dashDir,dir);
			if (S)vec3.subtract(dashDir,dashDir,dir);
			if (A)vec3.add(dashDir,dashDir,vdir);
			if (D)vec3.subtract(dashDir,dashDir,vdir);
			if (vec3.equals(dashDir,[0.0,0.0,0.0]))dashDir=dir;
			else vec3.normalize(dashDir,dashDir);
			if(cameraPos[0]< -35.5)cameraPos[0]=-35.5;
			if(cameraPos[0]>35.5)cameraPos[0]=35.5;
			if(cameraPos[2]< -35.5)cameraPos[2]=-35.5;
			if(cameraPos[2]>35.5)cameraPos[2]=35.5;
			// stamina -= 0.1;
		}
	}
	if (MLB)
	{
		if (currentFrame > ATKEndFrame)//更新攻击结束帧
		{
			ATKEndFrame=currentFrame+0.3;
			if(currentFrame<ATKEndFrame+0.2)ATKopt^=1;
			else ATKopt=0;
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
function renderObject(Shader,UniVar,VAO,tot)//传入着色器程序，uniform变量列表，顶点数组对象VAO和三角面个数tot来绘制对象
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
	gl.bindVertexArray(VAO);
    gl.drawElements(gl.TRIANGLES,tot,gl.UNSIGNED_SHORT,0);//统一使用顶点索引绘制
	gl.bindVertexArray(null);
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
	//const BarShader=initShader(gl,BarVertexShader,BarFragmentShader);
	//const HPVAO=initModel(gl,BarShader,HPver,BarIdx);
	//const SPVAO=initModel(gl,BarShader,SPver,BarIdx);
    let lastFrame=0;
	ATKEndFrame=0;
	ATKopt=1;
	console.log("Start Game Loop");
    function render(currentFrame)
    {
        currentFrame*=0.001;
        deltaFrame=currentFrame-lastFrame;
        lastFrame=currentFrame;
        processInput(currentFrame);
        mat4.lookAt(view,cameraPos,vec3.add(tmp,cameraPos,cameraFront),cameraUp);
		gl.bindFramebuffer(gl.FRAMEBUFFER,ShadowFBO);
		gl.clearColor(0.0,0.0,0.0,1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		const Var=[['mat4',lightView],['mat4',proj],['mat4',mat4.create()]];
		render2FBO(gl,BossVAO_S,ShadowShader,Var,36);
		render2FBO(gl,FloorVAO_S,ShadowShader,Var,6);
		gl.bindFramebuffer(gl.FRAMEBUFFER,null);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		const SkyBoxVar=[['mat4',view],['mat4',proj],['sampler',SkyBoxTex]];
		const swordModel=initSwdModel(currentFrame);
		const SwordVar=[['mat4',proj],['mat4',swordModel]];
		const bossModel=mat4.create();
		const BossVar=[['mat4',view],['mat4',proj],['mat4',bossModel],['sampler',1],
						['vec3',cameraFront],['vec3',cameraPos],['vec3',[40,16,16]],['vec3',[1.0,0.0,0.0]]];
		const FloorVar=[['mat4',view],['mat4',proj],['sampler',2],
						['vec3',cameraFront],['vec3',cameraPos],['vec3',[40,16,16]],['vec3',[1.0,0.0,0.0]]];
						//gl.bufferSubData();
		//gl.bufferSubData();
		renderObject(SwordShader,SwordVar,SwordVAO,558);
		renderObject(BossShader,BossVar,BossVAO,36);
		renderObject(FloorShader,FloorVar,FloorVAO,6);
		renderObject(SkyBoxShader,SkyBoxVar,SkyBoxVAO,36);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}