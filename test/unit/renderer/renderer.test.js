import Renderer from '../../../src/renderer/Renderer';
import { RTT_WIDTH, MIN_VERTEX_TEXTURE_IMAGE_UNITS_NEEDED, isBrowserSupported, unsupportedBrowserReasons } from '../../../src/renderer/Renderer';

describe('src/renderer/Renderer', () => {
    const getParameter = (parameter) => {
        return parameter;
    };

    describe('WebGL errors', () => {
        const webGLWithNoExtensions = {
            MAX_RENDERBUFFER_SIZE: RTT_WIDTH,
            MAX_VERTEX_TEXTURE_IMAGE_UNITS: MIN_VERTEX_TEXTURE_IMAGE_UNITS_NEEDED,
            getExtension: () => null,
            getParameter
        };
        const webGLWithInvalidParameter = {
            MAX_RENDERBUFFER_SIZE: RTT_WIDTH - 1,
            MAX_VERTEX_TEXTURE_IMAGE_UNITS: MIN_VERTEX_TEXTURE_IMAGE_UNITS_NEEDED,
            getExtension: () => ({}),
            getParameter
        };
        const webGLWithNoExtensionsAndInvalidParameter = {
            MAX_RENDERBUFFER_SIZE: RTT_WIDTH - 1,
            MAX_VERTEX_TEXTURE_IMAGE_UNITS: MIN_VERTEX_TEXTURE_IMAGE_UNITS_NEEDED,
            getExtension: () => null,
            getParameter
        };
        const webGLValidContext = {
            MAX_RENDERBUFFER_SIZE: RTT_WIDTH,
            MAX_VERTEX_TEXTURE_IMAGE_UNITS: MIN_VERTEX_TEXTURE_IMAGE_UNITS_NEEDED,
            getExtension: () => ({}),
            getParameter
        };
        const webGLInvalidImageTextureUnits = {
            MAX_RENDERBUFFER_SIZE: RTT_WIDTH,
            MAX_VERTEX_TEXTURE_IMAGE_UNITS: 8,
            getExtension: () => ({}),
            getParameter
        };
        const canvasWithNoWebGL = { getContext: () => null };
        const canvasWithNoExtensions = {
            getContext: () => webGLWithNoExtensions
        };
        const canvasWithInvalidParameter = {
            getContext: () => webGLWithInvalidParameter
        };

        describe('Constructor', () => {
            it('should throw when there is no webgl context', () => {
                expect(() => {
                    new Renderer(canvasWithNoWebGL);
                }).toThrowError(/WebGL 1 is unsupported/);
            });

            it('should throw when the "OES_texture_float" extension is not available', () => {
                expect(() => {
                    new Renderer(canvasWithNoExtensions);
                }).toThrowError(/WebGL extension 'OES_texture_float' is unsupported/);
            });

            it('should throw when the "MAX_RENDERBUFFER_SIZE" parameter is not big enough', () => {
                expect(() => {
                    new Renderer(canvasWithInvalidParameter);
                }).toThrowError(/WebGL parameter 'gl\.MAX_RENDERBUFFER_SIZE' is below the requirement.*/);
            });
        });

        describe('initialize', () => {
            it('should throw when the "OES_texture_float" extension is not available', () => {
                expect(() => {
                    const renderer = new Renderer();
                    renderer.initialize(webGLWithNoExtensions);
                }).toThrowError(/WebGL extension 'OES_texture_float' is unsupported/);
            });

            it('should throw when the "MAX_RENDERBUFFER_SIZE" parameter is not big enough', () => {
                expect(() => {
                    const renderer = new Renderer();
                    renderer.initialize(webGLWithInvalidParameter);
                }).toThrowError(/WebGL parameter 'gl\.MAX_RENDERBUFFER_SIZE' is below the requirement.*/);
            });
        });

        describe('isBrowserSupported', () => {
            it('should return true for valid WebGL context', () => {
                expect(isBrowserSupported(null, webGLValidContext)).toBe(true);
            });

            const invalidWebGLContextScenarios = [
                webGLWithNoExtensions,
                webGLWithInvalidParameter,
                webGLWithNoExtensionsAndInvalidParameter
            ];
            invalidWebGLContextScenarios.forEach((ctx, i) => {
                it(`should return false for invalid WebGL context (${i})`, () => {
                    expect(isBrowserSupported(null, ctx)).toBe(false);
                });
            });

            it('should return false when WebGL is not available', () => {
                expect(isBrowserSupported(canvasWithNoWebGL)).toBe(false);
            });
        });

        describe('unsupportedBrowserReasons', () => {
            it('should return WebGL unavailable error', () => {
                const reasons = unsupportedBrowserReasons(canvasWithNoWebGL);
                expect(reasons.length).toBe(1);
                expect(reasons[0].message).toMatch(/WebGL 1 is unsupported/);
            });

            const invalidWebGLContextScenarios = [
                {
                    ctx: webGLWithNoExtensions,
                    errors: [
                        /WebGL extension 'OES_texture_float' is unsupported/
                    ]
                },
                {
                    ctx: webGLWithInvalidParameter,
                    errors: [
                        /WebGL parameter 'gl\.MAX_RENDERBUFFER_SIZE' is below the requirement.*/
                    ]
                },
                {
                    ctx: webGLWithNoExtensionsAndInvalidParameter,
                    errors: [
                        /WebGL extension 'OES_texture_float' is unsupported/,
                        /WebGL parameter 'gl\.MAX_RENDERBUFFER_SIZE' is below the requirement.*/
                    ]
                }, {
                    ctx: webGLInvalidImageTextureUnits,
                    errors: [
                        /WebGL parameter 'gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS' is below the requirement*/
                    ]
                }
            ];
            invalidWebGLContextScenarios.forEach((scenario, i) => {
                it(`should return false for invalid WebGL context (${i})`, () => {
                    const reasons = unsupportedBrowserReasons(null, scenario.ctx);
                    expect(reasons.length).toBe(scenario.errors.length);
                    scenario.errors.forEach((errorRegex, i) => {
                        expect(reasons[i]).toMatch(errorRegex);
                    });
                });
            });
        });
    });
});
