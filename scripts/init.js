function loadShader(gl, type, source) 
{
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
    {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
function isword(ch)
{
    return (ch>='0'&&ch<='9')||(ch>='A'&&ch<='Z')||(ch>='a'&&ch<='z');
}
function istype(word)
{
    let str=word.substr(0,3);
    return str=='vec'||str=='sam'||str=='mat';
}
function initShader(gl,vshader,fshader)//返回着色器程序,在返回的对象中存储uniform变量地址和attribute变量地址
{
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
    const ID=gl.createProgram();
    gl.attachShader(ID, vertexShader);
    gl.attachShader(ID, fragmentShader);
    gl.linkProgram(ID);
    if (!gl.getProgramParameter(ID, gl.LINK_STATUS)) 
    {
        alert('Unable to initialize the shader program: ');
        return null;
    }
    let j,varType=-1,Type,matchName=false;
    let UniformVar=new Array(),AttributeVar=new Array();
    for(let i=0;i<vshader.length;i=j+1)
    {
        j=i;
        while(isword(vshader[j]))j++;
        const word=vshader.substr(i,j-i);
        if(word=='uniform')varType=0;
        if(word=='atrribute')varType=1;
        if(varType>=0&&istype(word))
        {
            Type=word;
            matchName=true;
        }
        if(matchName)
        {
            if(!varType)UniformVar.push(gl.getUniformLocation(ID,word));
            else AttributeVar.push([Type[3].toNumber(),gl.getAtrribLocation(ID,word)]);
            matchName=0;
            varType=-1;
        }
        if(word=='void')break;
    }
    varType=false;
    for(let i=0;i<fshader.length;i=j+1)
    {
        j=i;
        while(isword(vshader[j]))j++;
        const word=vshader.substr(i,j-i);
        if(word=='uniform')varType=true;
        if(varType&&istype(word))matchName=1;
        if(matchName)
        {
            UniformVar.push(gl.getUniformLocation(ID,word));
            matchName=0;
            varType=false;
        }
        if(word=='void')break;
    }
    return {
        shader:ID,
        UniLoc:UniformVar,
        AttribLoc:AttributeVar,
    };
}
function initModel(gl,Shader,attrib,idx)
{
    const VBO=gl.createBuffer();
    const VAO=gl.createVertexArray();
    gl.bindVertexArray(VAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    const AttribArray=new Float32Array(attrib);
    console.log(AttribArray);
    gl.bufferData(gl.ARRAY_BUFFER,AttribArray,gl.STATIC_DRAW);
    const attributeCnt=Shader.AttribLoc.length;
    let sum=0,stride=0;
    for(let i=0;i<attributeCnt;i++)stride+=Shader.AttribLoc[i][0];
    for(let i=0;i<attributeCnt;i++)
    {
        const sz=Shader.AttribLoc[i][0];
        gl.vertexAttribPointer(Shader.AttribLoc[i][1],sz,gl.FLOAT,false,stride*gl.FLOAT.size,sum);//注意gl.FLOAT对应的是32位浮点！
        gl.enableVertexAttribArray(Shader.AttribLoc[i][1]);
    }
    const EBO=gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,EBO);
    const IdxArray=new Uint16Array(idx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,IdxArray,gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    return VAO;
}