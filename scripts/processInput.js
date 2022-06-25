let A,W,S,D;
let SPACE,MLB,MRB,LSHIFT;
let theta=0.0,beta=0.0;
window.addEventListener('keydown',function(event)
{
    let key=event.code;
    if(key=="KeyA")A=true;
    else if(key=="KeyW")W=true;
    else if(key=="KeyS")S=true;
    else if(key=="KeyD")D=true;
    else if(key=="Space")
    {
        SPACE=true;
        event.preventDefault();
    }
    else if(key=="ShiftLeft")LSHIFT=true;
    else if(key=="Enter")
    {
        canvas.requestPointerLock = canvas.requestPointerLock ||window.mozRequestPointerLock;
        canvas.requestPointerLock();
		//BGM.play();
    }
},false);
canvas.addEventListener('mousemove',function(event)
    {
	    let dx = event.movementX;
	    let dy = event.movementY;
	    dx *= 0.05;
	    dy *= 0.05;
	    theta += dx;
	    beta -= dy;
	    if (beta > 89.0)beta = 89.0;
	    if (beta < -89.0)beta = -89.0;
	    let yaw = theta*Math.PI/180.0, pitch = beta*Math.PI/180.0;
	    cameraFront[0]=Math.cos(pitch)*Math.sin(yaw);
        cameraFront[1]=Math.sin(pitch);
        cameraFront[2]=-Math.cos(pitch)*Math.cos(yaw);
},false);
canvas.addEventListener('mousedown',function(event)
{
    let button=event.button;
    if(button==0)MLB=true;
    if(button==2)MRB=true;
},false);
canvas.addEventListener('mouseup',function(event)
{
    let button=event.button;
    if(button==0)MLB=false;
    if(button==2)MRB=false;
},false);
window.addEventListener('keyup',function(event)
{
    let key=event.code;
    if(key=="KeyA")A=false;
    else if(key=="KeyW")W=false;
    else if(key=="KeyS")S=false;
    else if(key=="KeyD")D=false;
    else if(key=="Space")SPACE=false;
    else if(key=="ShiftLeft")LSHIFT=false;
},false);
function processInput(currentTime)
{
    const dir=vec3.fromValues(cameraFront[0],0.0,cameraFront[2]),vdir=vec3.fromValues(0.0,1.0,0.0);
    vec3.normalize(dir,dir);
	vec3.cross(vdir,vdir,dir);
	let spd = 4.5*deltaFrame;
    if(currentTime >= dashEndFrame)//冲刺阶段不能处理平面移动
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
		spd = 14.0*deltaFrame;
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
			velocity = 55.0;
			stamina-=0.05;
		}
	}
	if (LSHIFT)
	{
		if(stamina>=0.1&&currentTime>=dashEndFrame)
		{
			dashEndFrame = currentTime + 0.3;
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
			stamina -= 0.05;
		}
	}
	if (MLB)
	{
		if (stamina>=0.1&&currentTime > ATKEndFrame)//更新攻击结束帧
		{
			ATKEndFrame=currentTime+0.3;
			if(currentTime<ATKEndFrame+0.2)ATKopt^=1;
			else ATKopt=0;
			stamina-=0.05;
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