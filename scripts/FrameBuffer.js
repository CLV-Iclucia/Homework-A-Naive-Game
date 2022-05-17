let TexCnt=0;
function initFrameBuffer(gl)
{
    let FBO=gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER,FBO);
    let tex=gl.createTexture();
    gl.activeTexture(gl.TEXTURE0+TexCnt);
    TexCnt++
    gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,Width,Height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    FBO.texture=tex;
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
    gl.drawBuffers([gl.NONE]);
    gl.readBuffer([gl.NONE]);
    console.log("Frame Buffer initialized");    
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    gl.bindTexture(gl.TEXTURE_2D,null);
    return FBO;
}
function render2FBO(gl,VAO,Shader,UniVar,tot)
{
    gl.useProgram(Shader.shader);
    for(let i=0;i<UniVar.length;i++)
    {
        const u=UniVar[i];
        if(u[0]=='mat4')gl.uniformMatrix4fv(Shader.UniLoc[i],false,u[1]);
        else if(u[1]=='mat3')gl.uniformMatrix3fv(Shader.UniLoc[i],false,u[1]);
        else gl.uniformMatrix2fv(Shader.UniLoc[i],false,u[1]);
    }
    gl.bindVertexArray(VAO);
    gl.drawElements(gl.TRIANGLES,tot,gl.UNSIGNED_SHORT,0);
    gl.bindVertexArray(null);
}