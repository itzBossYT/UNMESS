import React, { useEffect, useRef } from 'react';

export default function AnimatedShaderBackground({ active = true, isDark = true }) {
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);

  useEffect(() => {
    if (!active) {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      const w = window.innerWidth || 1280;
      const h = window.innerHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    syncSize();
    window.addEventListener('resize', syncSize);

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_is_dark;

// Simplex noise / smooth organic flow
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                        -0.577350269189626,
                        0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 mouseNorm = u_mouse / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = uv;
    p.x *= aspect;

    float t = u_time * 0.10;

    float n1 = snoise(p * 1.2 + vec2(t * 0.35, -t * 0.25));
    float n2 = snoise(p * 2.5 - vec2(t * 0.5, t * 0.2) + n1 * 0.6);
    float n3 = snoise(p * 4.0 + vec2(-t * 0.25, t * 0.45) + n2 * 0.4);

    vec2 mPos = mouseNorm;
    mPos.x *= aspect;
    float distMouse = length(p - mPos);
    float mouseWave = smoothstep(0.6, 0.0, distMouse) * 0.25;

    // Palette adapting smoothly
    vec3 deepDark = mix(vec3(0.92, 0.94, 0.98), vec3(0.035, 0.04, 0.065), u_is_dark);
    vec3 darkViolet = mix(vec3(0.85, 0.82, 0.96), vec3(0.12, 0.08, 0.22), u_is_dark);
    vec3 neonViolet = mix(vec3(0.65, 0.52, 0.92), vec3(0.42, 0.22, 0.78), u_is_dark);
    vec3 electricCyan = mix(vec3(0.40, 0.75, 0.88), vec3(0.15, 0.52, 0.72), u_is_dark);

    float blend = clamp((n2 * 0.5 + 0.5) + (n3 * 0.25) + mouseWave, 0.0, 1.0);
    
    vec3 col = mix(deepDark, darkViolet, blend * 0.8);
    col = mix(col, neonViolet, smoothstep(0.45, 0.85, blend) * 0.55);
    col += electricCyan * smoothstep(0.7, 0.95, blend) * 0.4;

    float vig = 1.0 - smoothstep(0.4, 1.4, length(uv - 0.5) * 1.4);
    col *= vig;

    gl_FragColor = vec4(col, 1.0);
}`;

    function compileShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uDark = gl.getUniformLocation(prog, 'u_is_dark');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const onMouseMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = canvas.height - event.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    let start = performance.now();
    function render(now) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uDark, isDark ? 1.0 : 0.0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animFrameId.current = requestAnimationFrame(render);
    }
    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', syncSize);
      window.removeEventListener('mousemove', onMouseMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [active, isDark]);

  return (
    <div 
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 transition-opacity duration-1000 ${
        active ? 'opacity-40 lg:opacity-50' : 'opacity-0'
      }`}
      style={{ display: 'block' }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
      />
      {!active && (
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-background to-surface" />
      )}
    </div>
  );
}

