function Reset()
{
    canvas.height= document.documentElement.clientHeight;
    canvas.width = document.documentElement.clientWidth; 
    gl.viewport(0,0,canvas.width,canvas.height);
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
function MoveSwd(currentTime)//移动剑，顺便移动剑尖和剑身上的碰撞箱
{
	let model=mat4.create();
	if(ending==DIE)
	{
		mat4.set(model,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
		return model;
	}
	let isAttacking=false;
	if (currentTime <= ATKEndFrame)//攻击状态
	{
		if(currentTime>=ATKEndFrame-0.3)
		{
			const theta = ATKEndFrame - currentTime;
			if(!ATKopt)
			{
				model = mat4.translate(model,model, vec3.fromValues(-0.1, -0.2, -0.2));
				model = mat4.rotate(model,model, -45.0*Math.PI/180, vec3.fromValues(0.0,0.0,1.0));
				model = Rotate(model,vec3.fromValues(0.0,-0.5,0.0),10*(0.3-theta), vec3.fromValues(-1.0,0.0,0.0));
				isAttacking=true;
			}
			else
			{
				model = mat4.translate(model,model, vec3.fromValues(0.1, 0.0, -0.2));
				model = mat4.rotate(model,model, 110.0*Math.PI/180, vec3.fromValues(0.0, 0.0, 1.0));
				model = Rotate(model,vec3.fromValues(0.0,-0.5,0.0),10*( 0.3 - theta), vec3.fromValues(-1.0,0.0,0.0));
				isAttacking=true;
			}
		}
		else
		{
			mat4.set(model,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
			CVM.update(SwdBladeCV,vec2.fromValues(cameraPos[0],cameraPos[2]),-2.0);
			CVM.update(SwdTipCV,vec2.fromValues(cameraPos[0],cameraPos[2]),-2.0);
		}
	}
	else 
	{
		model = mat4.translate(model,model, vec3.fromValues(0.3, -0.2, -0.5));//结束了第二刀，处于未攻击状态
		CVM.update(SwdBladeCV,vec2.fromValues(cameraPos[0],cameraPos[2]),-2.0);
		CVM.update(SwdTipCV,vec2.fromValues(cameraPos[0],cameraPos[2]),-2.0);
		ATKopt=1;
	}
	mat4.scale(model,model,vec3.fromValues(0.05,0.05,0.05));
	if(isAttacking)
	{
		const viewInvMatrix=mat4.viewInv(cameraPos,cameraFront);
		const transform=mat4.create();
		mat4.multiply(transform,viewInvMatrix,model);
		const TipV=vec4.fromValues(0.0,6.4,0.0,1.0);
		const BladeV=vec4.fromValues(0.0,3.2,0.0,1.0);
		mat4.mulV(TipV,transform,TipV);
		mat4.mulV(BladeV,transform,BladeV);
		CVM.update(SwdTipCV,vec2.fromValues(TipV[0],TipV[2]),TipV[1]);
		CVM.update(SwdBladeCV,vec2.fromValues(BladeV[0],BladeV[2]),BladeV[1]);
	}
	return model;
}
function Exit()
{
	BGM.pause();
	const ReturnButton=document.getElementById("Return");
	ReturnButton.hidden=false;
	document.exitPointerLock();
}
function main()
{
    Reset();
    if (!gl) 
    {
        alert("无法初始化WebGL,你的浏览器、操作系统或硬件等可能不支持WebGL。");
        return;
    }
    let lastFrame=0;
	console.log("Start Game Loop");
	const ShadowShader=initShader(gl,ShadowVertexShader,ShadowFragmentShader);
	const BossVAO_S=initModel(gl,ShadowShader,BossHeadVer,BossHeadIdx,8);
	const FloorVAO_S=initModel(gl,ShadowShader,FloorVer,BarIdx,5);
	const ShadowFBO=initFrameBuffer(gl);
	console.log(BGM.src);
	canvas.requestPointerLock = canvas.requestPointerLock ||window.mozRequestPointerLock;
    canvas.requestPointerLock();
	BGM.play();
    function gameLoop(currentTime)
    {
        currentTime*=0.001;
        deltaFrame=currentTime-lastFrame;
        lastFrame=currentTime;
		stamina+=deltaFrame*0.04;
		if(stamina>=1.0)stamina=1.0;
        if(HP>0.0)processInput(currentTime);
		const swordModel=MoveSwd(currentTime);
		if(BossHP>0.0)runBossAI(currentTime);
		EyePos[0]=BossPos[0];
		EyePos[1]=BossPos[1]+2.0;
		EyePos[2]=BossPos[2];
        CVM.update(BossCV,vec2.fromValues(BossPos[0],BossPos[2]),BossPos[1]);
		PlayerCV.setPos(vec2.fromValues(cameraPos[0],cameraPos[2]));
		PlayerCV.setY(cameraPos[1]-1.0);
		CVM.DetectCollision(currentTime,PlayerCV);
		if(HP<0.0)
		{
			HP=0.0;
			ending=DIE;
		}
		if(ending)
		{
			if(ending==DIE)
			{
				lightColor[0]-=0.2*deltaFrame;
				lightColor[1]-=0.2*deltaFrame;
				lightColor[2]-=0.2*deltaFrame;
				if(lightColor[0]<0.0&&lightColor[1]<0.0&&lightColor[2]<0.0)
				{
					const DieImg=document.getElementById("die");
					DieImg.hidden=false;
					Exit();
					return ;
				}
			}
			else
			{
				BossPos[1]-=0.2*deltaFrame;
				lightColor[0]+=0.2*deltaFrame;
				lightColor[1]+=0.2*deltaFrame;
				lightColor[2]+=0.2*deltaFrame;
				if(lightColor[0]>1.0&&lightColor[1]>1.0&&lightColor[2]>1.0)
				{
					const VictoryImg=document.getElementById("victory");
					VictoryImg.hidden=false;
					Exit();
					return ;
				}
			}
		}
		if(currentTime>BossunhurtTime)
		{
			if(SwdTipCV.Collide(BossCV)||SwdBladeCV.Collide(BossCV))
			{
				BossHP-=0.05*phase;
				BossunhurtTime=currentTime+0.25;
				if(BossHP<1.0)phase=2;
			}
		}
		if(BossHP<0.0)
		{
			BossHP=0.0;
			ending=VICTORY;
		}
		cameraPos[0]=PlayerCV.pos[0];
		cameraPos[1]=PlayerCV.y+1.0;
		cameraPos[2]=PlayerCV.pos[1];
		mat4.lookAt(lightView,lightPos,BossPos,vec3.fromValues(0.0,1.0,0.0));
        mat4.lookAt(view,cameraPos,vec3.add(tmp,cameraPos,cameraFront),cameraUp);
		gl.bindFramebuffer(gl.FRAMEBUFFER,ShadowFBO);
		gl.viewport(0,0,canvas.width,canvas.height);
		gl.clearColor(0.0,0.0,0.0,1.0);
		gl.clear(gl.COLOR_BUFFER5_BIT|gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		const Var=[['mat4',lightView],['mat4',lightProj],['mat4',Identity]];
		renderObject(ShadowShader,Var,FloorVAO_S,6,ShadowFBO.texture);
		Var[2]=['mat4',BossModel];
		renderObject(ShadowShader,Var,BossVAO_S,36,ShadowFBO.texture);
		gl.bindFramebuffer(gl.FRAMEBUFFER,null);
		gl.viewport(0,0,canvas.width,canvas.height);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		const EyeModel=mat4.create();
		mat4.set(EyeModel,BossDir[0],0.0,BossDir[1],0.0,0.0,1.0,0.0,0.0,-BossDir[1],0.0,BossDir[0],0.0,EyePos[0],EyePos[1],EyePos[2],1.0);
		let EyesVar=[['mat4',mat4.create()],['mat4',view],['mat4',proj],['sampler',0]];
		for(let i=0;i<16;i++)
		{
			EyesVar[3][1]=Eyestex[i];
			mat4.translate(EyesVar[0][1],EyeModel,EyesPos[i]);
			mat4.scale(EyesVar[0][1],EyesVar[0][1],vec3.fromValues(0.5,0.5,0.5));
			renderObject(BulletsShader,EyesVar,BulletsVAO,36);
		}
		const SkyBoxVar=[['mat4',view],['mat4',proj],['sampler',SkyBoxTex]];
		const SwordVar=[['mat4',proj],['mat4',swordModel]];
		const BossVar=[['mat4',view],['mat4',proj],['mat4',BossModel],['sampler',BossHeadTex],
						['vec3',cameraPos],['vec3',lightPos],['vec3',lightColor]];
		const FloorVar=[['mat4',view],['mat4',lightView],['mat4',proj],['mat4',lightProj],['sampler',FloorTex],['sampler',TexCnt-1],['sampler',NormalMap],
						['vec3',cameraFront],['vec3',cameraPos],['vec3',lightPos],['vec3',lightColor],['vec2',[1.0/canvas.width,1.0/canvas.height]]];
		const EyeVar=[['mat4',EyeModel],['mat4',view],['mat4',proj],['sampler',EyeTex]];
		mat4.scale(BarModel,BarModelBase,vec3.fromValues(stamina,1.0,1.0));
		const BarVar=[['mat4',BarModel],['vec3',vec3.fromValues(0.0,0.8,0.4)]];
		renderObject(BarShader,BarVar,SPVAO,6);
		BarVar[1][1]=vec3.fromValues(1.0,1.0,1.0);
		mat4.scale(BarModel,BarModelBase,vec3.fromValues(HP,1.0,1.0))
		renderObject(BarShader,BarVar,HPVAO,6);
		mat4.scale(BarModel,BossBarModelBase,vec3.fromValues(BossHP,1.0,1.0));
		BarVar[1][1]=vec3.fromValues(1.0,0.0,0.0);
		renderObject(BarShader,BarVar,HPVAO,6);
		renderCircle(currentTime);
		processLaser(currentTime);
		processThorn(currentTime);
		processBullets(currentTime);
		renderObject(SwordShader,SwordVar,SwordVAO,558);
		renderObject(BossShader,BossVar,BossVAO,36);
		renderObject(BulletsShader,EyeVar,BulletsVAO,36);
		renderObject(FloorShader,FloorVar,FloorVAO,6,ShadowFBO.texture);
		renderObject(SkyBoxShader,SkyBoxVar,SkyBoxVAO,36);
		requestAnimationFrame(gameLoop);
    }
    requestAnimationFrame(gameLoop);
}