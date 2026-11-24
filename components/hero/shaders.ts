export const portraitVertex = /* glsl */ `
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseStrength;
  uniform float uSize;
  uniform float uPixelRatio;

  attribute vec3 aTo;
  attribute float aBFrom;
  attribute float aBTo;
  attribute float aSeed;

  varying float vBright;
  varying float vTwinkle;
  varying float vBokeh;

  const float PI = 3.141592653589793;

  void main() {
    // Stars leave in a wave that sweeps down the face, each with its own delay,
    // so the portrait dissolves and re-forms instead of sliding as one piece.
    float delay = aSeed * 0.28 + (0.5 - position.y) * 0.22;
    float t = clamp((uProgress - delay) / 0.5, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);

    vec3 pos = mix(position, aTo, t);
    float flight = sin(t * PI);

    // drift through space mid-flight: a slow swirl plus a push into depth
    float a = aSeed * 6.2831 + uTime * 0.35;
    pos.x += cos(a) * flight * (0.10 + aSeed * 0.18);
    pos.y += sin(a * 1.3) * flight * (0.08 + aSeed * 0.14);
    pos.z += (aSeed - 0.35) * flight * 1.6;

    // idle breathing so the portrait never looks frozen
    pos.x += sin(uTime * 0.9 + aSeed * 40.0) * 0.0025;
    pos.y += cos(uTime * 0.8 + aSeed * 31.0) * 0.0025;

    // stars part around the cursor / finger
    vec2 d = pos.xy - uMouse;
    float dist2 = dot(d, d);
    float push = uMouseStrength * exp(-dist2 * 90.0);
    pos.xy += normalize(d + 1e-5) * push * 0.045;
    pos.z += push * 0.12;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float b = mix(aBFrom, aBTo, t);
    vBright = b;
    vTwinkle = 0.78 + 0.22 * sin(uTime * (1.2 + aSeed * 2.5) + aSeed * 100.0);
    // a few stars are large soft "bokeh" lights, the rest fine glitter
    float r = fract(aSeed * 13.73);
    float bokeh = step(0.975, r);
    vBokeh = bokeh;
    gl_PointSize = uSize * (0.5 + b * 1.0 + flight * 0.6 + bokeh * 2.2) * (0.8 + 0.4 * fract(aSeed * 7.31)) * uPixelRatio / -mv.z;
  }
`;

export const portraitFragment = /* glsl */ `
  uniform vec3 uGold;
  uniform vec3 uLight;
  varying float vBright;
  varying float vTwinkle;
  varying float vBokeh;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    // hot centre + soft halo, like a small light seen through a lens
    float glow = pow(core, 3.0) + core * 0.18;
    vec3 color = mix(uGold, uLight, vBright * 0.7 * pow(core, 2.0));
    float alpha = glow * (0.3 + vBright * 0.9) * vTwinkle * mix(1.0, 0.35, vBokeh);
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

export const dustVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    pos.y += mod(uTime * (0.01 + aSeed * 0.02) + aSeed * 10.0, 10.0) - 5.0;
    pos.x += sin(uTime * 0.1 + aSeed * 20.0) * 0.2;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    vAlpha = (0.25 + 0.75 * aSeed) * (0.6 + 0.4 * sin(uTime * (0.6 + aSeed) + aSeed * 50.0));
    gl_PointSize = (1.0 + aSeed * 2.5) * uPixelRatio * 12.0 / -mv.z;
  }
`;

export const dustFragment = /* glsl */ `
  uniform vec3 uGold;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d) * vAlpha * 0.5;
    gl_FragColor = vec4(uGold * a, a);
  }
`;
