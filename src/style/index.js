var gl = null;

import jsep from 'jsep';
import * as functions from './functions';
import parseStyleExpression from './parser';
import * as shaders from '../shaders';

export {
    Style,
    setGL,
};
export * from './functions';
export * from './parser';

// TODO removed global gl context
// TODO document API
function setGL(_gl) {
    gl = _gl;
    functions.setGL(gl);
}


function compileShader(styleRootExpr, shaderCreator) {
    var uniformIDcounter = 0;
    var tid = {};
    const colorModifier = styleRootExpr._applyToShaderSource(() => uniformIDcounter++, name => {
        if (tid[name] !== undefined) {
            return tid[name];
        }
        tid[name] = Object.keys(tid).length;
        return tid[name];
    });
    const shader = shaderCreator(gl, colorModifier.preface, colorModifier.inline);
    styleRootExpr._postShaderCompile(shader.program);
    return {
        tid: tid,
        shader: shader
    };
}
Style.prototype._compileColorShader = function () {
    const r = compileShader(this._color, shaders.styler.createColorShader);
    this.propertyColorTID = r.tid;
    this.colorShader = r.shader;
}
Style.prototype._compileWidthShader = function () {
    const r = compileShader(this._width, shaders.styler.createWidthShader);
    this.propertyWidthTID = r.tid;
    this.widthShader = r.shader;
}

/**
 * @api
 * @constructor
 * @param {*} renderer
 * @param {*} schema
 */
function Style(renderer, schema) {
    this.renderer = renderer;
    this.updated = true;
    this.schema = schema;

    this._width = functions.Float(5);
    this._width.parent = this;
    this._width.notify = () => {
        this._compileWidthShader();
        window.requestAnimationFrame(this.renderer.refresh.bind(this.renderer));
    };
    this._color = functions.Color([0, 0, 0, 1]);
    this._color.parent = this;
    this._color.notify = () => {
        this._compileColorShader();
        window.requestAnimationFrame(this.renderer.refresh.bind(this.renderer));
    };
}
/**
 * @api
 * @param {*} float
 */
Style.prototype.setWidth = function (float) {
    this._width = float;
    this.updated = true;
    float.parent = this;
    float.notify = () => {
        this._compileWidthShader();
        window.requestAnimationFrame(this.renderer.refresh.bind(this.renderer));
    };
    float.notify();
}
Style.prototype.replaceChild = function (toReplace, replacer) {
    if (toReplace == this._color) {
        this._color = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    } else if (toReplace == this._width) {
        this._width = replacer;
        replacer.parent = this;
        replacer.notify = toReplace.notify;
    } else {
        console.warn('No child found');
    }
}
/**
 * @api
 * @param {*} color
 */
Style.prototype.setColor = function (color) {
    this._color = color;
    this.updated = true;
    color.parent = this;
    color.notify = () => {
        this._compileColorShader();
        window.requestAnimationFrame(this.renderer.refresh.bind(this.renderer));
    };
    color.notify();
}
/**
 * @api
 */
Style.prototype.getWidth = function () {
    return this._width;
}
/**
 * @api
 */
Style.prototype.getColor = function () {
    return this._color;
}