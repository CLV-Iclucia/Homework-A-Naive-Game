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
function initShader(gl,vshader,fshader)//返回着色器程序
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
    if(!hasModel)return {
        shader:ID,
        AttribLoc:
        {
            vPos:gl.getAttribLocation(ID, 'aPos'),
        },
        UniLoc:
        {
            view:gl.getUniformLocation(ID,'view'),
            proj:gl.getUniformLocation(ID,'proj'),
            myTex:gl.getUniformLocation(ID,'myTex')
        },
    };
    else return{
        shader:ID,
        AttribLoc:
        {
            vPos:gl.getAttribLocation(ID, 'aPos'),
        },
        UniLoc:
        {
            view:gl.getUniformLocation(ID,'view'),
            proj:gl.getUniformLocation(ID,'proj'),
            model:gl.getUniformLocation(ID,'model'),
            myTex:gl.getUniformLocation(ID,'myTex')
        },
    };
}
function initModel(gl,Shader,pos,idx)
{
    const VBO=gl.createBuffer();
    const VAO=gl.createVertexArray();
    gl.bindVertexArray(VAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    const VerArray=new Float32Array(pos);
    console.log(VerArray);
    gl.bufferData(gl.ARRAY_BUFFER,VerArray,gl.STATIC_DRAW);
    gl.vertexAttribPointer(Shader.AttribLoc.vPos,3,gl.FLOAT,false,3*gl.FLOAT.size,0);//注意gl.FLOAT对应的是32位浮点！
    gl.enableVertexAttribArray(Shader.AttribLoc.vPos);
    const EBO=gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,EBO);
    const IdxArray=new Uint16Array(idx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,IdxArray,gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    return VAO;
}