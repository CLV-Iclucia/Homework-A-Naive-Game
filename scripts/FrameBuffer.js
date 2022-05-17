function initFrameBuffer(gl)
{
    let FBO=gl.createFrameBuffer();
    gl.bindFrameBuffer(gl.FRAMEBUFFER,FBO);
    let tex=gl.createTexture();
    gl.bindTexture(TEXTURE_2D,tex);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT,Width,Height,0,gl.DEPTH_COMPONENT,gl.FLOAT,null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    FBO.texture=tex;
    gl.bindFrameBuffer(gl.FRAMEBUFFER,FBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,tex,0);
    if(gl.checkFrameBufferStatus(gl.FRAMEBUFFER)==gl.FRAMEBUFFER_COMPLETE)
    {
        console.log("Frame Buffer initialized");
        gl.bindFrameBuffer(gl.FRAMEBUFFER,null);
        gl.bindTexture(TEXTURE_2D,null);
        return FBO;
    }
}
function render2FBO(gl,FBO,VAO,Shader,UniVar)
{
    gl.bindFrameBuffer(gl.FRAMEBUFFER,FBO);
    gl.useProgram(Shader);
    for(let i=0;i<UniVar.length;i++)
    {
        const u=UniVar[i];
        if(u[0]=='mat4')gl.uniform4fv(Shader.UniLoc[i],false,u[1]);
        else if(u[1]=='mat3')gl.uniform3fv(Shader.UniLoc[i],false,u[1]);
        else gl.uniform2fv(Shader.UniLoc[i],false,u[1]);
    }
    gl.bindVertexArray(VAO);
}