import * as rendererGLSL from './renderer';
import * as stylerGLSL from './styler';

function compileShader(gl, sourceCode, type) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('An error occurred compiling the shaders: ' + log + '\nSource:\n' + sourceCode);
    }
    return shader;
}

function compileProgram(gl, glslVS, glslFS) {
    const VS = compileShader(gl, glslVS, gl.VERTEX_SHADER);
    const FS = compileShader(gl, glslFS, gl.FRAGMENT_SHADER);
    this.program = gl.createProgram();
    gl.attachShader(this.program, VS);
    gl.attachShader(this.program, FS);
    gl.linkProgram(this.program);
    gl.deleteShader(VS);
    gl.deleteShader(FS);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        throw new Error('Unable to link the shader program: ' + gl.getProgramInfoLog(this.program));
    }
}

function Point(gl) {
    compileProgram.call(this, gl, rendererGLSL.point.VS, rendererGLSL.point.FS);
    this.vertexPositionAttribute = gl.getAttribLocation(this.program, 'vertexPosition');
    this.featureIdAttr = gl.getAttribLocation(this.program, 'featureID');
    this.vertexScaleUniformLocation = gl.getUniformLocation(this.program, 'vertexScale');
    this.vertexOffsetUniformLocation = gl.getUniformLocation(this.program, 'vertexOffset');
    this.colorTexture = gl.getUniformLocation(this.program, 'colorTex');
    this.widthTexture = gl.getUniformLocation(this.program, 'widthTex');
}
function GenericStyler(gl, glsl, preface, inline) {
    const VS = glsl.VS;
    let FS = glsl.FS;
    FS = FS.replace('$PREFACE', preface);
    FS = FS.replace('$INLINE', inline);
    compileProgram.call(this, gl, VS, FS);
    this.vertexAttribute = gl.getAttribLocation(this.program, 'vertex');
    this.textureLocations = [];
    for (var i = 0; i < 8; i++) {
        this.textureLocations[i] = gl.getUniformLocation(this.program, `property${i}`);
    }
}
function Color(gl, preface, inline) {
    GenericStyler.call(this, gl, stylerGLSL.color, preface, inline);
}
function Width(gl, preface, inline) {
    GenericStyler.call(this, gl, stylerGLSL.width, preface, inline);
}

const renderer = {
    createPointShader: function (gl) {
        return new Point(gl);
    }
};

const styler = {
    createColorShader: function (gl, preface, inline) {
        return new Color(gl, preface, inline);
    },
    createWidthShader: function (gl, preface, inline) {
        return new Width(gl, preface, inline);
    }
};

export { renderer, styler };
