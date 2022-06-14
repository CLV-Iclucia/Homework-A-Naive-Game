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
//激光处理为圆柱体，每帧都造成少量伤害
//将玩家（虽然我偷懒没有做模型，但是得做碰撞检测）处理为圆柱体，给一个合理的半径为0.3
//将玩家攻击范围划定为一个弧面，这可以通过运算来解决，不需要做一个单独的碰撞箱
const BOX=0,CYLINDER=1;
// class CollisionVolume//碰撞体类，这个就是用来结算伤害的
// {
//     constructor(type,damage,pos,y,r,h)//提供两种包围盒，圆柱形和长方形，底面都是水平的
//     {
//         this.damage=damage;
//         this.pos=pos;
//         this.y=y;
//         this.r=r;
//         this.h=h;
//     }
//     Collide(V)//返回当前碰撞箱与V是否相碰，不处理长方体与长方体的碰撞
//     {
//         if(V.type==CYLINDER)
//         {
//             const VPos=V.getPos();
//             const VY=V.getY();
//             const Vh=V.getHeight();
//             if(this.y+this.h<=VY||VY+Vh<=this.y)return false;
//             if(this.type==CYLINDER)
//             {
//                 const Vr=V.getRadius();
//                 if(Math.sqrt((this.pos[0]-VPos[0])*(this.pos[0]-VPos[0])+(this.pos[1]-VPos[1])*(this.pos[1]-VPos[1]))<=Vr+this.r)return true;
//                 else return false;
//             }
//             else
//             {
                
//             }
//         }
//         else
//         {
//             if(this.type==CYLINDER)
//             {

//             }
//         }
//     }
//     setDamage(damage)//damage为-1表示无伤害判定
//     {
//         this.damage=damage;
//     }
//     getDamage()//damage为-1表示无伤害判定
//     {
//         return this.damage;
//     }
//     setPos(pos)
//     {
//         this.pos=pos;
//     }
//     getPos()
//     {
//         return this.pos;
//     }
//     setY(y)
//     {
//         this.y=y;
//     }
//     getY()
//     {
//         return this.y;
//     }
//     getRadius()
//     {
//         return this.r;
//     }
//     getHeight()
//     {
//         return this.h;
//     }
//     getLength()
//     {
//         return this.b;
//     }
//     getWidth()
//     {
//         return this.a;
//     }
// }