const canvas=document.querySelector("#glcanvas");
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