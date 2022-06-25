//处理技能的基本想法，向事件队列中按照时间顺序添加事件
//核心逻辑：在若干个点随机生成竖直的激光
//原则：距离过近时在自身周围生成，距离远时在玩家周围生成
const HIGHJUMP=1,DASH=2,THORN=4,LASER=8,BULLETS=16,SPLASH=32,MANY_THORN=64,CONFRONTATION=128,STATIC=256,CHASE=512;
let BossStatus=CONFRONTATION;//Boss初始时处于对峙状态
let transOK=false,transIm=false,done=new Array(7);//是否允许转移,是否立即转移
function genLaser(currentTime)
{
    let dist=vec3.length(cameraPos-BossPos);
    let dir=vec3.create();
    let cnt=Math.floor(Math.random()*phase*10)+10*phase;//根据阶段控制生成激光数量
    let sum=currentTime;
    let pos;
    let minDistPlayer=Math.min(cameraPos[0]+BOUND,BOUND-cameraPos[0],cameraPos[2]+BOUND,BOUND-cameraPos[2]);
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
            endTime:sum+1.7,
            CV:null,
        });//这是激光
        sum+=Math.random()*0.3;
    }
}
function genThorn(currentTime,dirx,dirz)//在(dirx,dirz)方向生成一条地刺
{
    let sum=currentTime+0.05;
    const dir=vec3.fromValues(2.0*dirx,0.0,2.0*dirz);
    for(let i=1;;i++)
    {
        let pos=vec3.create();
        vec3.scaleAndAdd(pos,BossPos,dir,i);
        ConeQ.push({
            P:pos,
            trigTime:sum,
            endTime:sum+4.0,
            CV:null,
        });
        sum+=0.04;
        if(Math.abs(pos[0])>BOUND||Math.abs(pos[2])>BOUND)break;
    }
}
const EPS=5e-3;
function move(BossStatus)//进入这个状态首先调整BOSS方向面对玩家,这些移动状态不用时间只用运动模拟更易于实现
{
    const BossToPlayer=vec2.create();
    BossToPlayer[0]=cameraPos[0]-BossPos[0];
    BossToPlayer[1]=cameraPos[2]-BossPos[2];
    vec3.subtract(EyeDir,cameraPos,EyePos);
    vec2.normalize(BossToPlayer,BossToPlayer);
    vec3.normalize(EyeDir,EyeDir);
    if(Math.abs(1.0-vec2.dot(BossDir,BossToPlayer))>EPS)//做旋转，这里使用显式欧拉积分来控制圆周运动，快速，好算，好写，易于控制
    {
        vec2.normalize(BossDir,BossDir);
        BossRotDir[0]=-BossDir[1];
        BossRotDir[1]=BossDir[0];
        vec2.scaleAndAdd(BossDir,BossDir,BossRotDir,BossRotSpd);
        vec2.normalize(BossDir,BossDir);
        BossMovSpd=BossMovDir[0]=BossMovDir[1]=0.0;//这里起码得保证转身转过来,因此不能动
    }
    else
    {
        BossDir[0]=BossToPlayer[0];
        BossDir[1]=BossToPlayer[1];
        if(BossStatus&CONFRONTATION)//对峙状态AI
        {
            BossMovDir[0]=-BossDir[1];
            BossMovDir[1]=BossDir[0];
            BossMovSpd=0.03;
        }
        else if(BossStatus&CHASE)//追逐玩家AI
        {
            BossMovDir[0]=BossDir[0];
            BossMovDir[1]=BossDir[1];
            BossMovSpd=0.05;
        }
        else if(BossStatus&STATIC)BossMovSpd=BossMovDir[0]=BossMovDir[1]=0.0;//静止状态
        transOK=true;
    }
    BossPos[0]=BossPos[0]+BossMovDir[0]*BossMovSpd;
    BossPos[1]=-1;
	BossPos[2]=BossPos[2]+BossMovDir[1]*BossMovSpd;
    if(BossPos[0]< -BOUND)BossPos[0]=-BOUND;
	if(BossPos[0]>BOUND)BossPos[0]=BOUND;
	if(BossPos[2]< -BOUND)BossPos[2]=-BOUND;
	if(BossPos[2]>BOUND)BossPos[2]=BOUND;
    mat4.set(BossModel,BossDir[0],0.0,BossDir[1],0.0,0.0,1.0,0.0,0.0,-BossDir[1],0.0,BossDir[0],0.0,BossPos[0],BossPos[1],BossPos[2],1.0);
}
function bullets(currentTime)//喷射子弹AI
{
    const num=(Math.floor(Math.random()*8)+8)*phase;//控制生成多少
    for(let i=0;i<num;i++)
    {
        const dy=Math.random()-0.5;
        const dx=Math.random()-0.5;
        const direction=vec3.fromValues(EyeDir[0]+dx*BossDir[1],EyeDir[1]+dy,EyeDir[2]-dx*BossDir[0]);
        vec3.normalize(direction,direction);
        BulletsQ.push({
            startPos:vec3.fromValues(EyePos[0],EyePos[1],EyePos[2]),
            trigTime:currentTime,
            dir:direction,
            CV:null,
        });
    }
    transOK=true;
}
function splash(currentTime)//随机朝不同方向发射
{
    const num=(Math.floor(Math.random()*8)+8)*phase*2;
    for(let i=0;i<num;i++)
    {
        let dy=Math.random()*2-1.0;
        let dx=Math.random()*2-1.0;
        const length=Math.hypot(dx,dy);
        dx/=length;
        dy/=length;
        BulletsQ.push({
            startPos:vec3.fromValues(BossPos[0],BossPos[1]+0.2,BossPos[2]),
            trigTime:currentTime,
            dir:vec3.fromValues(dx,0.0,dy),
            CV:null,
        });
    }
    transOK=true;
}
function highjump(currentTime)//执行大跳AI,斜抛运动
{
    const t=(currentTime-lastAIRefreshTime)/REFRESHTIME;
    BossPos[0]+=BossMovDir[0]*deltaFrame*BossMovSpd;
    BossPos[1]=14.0-60.0*(t-0.5)*(t-0.5);
    BossPos[2]+=BossMovDir[1]*deltaFrame*BossMovSpd;
    if(BossPos[1]< -1.0)
    {
        BossPos[1]=-1.0;
        transOK=true;
        transIm=true;
    }
    mat4.set(BossModel,BossDir[0],0.0,BossDir[1],0.0,0.0,1.0,0.0,0.0,-BossDir[1],0.0,BossDir[0],0.0,BossPos[0],BossPos[1],BossPos[2],1.0);
}
function thorn(currentTime)
{
    let dir=vec2.create();
    dir[0]=cameraPos[0]-BossPos[0];
    dir[1]=cameraPos[2]-BossPos[2];
    vec2.normalize(dir,dir);
    genThorn(currentTime,dir[0],dir[1]);
}
function dash(currentTime)//冲刺AI
{
    const t=(currentTime-lastAIRefreshTime)/REFRESHTIME;
    if(t<=0.2)BossPos[1]=2.5*t-1.0;
    else if(t<=0.9)
    {
        BossPos[1]=-0.5;
        BossPos[0]+=BossMovSpd*BossMovDir[0];
        BossPos[2]+=BossMovSpd*BossMovDir[1];
    }
    else 
    {
        BossPos[1]=4-5*t;
        BossCV.setDamage(0);
        BossCV.setType(BLOCKED);
        transIm=true;
    }
    transOK=true;
    mat4.set(BossModel,BossDir[0],0.0,BossDir[1],0.0,0.0,1.0,0.0,0.0,-BossDir[1],0.0,BossDir[0],0.0,BossPos[0],BossPos[1],BossPos[2],1.0);
}
function genManyThorn(currentTime)
{
    let dir=vec2.create();
    dir[0]=cameraPos[0]-BossPos[0];
    dir[1]=cameraPos[2]-BossPos[2];
    vec2.normalize(dir,dir);
    const temp=Math.sqrt(2)/2.0;//每隔45度转角生成一排刺
    for(let i=0;i<8;i++)
    {
        const dirx=dir[0],diry=dir[1];
        genThorn(currentTime,dirx,diry);
        dir[0]=temp*(dirx+diry);
        dir[1]=temp*(-dirx+diry);
    }
    transOK=true;
}
//根据当前状态，获取下一状态，相当于一个根据条件随机转移的状态机中的转移规则.CONFRTONTAION,STATIC和CHASE是移动模式,互不兼容
//处于此三种移动模式下可以施展除HIGHJUMP和DASH以外的任何攻击
//HIGHJUMP和DASH与任何状态都不兼容
function getNxt(status)
{
    const opt=Math.floor(Math.random()*20);
    let NxtStatus=status;
    if(Math.abs(Math.abs(BossPos[0])-BOUND)<2.0||Math.abs(Math.abs(BossPos[2])-BOUND)<2.0)return HIGHJUMP;
    if(status&CONFRONTATION)
    {
        NxtStatus|=(1<<(opt>>2));//这样可以等概率随机到5种攻击
        if(opt<=1)NxtStatus^=HIGHJUMP;//特别的，我不希望总是出大跳
        if(NxtStatus&HIGHJUMP)NxtStatus=HIGHJUMP;
        if(NxtStatus&DASH)NxtStatus=DASH;
    }
    else if(status&STATIC)//静止状态下，攻击频率增高，手段增多
    {
        if(opt<=12)NxtStatus|=LASER;
        else
        {
            NxtStatus^=STATIC;//有一定概率解除静止状态
            if(opt<=14)NxtStatus|=CHASE;
            else NxtStatus|=CONFRONTATION;
        }
        if(opt<=8)NxtStatus|=BULLETS;
    }
    else if(status&CHASE)
    {
        if(opt>=8)
        {
            NxtStatus^=CHASE;
            NxtStatus|=CONFRONTATION;
        }
        else
        {
            if(opt<=2)NxtStatus|=SPLASH;
            else if(opt<=5)NxtStatus|=BULLETS;
            else NxtStatus|=LASER;
        }
    }
    if(status&MANY_THORN)NxtStatus^=MANY_THORN;
    if(status&HIGHJUMP)
    {
        NxtStatus^=HIGHJUMP;
        NxtStatus|=STATIC;
        NxtStatus|=MANY_THORN;
    }
    if(status&DASH)
    {
        NxtStatus^=DASH;
        NxtStatus|=CONFRONTATION;
    }
    if(status&LASER)
    {
        if(opt>4) NxtStatus^=LASER;
        if(opt>=8)NxtStatus|=BULLETS;
    }
    if(status&THORN)
    {
        if(opt>4) NxtStatus^=THORN;
        if(opt>=8)NxtStatus|=LASER;
    }
    if(status&SPLASH)
    {
        if(opt>12) NxtStatus^=SPLASH;
        if(opt>=16)NxtStatus=HIGHJUMP;
    }
    if(status&BULLETS)
    {
        if(opt>4) NxtStatus^=BULLETS;
        if(opt>=8)NxtStatus=DASH;
    }
    return NxtStatus;
}
function prepare()
{
    if(BossStatus&HIGHJUMP)
    {
        const dis=Math.hypot(BossPos[0],BossPos[2]);
        BossMovDir[0]=-BossPos[0];
        BossMovDir[1]=-BossPos[2];
        vec2.normalize(BossMovDir,BossMovDir);
        BossDir[0]=BossMovDir[0];
        BossDir[1]=BossMovDir[1];
        BossMovSpd=dis/REFRESHTIME;
    }
    if(BossStatus&DASH)
    {
        let dir=vec2.create();
        dir[0]=cameraPos[0]-BossPos[0];
        dir[1]=cameraPos[2]-BossPos[2];
        vec2.normalize(dir,dir);
        BossMovDir[0]=BossDir[0]=dir[0];
        BossMovDir[1]=BossDir[1]=dir[1];
        BossMovSpd=0.20;
        BossCV.setDamage(0.2);
        BossCV.setType(NO_DAMAGE);
    }
}
const skills=[highjump,thorn,genLaser,bullets,splash,dash,genManyThorn];
let REFRESHTIME=2.0;//刷新时间
function runBossAI(currentTime)
{
    transOK=transIm=false;
    if(phase==2)REFRESHTIME=1.0;
    if(BossStatus&(CONFRONTATION|STATIC|CHASE))move(BossStatus);//这处理移动
    if(BossStatus&HIGHJUMP)highjump(currentTime);
    if(BossStatus&DASH)dash(currentTime);
    for(let i=2;i<7;i++)
    {
        if(!done[i]&&(BossStatus&(1<<i)))
        {
            skills[i](currentTime);
            done[i]=true;
        }
    }
    if(transIm||(transOK&&currentTime>=lastAIRefreshTime+REFRESHTIME))//如果能够刷新，每隔一定时间刷新一次AI进行转移
    {
        BossStatus=getNxt(BossStatus);//进行状态转移
        lastAIRefreshTime=currentTime;
        for(let i=2;i<7;i++)done[i]=false;
        prepare();//为当前状态准备变量
    }
}