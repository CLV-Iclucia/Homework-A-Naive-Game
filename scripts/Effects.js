const TOO_FAR=1,BACK=2,OK=0;
function check(pos)
{
    let v=vec2.fromValues(pos[0]-cameraPos[0],pos[2]-cameraPos[2]);
    if(vec2.dot(v,v)<=9.0)return OK;//隔得近还是有必要处理
    else
    {
        if(vec2.dot(v,vec2.fromValues(cameraFront[0],cameraFront[2]))<0.0)return BACK;
        else return TOO_FAR;
    }
}
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
        if(check(cmd.P)==BACK)continue;
        const alpha=(currentTime-cmd.trigTime)/1.5;
        let model=mat4.create();
        mat4.identity(model);
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
        const alpha=(currentTime-cmd.trigTime)/1.3;
        const opt=check(cmd.P);
        if(opt!=BACK)
        {
            let model=mat4.create();
            mat4.identity(model);
            mat4.translate(model,model,cmd.P);
            let rate=0.45;
            if(alpha<0.8)rate=0.05;
            else if(alpha<0.9)rate=4*alpha-3.15;
            mat4.scale(model,model,vec3.fromValues(rate,36.0,rate));
            gl.uniformMatrix4fv(LaserShader.UniLoc[0],false,model);
            gl.drawElements(gl.TRIANGLES,96,gl.UNSIGNED_SHORT,0);
        }
        if(opt!=TOO_FAR)
        {
            if(alpha>=0.8&&cmd.CV==null)cmd.CV=CVM.create(0.05,vec2.fromValues(cmd.P[0],cmd.P[2]),-1.0,0.45,4.0,NO_DAMAGE);
        }
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
    gl.uniform3f(ThornShader.UniLoc[5],lightColor[0],lightColor[1],lightColor[2]);
    for(let i=0;i<ConeQ.size;i++)
    {
        const cmd=ConeQ.get(i);
        if(currentTime<cmd.trigTime)break;
        const alpha=(currentTime-cmd.trigTime)/4.0;
        const opt=check(cmd.P);
        if(opt!=BACK)//有必要渲染
        {
            let model=mat4.create();
            let trans=vec3.clone(cmd.P);
            if(alpha<0.05)trans[1]=80*alpha-5.0;
            else
            {
                if(alpha<=0.95) trans[1]=-1.0;
                else trans[1]=-80*alpha+75.0;
            }
            mat4.translate(model,model,trans);
            gl.uniformMatrix4fv(ThornShader.UniLoc[0],false,model);
            gl.drawElements(gl.TRIANGLES,48,gl.UNSIGNED_SHORT,0);
        }
        if(opt!=TOO_FAR)//距离较近，有必要更新碰撞箱
        {
            if(cmd.CV==null)cmd.CV=CVM.create(0.6,vec2.fromValues(cmd.P[0],cmd.P[2]),-5.0,1.0,3.0,BLOCKED|POINTED|ASCENDING);
            if(alpha<0.05)CVM.updateY(cmd.CV,80*alpha-5.0);
            else
            {
                CVM.updateType(cmd.CV,ASCENDING,0);
                if(alpha<=0.95)CVM.updateY(cmd.CV,-1.0);
                else
                {
                    if(cmd.CV!=null)
                    {
                        CVM.remove(cmd.CV);
                        cmd.CV=null;
                    }
                }
            }//碰撞箱不必即时更新。。。虽然即时更新能拓展出很多有意思的玩法，但是东西一多即时更新真的太慢了。。。
        }
    }
    while(!ConeQ.empty())
    {
        if(currentTime>ConeQ.front().endTime)
        {
            CVM.remove(ConeQ.front().CV);
            ConeQ.front().CV=null;
            ConeQ.pop();
        }
        else break;
    }
    gl.bindVertexArray(null);
}
function processBullets(currentTime)//渲染场景中的子弹
{
    gl.useProgram(BulletsShader.shader);
    gl.bindVertexArray(BulletsVAO);
	gl.uniformMatrix4fv(BulletsShader.UniLoc[1],false,view);
    gl.uniformMatrix4fv(BulletsShader.UniLoc[2],false,proj);
    if(phase==1)gl.uniform1i(BulletsShader.UniLoc[3],EyeTex);
    else 
    {
        const op=Math.random()*2;
        if(op)gl.uniform1i(BulletsShader.UniLoc[3],LEyeTex);
        else gl.uniform1i(BulletsShader.UniLoc[3],REyeTex);
    }
    for(let i=0;i<BulletsQ.size;i++)
    {
        const cmd=BulletsQ.get(i);
        if(currentTime<cmd.trigTime)break;
        const t=currentTime-cmd.trigTime;
        const P=vec3.scaleAndAdd(tmp,cmd.startPos,cmd.dir,15.0*t);
        const opt=check(P);
        if(opt!=BACK)
        {
            let model=mat4.create();
            mat4.translate(model,model,P);
            gl.uniformMatrix4fv(BulletsShader.UniLoc[0],false,model);
            gl.drawElements(gl.TRIANGLES,36,gl.UNSIGNED_SHORT,0);
        }
        if(opt!=TOO_FAR)
        {
            if(cmd.CV==null)cmd.CV=CVM.create(0.02,vec2.fromValues(P[0],P[2]),P[1],0,0,DISAPPEAR);
            else CVM.update(cmd.CV,vec2.fromValues(P[0],P[2]),P[1]);
        }
    }
    while(!BulletsQ.empty())
    {
        const t=currentTime-BulletsQ.front().trigTime;
        const P=vec3.scaleAndAdd(tmp,BulletsQ.front().startPos,BulletsQ.front().dir,t);
        if(P[1]< -1.0||Math.abs(P[0])>BOUND||Math.abs(P[2])>BOUND)
        {
            CVM.remove(BulletsQ.front().CV);
            BulletsQ.front().CV=null;
            BulletsQ.pop();
        }
        else break;
    }
    gl.bindVertexArray(null);
}