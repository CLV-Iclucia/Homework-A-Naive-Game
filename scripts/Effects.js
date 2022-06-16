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
function processLaser(currentTime)//渲染场景中激光
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
        if(alpha<0.8)rate=0.05;
        else
        {
            if(cmd.CV==null)cmd.CV=CVM.create(0.1,vec2.fromValues(cmd.P[0],cmd.P[2]),0.0,0.45,4.0,NO_DAMAGE);
            if(alpha<=0.9)rate=4*alpha-3.15;
        }
        mat4.scale(model,model,vec3.fromValues(rate,36.0,rate));
        gl.uniformMatrix4fv(LaserShader.UniLoc[0],false,model);
        gl.drawElements(gl.TRIANGLES,96,gl.UNSIGNED_SHORT,0);
    }
    while(!CylinderQ.empty())
    {
        if(currentTime>CylinderQ.front().endTime)
        {
            CVM.remove(CylinderQ.front().CV);
            CylinderQ.front().CV=null;
            CylinderQ.pop();
        }
        else break;
    }
    gl.bindVertexArray(null);
}
function processThorn(currentTime)//渲染场景中的地刺
{
    gl.useProgram(ThornShader.shader);
    gl.bindVertexArray(ThornVAO);
	gl.uniformMatrix4fv(ThornShader.UniLoc[1],false,view);
    gl.uniformMatrix4fv(ThornShader.UniLoc[2],false,proj);
    gl.uniform3f(ThornShader.UniLoc[3],lightPos[0],lightPos[1],lightPos[2]);
    gl.uniform3f(ThornShader.UniLoc[4],cameraPos[0],cameraPos[1],cameraPos[2]);
    gl.uniform3f(ThornShader.UniLoc[5],cameraFront[0],cameraFront[1],cameraFront[2]);
    gl.uniform3f(ThornShader.UniLoc[6],lightColor[0],lightColor[1],lightColor[2]);
    for(let i=0;i<ConeQ.size;i++)
    {
        const cmd=ConeQ.get(i);
        if(currentTime<cmd.trigTime)break;
        let model=mat4.create();
        mat4.identity(model);
        const alpha=(currentTime-cmd.trigTime)/4.0;
        let trans=vec3.clone(cmd.P);
        if(cmd.CV==null)cmd.CV=CVM.create(0.6,vec2.fromValues(cmd.P[0],cmd.P[2]),-4.0,1.0,3.0,SOLID);
        if(alpha<0.05)
        {
            trans[1]=80*alpha-5.0;
            CVM.updateY(cmd.CV,trans[1]);
        }
        else
        {
            CVM.updateOnHit(cmd.CV,BLOCKED);
            cmd.CV.setDamage(0);
            if(alpha<=0.95) 
            {
                CVM.updateY(cmd.CV,-1.0);
                trans[1]=-1.0;
            }
            else
            {
                if(cmd.CV!=null)
                {
                    CVM.remove(cmd.CV);
                    cmd.CV=null;
                }
                trans[1]=-80*alpha+75.0;
            }
        }
        mat4.translate(model,model,trans);
        gl.uniformMatrix4fv(ThornShader.UniLoc[0],false,model);
        gl.drawElements(gl.TRIANGLES,48,gl.UNSIGNED_SHORT,0);
    }
    while(!ConeQ.empty())
    {
        if(currentTime>ConeQ.front().endTime)ConeQ.pop();
        else break;
    }
    gl.bindVertexArray(null);
}