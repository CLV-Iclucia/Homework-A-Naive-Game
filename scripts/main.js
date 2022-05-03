const gl=canvas.getContext("webgl2"); 
let view=mat4.create();
let proj=mat4.create();
mat4.perspective(proj,45*Math.PI/180.0,canvas.width/canvas.height,0.1,100.0);
let cameraPos=vec3.create(),cameraFront=vec3.create(),cameraUp=vec3.create();
let deltaFrame,dashEndFrame=0,velocity=0,tmp=vec3.create(),dashDir=vec3.create(),ATKEndFrame;
let inAir=false;
let stamina=-0.5;
cameraPos=[0.0,0.0,2.0];
cameraFront=[0.0,0.0,-1.0];
cameraUp=[0.0,1.0,0.0];
function Reset() 
{
    canvas.height= document.documentElement.clientHeight;
    canvas.width = document.documentElement.clientWidth; 
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
		if(cameraPos[0]< -9.5)cameraPos[0]=-9.5;
		if(cameraPos[0]>9.5)cameraPos[0]=9.5;
		if(cameraPos[2]< -9.5)cameraPos[2]=-9.5;
		if(cameraPos[2]>9.5)cameraPos[2]=9.5;
	}
	else
	{
		spd = 10.0*deltaFrame;
        vec3.scaleAndAdd(cameraPos,cameraPos,dashDir,spd);
		if(cameraPos[0]< -9.5)cameraPos[0]=-9.5;
		if(cameraPos[0]>9.5)cameraPos[0]=9.5;
		if(cameraPos[2]< -9.5)cameraPos[2]=-9.5;
		if(cameraPos[2]>9.5)cameraPos[2]=9.5;
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
			if(cameraPos[0]< -9.5)cameraPos[0]=-9.5;
			if(cameraPos[0]>9.5)cameraPos[0]=9.5;
			if(cameraPos[2]< -9.5)cameraPos[2]=-9.5;
			if(cameraPos[2]>9.5)cameraPos[2]=9.5;
		//	stamina -= 0.1;
		}
	}
	if (MLB)
	{
		if (currentFrame > ATKEndFrame)
		{
			if (currentFrame <= ATKEndFrame + 0.2&&contATKEndFrame<ATKEndFrame)
                contATKEndFrame = ATKEndFrame + 0.5;
			else if(currentFrame>contATKEndFrame+0.2)ATKEndFrame = currentFrame + 0.3;
		}
	}
}
function renderSkyBox(Shader,Tex,VAO)
{
	gl.useProgram(Shader.shader);
    gl.uniformMatrix4fv(Shader.UniLoc.view,false,view);
	gl.uniformMatrix4fv(Shader.UniLoc.proj,false,proj);
    gl.uniform1i(Shader.UniLoc.myTex,Tex);
	gl.bindVertexArray(VAO);
    gl.drawElements(gl.TRIANGLES,36,gl.UNSIGNED_SHORT,0);
}
function main()
{
    Reset();
    if (!gl) 
    {
        alert("无法初始化WebGL，你的浏览器、操作系统或硬件等可能不支持WebGL。");
        return;
    }
    const SkyBoxShader=initShader(gl,SkyBoxVertexShader,SkyBoxFragmentShader,false);
    const SkyBoxTex=initSkyBoxTexture(gl);
	const SkyBoxVAO=initModel(gl,SkyBoxShader,SkyBoxVer,BoxIdx);
	const SwordShader=initShader(gl,SwordVertexShader,SwordFragmentShader,true);
	const SwordVAO=initModel(gl,SwordShader,SwordVer,SwordIdx);
    let lastFrame=0;
	console.log("Start Game Loop");
    function render(currentFrame)
    {
        currentFrame*=0.001;
        deltaFrame=currentFrame-lastFrame;
        lastFrame=currentFrame;
        processInput(currentFrame);
        if (inAir)
	    {
            vec3.add(cameraPos,cameraPos,vec3.scale(tmp,cameraUp,0.2*velocity*deltaFrame));
	    	velocity -= 1.0;
	    	if (cameraPos[1] <= 0.0)
	    	{
	    		cameraPos[1] = 0.0;
	    		inAir = 0;
	    	}
    	}
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        mat4.lookAt(view,cameraPos,vec3.add(tmp,cameraPos,cameraFront),cameraUp);
		gl.enable(gl.DEPTH_TEST);
		renderSkyBox(SkyBoxShader,SkyBoxTex,SkyBoxVAO);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}