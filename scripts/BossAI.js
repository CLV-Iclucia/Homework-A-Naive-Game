//处理技能的基本想法，向事件队列中按照时间顺序添加事件
//核心逻辑：在若干个点随机生成竖直的激光
//原则：距离过近时在自身周围生成，距离远时在玩家周围生成
function genLaser(currentTime)
{
    let dist=vec3.length(cameraPos-BossPos);
    let dir=vec3.create();
    let cnt=Math.floor(Math.random()*phase*5)+5*phase;//根据阶段控制生成激光数量
    let sum=currentTime;
    let pos;
    let minDistPlayer=Math.min(cameraPos[0]+35.5,35.5-cameraPos[0],cameraPos[2]+35.5,35.5-cameraPos[2]);
    for(let i=1;i<=cnt;i++)
    {
        dir[0]=Math.random()*2*Math.PI;
        dir[2]=Math.sin(dir[0]);
        dir[0]=Math.cos(dir[0]);//随机了一个方向
        if(dist<=7.5)//在较小的范围内时集火
        {
            dist*=2.0;
            let dis=Math.random()*dist;
            pos=vec3.clone([BossPos[0]+dir[0]*dis,-0.9995,BossPos[2]+dir[2]*dis]);
        }
        else
        {
            let dis=Math.random()*10.0;
            dis=Math.min(minDistPlayer,dis);
            pos=vec3.clone([cameraPos[0]+dir[0]*dis,-0.9995,cameraPos[2]+dir[2]*dis]);
        }
        CircleQ.push({
            P:pos,
            trigTime:sum+0.2,
            endTime:sum+1.7});//这是激光出现前的圆圈
        CylinderQ.push({
            P:pos,
            trigTime:sum+0.4,
            endTime:sum+1.7
        });//这是激光
        sum+=Math.random()*0.3;
    }
}