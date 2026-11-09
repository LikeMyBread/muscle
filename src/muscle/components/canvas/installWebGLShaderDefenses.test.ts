// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { installWebGLShaderDefenses } from './installWebGLShaderDefenses';

describe('installWebGLShaderDefenses', () => {
  it('guards shaderSource and compileShader against null shader references without throwing', () => {
    // Mock WebGL2RenderingContext prototype
    const origShaderSource = vi.fn();
    const origCompileShader = vi.fn();
    const origGetShaderParameter = vi.fn().mockReturnValue(true);

    const mockProto = {
      shaderSource: origShaderSource,
      compileShader: origCompileShader,
      getShaderParameter: origGetShaderParameter,
    };

    (window as unknown as { WebGL2RenderingContext: { prototype: unknown } }).WebGL2RenderingContext = {
      prototype: mockProto,
    };

    installWebGLShaderDefenses(true);

    // Calling with null shader should no-op and NOT call original methods or throw TypeError
    expect(() => {
      mockProto.shaderSource.call(mockProto, null as unknown as WebGLShader, 'void main() {}');
    }).not.toThrow();
    expect(origShaderSource).not.toHaveBeenCalled();

    expect(() => {
      mockProto.compileShader.call(mockProto, null as unknown as WebGLShader);
    }).not.toThrow();
    expect(origCompileShader).not.toHaveBeenCalled();

    expect(() => {
      const res = mockProto.getShaderParameter.call(mockProto, null as unknown as WebGLShader, 0x8b81);
      expect(res).toBe(false);
    }).not.toThrow();
    expect(origGetShaderParameter).not.toHaveBeenCalled();

    // Calling with a valid object should call original method
    const dummyShader = {} as WebGLShader;
    mockProto.shaderSource.call(mockProto, dummyShader, 'void main() {}');
    expect(origShaderSource).toHaveBeenCalledWith(dummyShader, 'void main() {}');
  });
});
