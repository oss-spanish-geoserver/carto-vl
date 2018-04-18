import BaseExpression from './base';
import { number } from '../functions';

/**
 * Get the current zoom level
 *
 * @return {carto.expressions.Base}
 *
 * @example
 * const s = carto.expressions;
 * const viz = new carto.Viz({
 *   width: s.div(s.zoom(), 1000)
 * });
 *
 * @memberof carto.expressions
 * @name zoom
 * @function
 * @api
 */
export default class Zoom extends BaseExpression {
    constructor() {
        super({ zoom: number(0) });
        this.type = 'number';
    }
    eval() {
        return this.zoom.expr;
    }
    _compile(metadata) {
        super._compile(metadata);
        super.inlineMaker = inline => inline.zoom;
    }
    _preDraw(program, drawMetadata, gl) {
        this.zoom.expr = drawMetadata.zoom;
        this.zoom._preDraw(program, drawMetadata, gl);
    }
}
