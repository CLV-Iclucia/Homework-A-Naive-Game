function renderCircle(currentTime)//渲染场景中所有圈
{
    gl.useProgram(CircleShader.shader);
    gl.bindVertexArray(CircleVAO);
	gl.uniformMatrix4fv(CircleShader.UniLoc[1],false,view);
    gl.uniformMatrix4fv(CircleShader.UniLoc[2],false,proj);
    gl.uniform1i(CircleShader.UniLoc[3],CircleTex);
    for(let i=0;i<CircleQ.size;i++)//在刚出现时由小变大，一边转，大到固定值继续转，激光下来以后停转
    {
        const cmd=CircleQ.get(i);
        if(currentTime<cmd.trigTime)break;
        let model=mat4.create();
        mat4.identity(model);
        const alpha=(currentTime-cmd.trigTime)/1.5;
        mat4.translate(model,model,cmd.P);
        if(alpha<0.5)mat4.rotate(model,model,alpha*Math.PI*4.0,vec3.fromValues(0.0,1.0,0.0));
        if(alpha<0.25)mat4.scale(model,model,vec3.fromValues(0.5+2.0*alpha,0.5+2.0*alpha,0.5+2.0*alpha));
        gl.uniformMatrix4fv(CircleShader.UniLoc[0],false,model);
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);//统一使用顶点索引绘制
    }
    gl.bindVertexArray(null);
    while(!CircleQ.empty())
    {
        if(currentTime>CircleQ.front().endTime)CircleQ.pop();
        else break;
    }
}
function renderLaser(currentTime)//渲染场景中激光
{
    gl.useProgram(LaserShader.shader);
    gl.bindVertexArray(LaserVAO);
	gl.uniformMatrix4fv(LaserShader.UniLoc[1],false,view);
    gl.uniformMatrix4fv(LaserShader.UniLoc[2],false,proj);
    for(let i=0;i<CylinderQ.size;i++)
    {
        const cmd=CylinderQ.get(i);
        if(currentTime<cmd.trigTime)break;
        let model=mat4.create();
        mat4.identity(model);
        const alpha=(currentTime-cmd.trigTime)/1.3;
        mat4.translate(model,model,cmd.P);
        let rate=0.45;
        if(alpha<0.7)rate=0.05;
        else if(alpha<=0.9)rate=2*alpha-0.95;
        mat4.scale(model,model,vec3.fromValues(rate,36.0,rate));
        gl.uniformMatrix4fv(LaserShader.UniLoc[0],false,model);
        gl.drawElements(gl.TRIANGLES,96,gl.UNSIGNED_SHORT,0);//统一使用顶点索引绘制
    }
    gl.bindVertexArray(null);
    while(!CylinderQ.empty())
    {
        if(currentTime>CylinderQ.front().endTime)CylinderQ.pop();
        else break;
    }
    gl.bindVertexArray(null);
}