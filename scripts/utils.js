//一些有用的数据结构
class Queue//手动模拟了一个简易的队列类，将用于储存所有特效的绘制指令
{
    constructor()
    {
        this.l=0;
        this.r=0;
        this.q=new Array();
        this.size=0;
    }
    push(a)
    {
        this.q[this.r++]=a;
        this.size++;
    }
    pop()
    {
        this.l++;
        this.size--;
        if(this.l==this.r)this.l=this.r=0;//当队列为空时乘机把指针重置
    }
    get(i)
    {
        return this.q[this.l+i];
    }
    front()
    {
        return this.q[this.l];
    }
    empty()
    {
        return !this.size;
    }
}
//地刺统一处理圆柱体，只在刚冒出地面时结算伤害，然后起到阻挡作用，这样需要处理的碰撞对象就不可避免地非常多
//碰撞对象多就意味着我最好写个加速结构
//每种技能都只造成一段伤害
//将玩家（虽然我偷懒没有做模型，但是得做碰撞检测）处理为圆柱体，给一个合理的半径为0.25
const DEFAULT=0,DISAPPEAR=1,NO_DAMAGE=2,BLOCKED=4,ASCENDING=8,POINTED=16;//作为type表示碰撞箱的属性
class CollisionVolume//碰撞体类，这个就是用来结算伤害的
{
    constructor(damage,pos,y,r,h,type=DEFAULT)//提供圆柱体碰撞箱，底面都是水平的，特别的，当r=h=0时成为粒子
    {
        this.damage=damage;
        this.pos=pos;
        this.y=y;
        this.r=r;
        this.h=h;
        this.type=type;
    }
    Collide(V)//返回当前碰撞箱与V是否相碰
    {
        const VPos=V.pos;
        const VY=V.y;
        const Vh=V.h;
        if(this.y+this.h<=VY||VY+Vh<=this.y)return false;
        const Vr=V.r;
        if((this.pos[0]-VPos[0])*(this.pos[0]-VPos[0])+(this.pos[1]-VPos[1])*(this.pos[1]-VPos[1])<=(Vr+this.r)*(Vr+this.r))return true;
        else return false;
    }
    setDamage(damage)//damage为0表示无伤害判定
    {
        this.damage=damage;
    }
    getDamage()
    {
        return this.damage;
    }
    setPos(pos)
    {
        this.pos=pos;
    }
    setY(y)
    {
        this.y=y;
    }
    setType(type)
    {
        this.type=type;
    }
}
class LinkedListNode//用于挂链表
{
    constructor(CV)
    {
        this.nxt=null;
        this.CV=CV;
    }
    setNxt(nxt)
    {
        this.nxt=nxt;
    }
    getCV()
    {
        return this.CV;
    }
}
function insert(Head,CV)
{
    let newNode=new LinkedListNode(CV);
    newNode.setNxt(Head);
    Head=newNode;
    return Head;
}
function remove(Head,CV)//实际上在同一个块中的碰撞箱不会很多，因此这里操作不会很慢，没必要写平衡树来管理
{
    if(Head==null)return null;
    if(Head.CV==CV)
    {
        Head=Head.nxt;
        CV=null;
        return Head;
    }
    let lst=Head,nd=Head.nxt;
    while(nd!=null)
    {
        if(nd.CV==CV)
        {
            lst.nxt=nd.nxt;
            nd=null;
            break;
        }
        nd=nd.nxt;
        lst=lst.nxt;
    }
    return Head;
}
class CVManager//将空间分块，管理碰撞箱，实际上应该写空间分割树比较好，但是太麻烦了也没时间写那么多。。。
{
    constructor()
    {
        this.head=new Array(2500);
        for(let i=0;i<2500;i++)head[i]=null;
    }
    getIDX(pos,r)//返回以pos为圆心以r为半径的圆柱在哪些块中出现
    {
        let ret=new Array();
        let X=Math.floor(pos[0]+BOUND),Y=Math.floor(pos[1]+BOUND);
        if(X==50)X=49;
        if(Y==50)Y=49;
        ret.push(X*50+Y);
        if(r==0.0)return ret;
        if(r<=Math.min(X+1-pos[0]-BOUND,pos[0]+BOUND-X)&&r<=Math.min(Y+1-pos[1]-BOUND,pos[1]+BOUND-Y))return ret;//这一步小判断对于半径极小的碰撞箱有很好的优化
        for(let i=0;i<=1;i++)
        {
            if((!i&&X==0)||(i&&X==49))continue;
            const dx=i?1:-1;
            const deltaX=pos[0]+BOUND-X-i;
            for(let j=0;j<=1;j++)
            {
                if((!j&&Y==0)||(j&&Y==49))continue;
                const dy=j?1:-1,deltaY=pos[1]+BOUND-Y-j;
                if(r*r>deltaX*deltaX+deltaY*deltaY)ret.push((X+dx)*50+Y+dy);
                if(r==0.25)console.log(deltaX*deltaX+deltaY*deltaY);
            }
            if(Math.abs(deltaX)<r)ret.push((X+dx)*50+Y);
        }
        for(let i=0;i<=1;i++)
        {
            if((!i&&Y==0)||(i&&Y==49))continue;
            if(Math.abs(pos[1]+BOUND-Y-i)<r)ret.push(X*50+Y+(i?1:-1));
        }
        return ret;
    }
    create(damage,pos,y,r,h,type=DEFAULT)
    {
        let newCV=new CollisionVolume(damage,pos,y,r,h,type);
        const IDX=this.getIDX(pos,r);
        for(let i=0;i<IDX.length;i++)
            this.head[IDX[i]]=insert(this.head[IDX[i]],newCV);
        return newCV;
    }
    update(CV,pos,y)
    {
        const IDX=this.getIDX(CV.pos,CV.r);
        const newIDX=this.getIDX(pos,CV.r);
        CV.setPos(pos);
        CV.setY(y);
        for(let i=0;i<newIDX.length;i++)
            this.head[newIDX[i]]=insert(this.head[newIDX[i]],CV);
        for(let i=0;i<IDX.length;i++)
            this.head[IDX[i]]=remove(this.head[IDX[i]],CV);
    }
    updateY(CV,y)//这个情况很简单也很常用，单独列出
    {
        CV.setY(y);
    }
    remove(CV)
    {
        if(CV==null)return ;
        const IDX=this.getIDX(CV.pos,CV.r);
        for(let i=0;i<IDX.length;i++)
            this.head[IDX[i]]=remove(this.head[IDX[i]],CV);
    }
    updateType(CV,type,opt)//更新某个碰撞箱的属性
    {
        if(opt)CV.type|=type;
        else if(CV.type&type)CV.type^=type;
    }
    DetectCollision(currentFrame,CV,isplayer=1)//对CV与周围的环境进行碰撞检测，同时进行结算，isplayer=1表示对玩家进行检测，isplayer=2表示检测玩家武器伤害
    {
        const IDX=this.getIDX(CV.pos,CV.r);
        for(let i=0;i<IDX.length;i++)
        {
            for(let nd=this.head[IDX[i]];nd!=null;nd=nd.nxt)
            {
                let V=nd.CV;
                if(CV.Collide(V))
                {
                    if(isplayer==1)//先做伤害结算
                    {
                        if(unhurtTime<currentFrame)
                        {
                            if(!(V.type&POINTED)||((V.type&POINTED)&&CV.y>=V.y+V.h-0.1))
                            {
                                HP-=V.damage;
                                unhurtTime=currentFrame+0.001;
                            }
                        }
                    }
                    if(V.type&DISAPPEAR)//碰撞即消失
                    {
                        this.remove(V);
                        V=null;
                    }
                    else
                    {
                        if(!isplayer)continue;
                        if(V.type&NO_DAMAGE)V.setDamage(0);
                        if(V.type&BLOCKED)
                        {
                            let dir=vec2.fromValues(CV.pos[0]-V.pos[0],CV.pos[1]-V.pos[1]);
                            const length=Math.hypot(dir[0],dir[1]);
                            if(V.type&ASCENDING)//如果在上升，那就把玩家撞起来
                            {
                                if((V.type&POINTED)&&length>V.r)continue;//特别的，如果是尖顶，那就只在比较靠近中心时撞起来
                                inAir=1;
                                velocity=80.0;
                                CV.setY(V.y+V.h+3.0);
                            }
                            else
                            {
                                if(length==0.0)HP=0.0;
                                dir[0]/=length;
                                dir[1]/=length;
                                vec2.scaleAndAdd(CV.pos,V.pos,dir,CV.r+V.r);
                            }
                        }
                    }
                }
            }
        }
    }
}
const PlayerCV=new CollisionVolume(0,vec2.fromValues(cameraPos[0],cameraPos[2]),-1.0,0.4,1.0);
const CVM=new CVManager();
const CircleQ=new Queue();//这些队列都用于存放并管理特效
const CylinderQ=new Queue();
const ConeQ=new Queue();
const BulletsQ=new Queue();
const SwdTipCV=CVM.create(0.0,vec2.fromValues(cameraPos[0],cameraPos[2]),0.0,0.0,0.0);
const SwdBladeCV=CVM.create(0.0,vec2.fromValues(cameraPos[0],cameraPos[2]),0.0,0.0,0.0);
let BossCV=CVM.create(0.0,vec2.fromValues(BossPos[0],BossPos[2]),BossPos[1],0.45,1.0,BLOCKED);