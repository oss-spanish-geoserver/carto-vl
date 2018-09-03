import * as s from '../../../../../src/renderer/viz/expressions';
import { validateStaticType, validateMaxArgumentsError, validateCompileTypeError } from './utils';

describe('src/renderer/viz/expressions/transition', () => {
    describe('error control', () => {
        validateCompileTypeError('transition', [undefined]);
        validateCompileTypeError('transition', ['123']);
        validateCompileTypeError('transition', [-4], expressionName =>
            new RegExp(`[\\s\\S]*${expressionName}[\\s\\S]*invalid.*parameter[\\s\\S]*must be greater than[\\s\\S]*`, 'g'));
        validateCompileTypeError('transition', ['number']);
        validateCompileTypeError('transition', ['color']);
        validateCompileTypeError('transition', ['category']);
        validateMaxArgumentsError('transition', ['number', 'number']);
    });

    describe('type', () => {
        validateStaticType('transition', [100], 'number');
    });

    describe('eval', () => {
        it('transition(100) should return the elapsed time % since instantiation (100%)', () => {
            const dateSpy = spyOn(Date, 'now').and.returnValue(10000);
            const transition = s.transition(100);

            dateSpy.and.returnValue(10100);
            const actual = transition.eval();
            expect(actual).toEqual(1);
        });

        it('transition(100) should return the elapsed time % since instantiation (50%)', () => {
            const dateSpy = spyOn(Date, 'now').and.returnValue(10000);
            const transition = s.transition(100);

            dateSpy.and.returnValue(10050);
            const actual = transition.eval();
            expect(actual).toEqual(0.5);
        });

        it('transition(100) should return the elapsed time % since instantiation (0%)', () => {
            const dateSpy = spyOn(Date, 'now').and.returnValue(10000);
            const transition = s.transition(100);

            dateSpy.and.returnValue(10000);
            const actual = transition.eval();
            expect(actual).toEqual(0);
        });
    });
});
