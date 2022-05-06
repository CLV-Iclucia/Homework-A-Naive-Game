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
function renderObject(Shader,UniVar,VAO,tot)//传入着色器程序，uniform变量列表，顶点数组对象VAO和三角面个数tot来绘制对象
{
	gl.useProgram(Shader.shader);
	for(let i=0;i<UniVar.length;i++)
	{
		const u=UniVar[i];
		if(u[0]=='mat4')gl.uniformMatrix4fv(Shader.UniLoc[i],false,u[1]);
		else if(u[0]=='mat3')gl.uniformMatrix3fv(Shader.UniLoc[i],false,u[1]);
		else if(u[0]=='vec4')gl.uniform4fv(Shader.UniLoc[i],u[1]);
		else if(u[0]=='vec3')gl.uniform3fv(Shader.UniLoc[i],u[1]);
		else gl.uniform1i(Shader.UniLoc[i],u[1]);
	}
	gl.bindVertexArray(VAO);
    gl.drawElements(gl.TRIANGLES,tot,gl.UNSIGNED_SHORT,0);//统一使用顶点索引绘制
	gl.bindVertexArray(null);
}
function initSwdModel()
{
	const mat=mat4.create();
	console.log(mat);
}
function main()
{
    Reset();
    if (!gl) 
    {
        alert("无法初始化WebGL，你的浏览器、操作系统或硬件等可能不支持WebGL。");
        return;
    }
    const SkyBoxShader=initShader(gl,SkyBoxVertexShader,SkyBoxFragmentShader);
    const SkyBoxTex=initSkyBoxTexture(gl);
	const SkyBoxVAO=initModel(gl,SkyBoxShader,SkyBoxVer,BoxIdx);
	const SwordShader=initShader(gl,SwordVertexShader,SwordFragmentShader);
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
		const SkyBoxVar=[['mat4',view],['mat4',proj],['sampler',SkyBoxTex]];
		const swordModel=initSwdModel();
		const SwordVar=[['mat4',view],['mat4',proj],['mat4',swordModel]];
		renderObject(SkyBoxShader,SkyBoxVar,SkyBoxVAO,12);
		renderObject(SwordShader,SwordVar,SwordVAO,186);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}