/* Sacred Strange 背景特效（由 sacred-strange.html 融入）。
 * 可調參數全部收在 window.SACRED_BG：
 *   rotationSpeed：旋轉速度（0 靜止，預設 0.3）
 *   complexity：層數 0.3~2.0（預設 1.0，愈大圖案愈密、愈耗 GPU）
 *   pattern：0 = 滿版平鋪，1 = 中央曼陀羅（預設 0.05）
 *   opacity：canvas 不透明度（預設 0.32，文字可讀性用）
 *   pixelScale：解析度倍率（預設 1，<1 變糊但省效能）
 *   goldTint：[r,g,b] 暖金色乘子（預設 [1,1,1]，改色先動這裡）
 * 顏色本體在 shader 內的 gold() 與 dimGold/medGold/brightGold/coreGlow/hotGold，
 * 線條粗細在各 glowLine(d, core, bloom, lineWidth, bloomWidth) 的後兩個數字。
 */
window.SACRED_BG = Object.assign({
  rotationSpeed: 0.23,
  complexity: 0.5,
  pattern: 0.02,
  opacity: 0.8,
  pixelScale: 1,
  goldTint: [0.1, 0.5, 1.8],
  enabled: true
}, window.SACRED_BG || {});

window.__sbgInit = function () {
  var canvas = document.getElementById('sacred-bg');
  if (!canvas) return;
  var BG_KEY = 'recomb.bg';
  var cfg = window.SACRED_BG;
  try {
    var stored = localStorage.getItem(BG_KEY);
    if (stored === '0') cfg.enabled = false;
    if (stored === '1') cfg.enabled = true;
  } catch (e) { /* 忽略 */ }

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gl = canvas.getContext('webgl', { alpha: true, antialias: false, preserveDrawingBuffer: false });
  if (!gl) { canvas.style.display = 'none'; return; }

  var vertSrc = [
    'attribute vec2 a_pos;',
    'void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }'
  ].join('\n');

  var fragSrc = [
    'precision highp float;',
    'uniform float u_time;',
    'uniform vec2 u_res;',
    'uniform float u_rotationSpeed;',
    'uniform float u_complexity;',
    'uniform float u_pattern;',
    'uniform vec2 u_mouse;',
    'uniform vec3 u_tint;',
    '#define PI 3.14159265359',
    '#define TAU 6.28318530718',
    '#define PHI 1.6180339887',
    '#define SQRT3 1.7320508',
    'mat2 rot(float a) {',
    '  float c = cos(a), s = sin(a);',
    '  return mat2(c, -s, s, c);',
    '}',
    'vec3 gold(float t) {',
    '  vec3 a = vec3(0.45, 0.32, 0.14);',
    '  vec3 b = vec3(0.45, 0.35, 0.2);',
    '  vec3 c = vec3(1.0, 0.8, 0.5);',
    '  vec3 d = vec3(0.0, 0.1, 0.25);',
    '  return (a + b * cos(TAU * (c * t + d))) * u_tint;',
    '}',
    'vec2 polarFold(vec2 p, float n) {',
    '  float angle = atan(p.y, p.x);',
    '  float sector = TAU / n;',
    '  angle = mod(angle + sector * 0.5, sector) - sector * 0.5;',
    '  angle = abs(angle);',
    '  float r = length(p);',
    '  return vec2(cos(angle), sin(angle)) * r;',
    '}',
    'float sdSegment(vec2 p, vec2 a, vec2 b) {',
    '  vec2 pa = p - a;',
    '  vec2 ba = b - a;',
    '  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);',
    '  return length(pa - ba * h);',
    '}',
    'float sdRing(vec2 p, float r) {',
    '  return abs(length(p) - r);',
    '}',
    'float sdPolygon(vec2 p, float r, float n) {',
    '  float angle = atan(p.y, p.x);',
    '  float sector = TAU / n;',
    '  float a = mod(angle + sector * 0.5, sector) - sector * 0.5;',
    '  float rp = length(p);',
    '  vec2 q = vec2(cos(a), abs(sin(a))) * rp;',
    '  vec2 edge = vec2(cos(sector * 0.5), sin(sector * 0.5)) * r;',
    '  vec2 d = q - edge * clamp(dot(q, edge) / dot(edge, edge), 0.0, 1.0);',
    '  return length(d) * sign(q.x * edge.y - q.y * edge.x);',
    '}',
    'float hexDist(vec2 p) {',
    '  p = abs(p);',
    '  return max(p.x + p.y * 0.577350269, p.y * 1.154700538);',
    '}',
    'vec3 glowLine(float d, vec3 coreColor, vec3 bloomColor, float lineWidth, float bloomWidth) {',
    '  float core = lineWidth / (abs(d) + lineWidth);',
    '  core = pow(core, 2.0);',
    '  float bloom = bloomWidth / (abs(d) + bloomWidth);',
    '  bloom = pow(bloom, 1.5);',
    '  return coreColor * core * u_tint + bloomColor * bloom * 0.4 * u_tint;',
    '}',
    'float starMotif(vec2 p, float symmetry, float breathe, float innerRatio, float petalInfluence) {',
    '  float d = 1e9;',
    '  float doubleSym = symmetry * 2.0;',
    '  vec2 fp = polarFold(p, doubleSym);',
    '  vec2 a1 = vec2(0.5 * breathe, 0.0);',
    '  vec2 b1 = vec2(mix(0.35, 0.32, innerRatio) * breathe, mix(0.15, 0.13, innerRatio) * breathe);',
    '  d = min(d, sdSegment(fp, a1, b1));',
    '  float innerR = mix(0.22, 0.18, innerRatio);',
    '  vec2 a2 = b1;',
    '  vec2 b2 = vec2(innerR * breathe, 0.0);',
    '  d = min(d, sdSegment(fp, a2, b2));',
    '  vec2 a3 = b2;',
    '  vec2 b3 = vec2(mix(0.12, 0.10, innerRatio) * breathe, mix(0.07, 0.06, innerRatio) * breathe);',
    '  d = min(d, sdSegment(fp, a3, b3));',
    '  vec2 a4 = b3;',
    '  vec2 b4 = vec2(0.0, 0.0);',
    '  d = min(d, sdSegment(fp, a4, b4));',
    '  d = min(d, sdRing(p, 0.5 * breathe));',
    '  d = min(d, sdRing(p, innerR * breathe));',
    '  if (petalInfluence > 0.01) {',
    '    float petalR = 0.5 * breathe * 0.35 / PHI;',
    '    vec2 petalCenter = vec2(0.5 * breathe, 0.0);',
    '    float petal = abs(length(fp - petalCenter) - petalR) - 0.002;',
    '    d = min(d, mix(1e9, petal, petalInfluence));',
    '    vec2 innerPetalCenter = vec2(0.5 * breathe * 0.65, 0.0);',
    '    float innerPetalR = 0.5 * breathe * 0.25;',
    '    float innerPetal = abs(length(fp - innerPetalCenter) - innerPetalR) - 0.0015;',
    '    d = min(d, mix(1e9, innerPetal, petalInfluence));',
    '  }',
    '  return d;',
    '}',
    'float hexTileMotif(vec2 p, float scale, float symmetry, float breathe, float innerRatio, float petalInfl) {',
    '  p *= scale;',
    '  vec2 s = vec2(1.0, SQRT3);',
    '  vec2 h = s * 0.5;',
    '  vec2 a = mod(p, s) - h;',
    '  vec2 b = mod(p - h, s) - h;',
    '  vec2 gUV = dot(a, a) < dot(b, b) ? a : b;',
    '  float d = starMotif(gUV, symmetry, breathe, innerRatio, petalInfl);',
    '  return d / scale;',
    '}',
    'float centralMotif(vec2 p, float scale, float symmetry, float breathe, float innerRatio, float petalInfl) {',
    '  p *= scale;',
    '  float d = starMotif(p, symmetry, breathe, innerRatio, petalInfl);',
    '  return d / scale;',
    '}',
    'float geometryLayer(vec2 p, float scale, float symmetry, float breathe, float innerRatio, float petalInfl, float tilingMix) {',
    '  float tiledScale = scale;',
    '  float centralScale = scale * 0.35;',
    '  float effectiveScale = mix(tiledScale, centralScale, tilingMix);',
    '  if (tilingMix < 0.01) {',
    '    return hexTileMotif(p, effectiveScale, symmetry, breathe, innerRatio, petalInfl);',
    '  } else if (tilingMix > 0.99) {',
    '    return centralMotif(p, effectiveScale, symmetry, breathe, innerRatio, petalInfl);',
    '  } else {',
    '    float dTiled = hexTileMotif(p, mix(tiledScale, tiledScale * 0.6, tilingMix), symmetry, breathe, innerRatio, petalInfl);',
    '    float dCentral = centralMotif(p, mix(centralScale * 1.5, centralScale, tilingMix), symmetry, breathe, innerRatio, petalInfl);',
    '    return mix(dTiled, dCentral, tilingMix);',
    '  }',
    '}',
    'float goldenSpiral(vec2 uv, float t, float rotSpd) {',
    '  float r = length(uv);',
    '  float a = atan(uv.y, uv.x);',
    '  float spiralPhase = log(max(r, 0.001)) / log(PHI) * PI * 0.5;',
    '  float spiralD = abs(mod(a - spiralPhase + t * rotSpd * 0.2 + PI, TAU) - PI);',
    '  spiralD = min(spiralD, abs(mod(a - spiralPhase + t * rotSpd * 0.2 + PI + PI, TAU) - PI));',
    '  float fade = smoothstep(0.0, 0.05, r) * smoothstep(0.5, 0.35, r);',
    '  return spiralD * fade + (1.0 - fade);',
    '}',
    'void main() {',
    '  vec2 uv = (gl_FragCoord.xy - u_res * 0.5) / min(u_res.x, u_res.y);',
    '  uv = rot(u_mouse.x) * uv;',
    '  float t = u_time;',
    '  float rotSpeed = u_rotationSpeed;',
    '  float complexity = u_complexity;',
    '  float pat = clamp(u_pattern, 0.0, 1.0);',
    '  float r = length(uv);',
    '  float tilingMix = pat;',
    '  float baseSym = mix(6.0, 10.0, pat);',
    '  float spiralInfluence = smoothstep(0.2, 0.8, pat);',
    '  float centralGlowStr = mix(0.03, 0.12, pat);',
    '  float petalInfluence = smoothstep(0.3, 0.9, pat);',
    '  float objectRadius = mix(1.0, 0.48, pat * pat);',
    '  float objectFade = mix(1.0, smoothstep(objectRadius, objectRadius * 0.7, r), pat);',
    '  float breathe = 1.0 + 0.03 * sin(t * 0.6);',
    '  vec3 dimGold = vec3(0.35, 0.25, 0.12);',
    '  vec3 medGold = vec3(0.7, 0.50, 0.22);',
    '  vec3 brightGold = vec3(0.95, 0.72, 0.32);',
    '  vec3 coreGlow = vec3(1.0, 0.82, 0.55);',
    '  vec3 hotGold = vec3(1.0, 0.92, 0.72);',
    '  vec3 col = vec3(0.02, 0.015, 0.01);',
    '  float numLayers = 2.0 + (complexity - 0.3) * (4.0 / 1.7);',
    '  numLayers = clamp(numLayers, 2.0, 6.0);',
    '  {',
    '    float sym1 = floor(baseSym);',
    '    float rot1 = t * rotSpeed * 0.04;',
    '    vec2 p1 = rot(rot1) * uv;',
    '    float scale1 = mix(2.5, 1.8, pat) * complexity;',
    '    float d1 = geometryLayer(p1, scale1, sym1, breathe, 0.0, petalInfluence * 0.3, tilingMix);',
    '    col += glowLine(d1, medGold, dimGold * 1.5, 0.002, 0.016);',
    '  }',
    '  if (numLayers > 2.0) {',
    '    float sym2 = floor(baseSym + 2.0);',
    '    float rot2 = -t * rotSpeed * 0.06;',
    '    vec2 p2 = rot(rot2) * uv;',
    '    float scale2 = mix(3.5, 2.2, pat) * complexity;',
    '    float innerR2 = mix(0.3, 0.6, pat);',
    '    float d2 = geometryLayer(p2, scale2, sym2, breathe, innerR2, petalInfluence * 0.5, tilingMix);',
    '    float layer2alpha = min(numLayers - 2.0, 1.0);',
    '    col += glowLine(d2, brightGold * 0.8, dimGold * 1.2, 0.0015, 0.014) * layer2alpha;',
    '  }',
    '  if (numLayers > 3.0) {',
    '    float sym3 = floor(mix(5.0, 8.0, pat));',
    '    float rot3 = t * rotSpeed * 0.09;',
    '    vec2 p3 = rot(rot3) * uv;',
    '    float scale3 = mix(4.0, 2.5, pat) * complexity;',
    '    float d3 = geometryLayer(p3, scale3, sym3, breathe * (1.0 + 0.01 * sin(t * 0.5 + 2.0)), 0.5, petalInfluence * 0.7, tilingMix);',
    '    float layer3alpha = min(numLayers - 3.0, 1.0);',
    '    col += glowLine(d3, coreGlow * 0.6, medGold * 0.7, 0.0012, 0.012) * layer3alpha;',
    '  }',
    '  if (numLayers > 4.0) {',
    '    float sym4 = floor(mix(8.0, 12.0, pat));',
    '    float rot4 = t * rotSpeed * mix(0.03, 0.05, pat);',
    '    vec2 p4 = rot(rot4) * uv;',
    '    float d4 = centralMotif(p4, mix(2.2, 1.8, pat), sym4, breathe, 0.7, petalInfluence);',
    '    float centralFade = smoothstep(mix(0.5, 0.48, pat), 0.12, r);',
    '    float layer4alpha = min(numLayers - 4.0, 1.0);',
    '    col += glowLine(d4, hotGold * 0.7, coreGlow * 0.5, 0.0025, 0.022) * centralFade * layer4alpha;',
    '  }',
    '  if (numLayers > 5.0) {',
    '    float ringBreath = 1.0 + 0.04 * sin(t * 0.4);',
    '    float rScale = mix(0.12, 0.10, pat) * ringBreath;',
    '    float ringD = 1e9;',
    '    float polySides1 = mix(6.0, 8.0, pat);',
    '    float polySides2 = mix(8.0, 10.0, pat);',
    '    float pr0 = abs(sdPolygon(rot(t * rotSpeed * 0.02) * uv, rScale * 1.0, polySides1));',
    '    float pr1 = abs(sdPolygon(rot(-t * rotSpeed * 0.025) * uv, rScale * 2.0, polySides2));',
    '    float pr2 = abs(sdPolygon(rot(t * rotSpeed * 0.015) * uv, rScale * 3.0, 12.0));',
    '    float pr3 = abs(sdPolygon(rot(-t * rotSpeed * 0.018) * uv, rScale * 4.0, polySides1));',
    '    ringD = min(ringD, pr0);',
    '    ringD = min(ringD, pr1);',
    '    ringD = min(ringD, pr2);',
    '    ringD = min(ringD, pr3);',
    '    float layer5alpha = min(numLayers - 5.0, 1.0);',
    '    col += glowLine(ringD, brightGold * 0.5, dimGold * 0.5, 0.0012, 0.01) * layer5alpha;',
    '  }',
    '  if (spiralInfluence > 0.01) {',
    '    float spiral = goldenSpiral(uv, t, rotSpeed);',
    '    float spiralGlow = 0.015 / (spiral + 0.015);',
    '    col += gold(0.7 + t * 0.01) * spiralGlow * 0.25 * spiralInfluence;',
    '  }',
    '  if (pat > 0.3) {',
    '    float decoFade = smoothstep(0.3, 0.7, pat);',
    '    float outerRing = abs(r - objectRadius + 0.01) - 0.003;',
    '    float outerGlow = 0.004 / (abs(outerRing) + 0.004);',
    '    col += gold(0.5 + t * 0.015) * outerGlow * 0.35 * decoFade;',
    '    float outerRing2 = abs(r - objectRadius + 0.035) - 0.002;',
    '    float outerGlow2 = 0.003 / (abs(outerRing2) + 0.003);',
    '    col += gold(0.6) * outerGlow2 * 0.2 * decoFade;',
    '    float dotAngle = atan(uv.y, uv.x);',
    '    float dotSymmetry = mix(6.0, 12.0, pat);',
    '    float dotA = mod(dotAngle + PI / dotSymmetry, TAU / dotSymmetry) - PI / dotSymmetry;',
    '    vec2 dotP = vec2(cos(dotA), sin(dotA)) * r;',
    '    vec2 dotCenter = vec2(objectRadius - 0.01, 0.0);',
    '    float dotD = length(dotP - dotCenter) - 0.008;',
    '    float dotGlow = 0.004 / (abs(dotD) + 0.004);',
    '    col += vec3(1.0, 0.9, 0.65) * u_tint * dotGlow * 0.3 * decoFade;',
    '  }',
    '  float centerPulse = 0.8 + 0.2 * sin(t * 1.5);',
    '  float centerGlowD = exp(-r * r * mix(3.0, 6.0, pat)) * centralGlowStr * 2.0 * centerPulse;',
    '  col += hotGold * u_tint * centerGlowD;',
    '  float ambientGlow = exp(-r * r * mix(2.5, 4.0, pat)) * mix(0.1, 0.14, pat);',
    '  col += vec3(0.5, 0.35, 0.16) * u_tint * ambientGlow;',
    '  col *= objectFade;',
    '  float pulse = 0.92 + 0.08 * sin(t * 0.3);',
    '  col *= pulse;',
    '  float vig = 1.0 - r * r * mix(0.35, 0.25, pat);',
    '  vig = max(vig, 0.0);',
    '  col *= (0.65 + vig * 0.35);',
    '  col = col / (1.0 + col * 0.3);',
    '  col = pow(col, vec3(0.95, 0.98, 1.06));',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  var prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  var uTime = gl.getUniformLocation(prog, 'u_time');
  var uRes = gl.getUniformLocation(prog, 'u_res');
  var uRotationSpeed = gl.getUniformLocation(prog, 'u_rotationSpeed');
  var uComplexity = gl.getUniformLocation(prog, 'u_complexity');
  var uPattern = gl.getUniformLocation(prog, 'u_pattern');
  var uMouse = gl.getUniformLocation(prog, 'u_mouse');
  var uTint = gl.getUniformLocation(prog, 'u_tint');

  var dpr = Math.min(window.devicePixelRatio || 1, 2) * (cfg.pixelScale || 1);
  var needsResize = true;
  var paused = false;
  var raf = 0;
  function resize() {
    needsResize = false;
    dpr = Math.min(window.devicePixelRatio || 1, 2) * (cfg.pixelScale || 1);
    var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }
    canvas.style.opacity = String(cfg.opacity);
  }
  function frame(now) {
    if (!cfg.enabled) return;
    if (paused) { raf = requestAnimationFrame(frame); return; }
    if (needsResize) resize();
    gl.uniform1f(uTime, prefersReduced ? 0.0 : now * 0.001);
    gl.uniform1f(uRotationSpeed, cfg.rotationSpeed);
    gl.uniform1f(uComplexity, cfg.complexity);
    gl.uniform1f(uPattern, cfg.pattern);
    gl.uniform2f(uMouse, 0.0, 0.0);
    var gt = cfg.goldTint || [1, 1, 1];
    gl.uniform3f(uTint, gt[0], gt[1], gt[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(frame);
  }
  window.addEventListener('resize', function () { needsResize = true; });
  document.addEventListener('visibilitychange', function () { paused = document.hidden; });
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'param') {
      if (e.data.name === 'ROTATION_SPEED') cfg.rotationSpeed = e.data.value;
      if (e.data.name === 'PATTERN_COMPLEXITY') cfg.complexity = e.data.value;
      if (e.data.name === 'PATTERN') cfg.pattern = e.data.value;
    }
  });
  cfg._start = function () { canvas.style.display = ''; needsResize = true; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
  cfg._stop = function () { cancelAnimationFrame(raf); canvas.style.display = 'none'; };
  resize();
  if (cfg.enabled && !prefersReduced) raf = requestAnimationFrame(frame);
  else if (cfg.enabled && prefersReduced) { gl.uniform1f(uTime, 0.0); gl.uniform1f(uRotationSpeed, cfg.rotationSpeed); gl.uniform1f(uComplexity, cfg.complexity); gl.uniform1f(uPattern, cfg.pattern); gl.uniform2f(uMouse, 0, 0); gl.uniform3f(uTint, 1, 1, 1); gl.drawArrays(gl.TRIANGLES, 0, 3); }
  else canvas.style.display = 'none';
};

window.__sbgInit();
