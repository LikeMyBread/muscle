/**
 * Defensive WebGL prototype patches.
 *
 * In Three.js (WebGLShader.js / WebGLProgram.js), Three calls:
 *   const shader = gl.createShader(type);
 *   gl.shaderSource(shader, string);
 *   gl.compileShader(shader);
 *
 * If the WebGL context is lost (GPU reset, background tab, browser context limit, etc.),
 * `gl.createShader()` returns `null` per the WebGL specification.
 * Three.js passes `null` to `gl.shaderSource(null, ...)`, causing browsers to throw:
 *   TypeError: Argument 1 ('shader') to WebGL2RenderingContext.shaderSource must be an instance of WebGLShader
 *
 * By guarding these methods against null/undefined, we allow WebGL context loss to be handled
 * gracefully by Three.js and the `webglcontextlost` event handlers without unhandled runtime exceptions.
 */
let installed = false;

export function installWebGLShaderDefenses(force = false): void {
  if (typeof window === 'undefined') return;
  if (installed && !force) return;
  installed = true;

  const contexts = [
    typeof window.WebGLRenderingContext !== 'undefined'
      ? window.WebGLRenderingContext.prototype
      : null,
    typeof window.WebGL2RenderingContext !== 'undefined'
      ? window.WebGL2RenderingContext.prototype
      : null,
  ].filter((c): c is WebGLRenderingContext => Boolean(c));

  for (const proto of contexts) {
    const protoRecord = proto as unknown as Record<string, unknown>;
    if (!proto || protoRecord.__shader_defenses_installed__) continue;
    protoRecord.__shader_defenses_installed__ = true;

    const origShaderSource = proto.shaderSource;
    if (typeof origShaderSource === 'function') {
      proto.shaderSource = function (shader: WebGLShader, source: string) {
        if (!shader) return;
        return origShaderSource.call(this, shader, source);
      };
    }

    const origCompileShader = proto.compileShader;
    if (typeof origCompileShader === 'function') {
      proto.compileShader = function (shader: WebGLShader) {
        if (!shader) return;
        return origCompileShader.call(this, shader);
      };
    }

    const origGetShaderParameter = proto.getShaderParameter;
    if (typeof origGetShaderParameter === 'function') {
      proto.getShaderParameter = function (shader: WebGLShader, pname: GLenum) {
        if (!shader) return false;
        return origGetShaderParameter.call(this, shader, pname);
      };
    }

    const origGetShaderInfoLog = proto.getShaderInfoLog;
    if (typeof origGetShaderInfoLog === 'function') {
      proto.getShaderInfoLog = function (shader: WebGLShader) {
        if (!shader) return '';
        return origGetShaderInfoLog.call(this, shader);
      };
    }

    const origAttachShader = proto.attachShader;
    if (typeof origAttachShader === 'function') {
      proto.attachShader = function (program: WebGLProgram, shader: WebGLShader) {
        if (!program || !shader) return;
        return origAttachShader.call(this, program, shader);
      };
    }

    const origDetachShader = proto.detachShader;
    if (typeof origDetachShader === 'function') {
      proto.detachShader = function (program: WebGLProgram, shader: WebGLShader) {
        if (!program || !shader) return;
        return origDetachShader.call(this, program, shader);
      };
    }

    const origDeleteShader = proto.deleteShader;
    if (typeof origDeleteShader === 'function') {
      proto.deleteShader = function (shader: WebGLShader) {
        if (!shader) return;
        return origDeleteShader.call(this, shader);
      };
    }
  }
}
