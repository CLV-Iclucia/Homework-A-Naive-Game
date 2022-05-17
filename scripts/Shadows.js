const lightView=mat4.create();
mat4.lookAt(lightView,vec3.clone([40,16,16]),vec3.clone([0.0,0.0,0.0]),vec3.clone([0.0,1.0,0.0]));

function initShadow(currentFrame)
{
    
    render2FBO(gl,FBO);
}