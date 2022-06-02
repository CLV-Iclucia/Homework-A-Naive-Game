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