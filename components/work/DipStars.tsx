"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// public/dip/field.png is the D.I.P logo traced from Hamdy's original: R = signed
// distance to the outline (128 = edge, 16 steps per grid cell), G+B = rounded
// height of the 3D model. Stars are sampled from it, more densely near edges.
const FIELD = `${base}/dip/field.png`;
const SCALE = 0.0062;

const vertex = /* glsl */ `
  uniform float uP, uTime, uPR, uSize, uScatter, uPush;
  uniform vec2 uMouse;
  attribute vec3 aStart;
  attribute float aSeed, aLum;
  varying float vB, vTw, vBk;
  const float PI = 3.141592653589793;
  void main() {
    // stars fly in from a loose cloud, top of the logo first
    float delay = aSeed * .35 + (.5 - position.y * .24) * .3;
    float t = clamp((uP - delay) / .55, 0., 1.);
    t = t * t * (3. - 2. * t);
    vec3 pos = mix(aStart, position, t);
    float fl = sin(t * PI);
    float a = aSeed * 6.2831 + uTime * .35;
    pos += vec3(cos(a) * (.25 + aSeed * .4), sin(a * 1.3) * (.2 + aSeed * .3), (aSeed - .4) * 1.2) * fl;
    // scroll / tap scatters the logo back into stars
    vec3 dir = normalize(position + vec3(sin(aSeed * 91.), cos(aSeed * 53.), sin(aSeed * 17.) * 1.5) + 1e-4);
    pos += dir * uScatter * (.6 + aSeed * 1.6);
    pos.x += sin(uTime * .9 + aSeed * 40.) * .004;
    pos.y += cos(uTime * .8 + aSeed * 31.) * .004;
    // stars part around the pointer
    vec2 d = pos.xy - uMouse;
    float push = uPush * exp(-dot(d, d) * 9.);
    pos.xy += normalize(d + 1e-5) * push * .22;
    pos.z += push * .25;
    vec4 mv = modelViewMatrix * vec4(pos, 1.);
    gl_Position = projectionMatrix * mv;
    vB = aLum;
    vTw = .75 + .25 * sin(uTime * (1.2 + aSeed * 2.5) + aSeed * 100.);
    vBk = step(.985, fract(aSeed * 13.73));
    gl_PointSize = uSize * (.55 + aLum * .9 + fl * .6 + vBk * 2.) * (.8 + .4 * fract(aSeed * 7.31)) * uPR / -mv.z;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uGold, uLight;
  varying float vB, vTw, vBk;
  void main() {
    float d = length(gl_PointCoord - .5);
    if (d > .5) discard;
    float core = smoothstep(.5, 0., d);
    float glow = pow(core, 3.) + core * .18;
    vec3 col = mix(uGold, uLight, vB * .75 * pow(core, 2.));
    float a = glow * (.3 + vB * .9) * vTw * mix(1., .35, vBk);
    gl_FragColor = vec4(col * a, a);
  }
`;

type Field = { W: number; H: number; d: Uint8ClampedArray };

async function loadField(): Promise<Field> {
  const img = new Image();
  img.src = FIELD;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(img, 0, 0);
  return { W: img.width, H: img.height, d: g.getImageData(0, 0, img.width, img.height).data };
}

function buildStars({ W, H, d }: Field, N: number) {
  const cand: number[] = [];
  const wts: number[] = [];
  let tot = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const s = (d[i] - 128) / 16;
      if (s <= 0) continue;
      const h = (((d[i + 1] << 8) | d[i + 2]) / 65535) * 8;
      tot += 1 + 2.2 * Math.exp(-s / 1.2);
      cand.push(x, y, s, h);
      wts.push(tot);
    }
  const pos = new Float32Array(N * 3);
  const start = new Float32Array(N * 3);
  const seed = new Float32Array(N);
  const lum = new Float32Array(N);
  const n = wts.length;
  for (let k = 0; k < N; k++) {
    const r = Math.random() * tot;
    let lo = 0;
    let hi = n - 1;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (wts[m] < r) lo = m + 1;
      else hi = m;
    }
    const x = cand[lo * 4] + Math.random() - 0.5;
    const y = cand[lo * 4 + 1] + Math.random() - 0.5;
    const s = cand[lo * 4 + 2];
    const h = cand[lo * 4 + 3];
    const edge = s < 1.6;
    let z = 4.5 + h * 1.6; // front face with its rounded bevel
    if (edge && Math.random() < 0.45) z = -6 + Math.random() * (z + 6); // side walls
    else if (Math.random() < 0.12) z = -6; // back face
    pos[k * 3] = (x - W / 2) * SCALE;
    pos[k * 3 + 1] = (H / 2 - y) * SCALE;
    pos[k * 3 + 2] = z * SCALE;
    const u = Math.random() * 2 - 1;
    const th = Math.random() * Math.PI * 2;
    const rad = 3 + Math.random() * 5;
    const q = Math.sqrt(1 - u * u);
    start[k * 3] = Math.cos(th) * q * rad;
    start[k * 3 + 1] = u * rad * 0.7;
    start[k * 3 + 2] = Math.sin(th) * q * rad - 2;
    seed[k] = Math.random();
    lum[k] = Math.min(1, 0.35 + (h / 3.5) * 0.5 + (edge ? 0.35 : 0) + Math.random() * 0.2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  g.setAttribute("aLum", new THREE.BufferAttribute(lum, 1));
  return { geometry: g, height: H * SCALE };
}

function Logo({ count, onReady }: { count: number; onReady: () => void }) {
  const [stars, setStars] = useState<{ geometry: THREE.BufferGeometry; height: number } | null>(null);
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0, on: false, burst: 0 });
  const { camera, size, gl } = useThree();

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uP: { value: 0 },
          uTime: { value: 0 },
          uPR: { value: 1 },
          uSize: { value: 13 },
          uScatter: { value: 0 },
          uPush: { value: 0 },
          uMouse: { value: new THREE.Vector2(99, 99) },
          uGold: { value: new THREE.Color("#d9ae5f") },
          uLight: { value: new THREE.Color("#fff4d6") },
        },
      }),
    [],
  );

  useEffect(() => {
    let off = false;
    loadField().then((f) => {
      if (off) return;
      setStars(buildStars(f, count));
      onReady();
    });
    return () => {
      off = true;
    };
  }, [count, onReady]);

  useEffect(() => {
    const el = gl.domElement;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      pointer.current.on = true;
    };
    const leave = () => (pointer.current.on = false);
    const click = () => (pointer.current.burst = 1);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("click", click);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("click", click);
    };
  }, [gl]);

  // fit the whole logo in view, leaving room for the headline under it
  useEffect(() => {
    if (!stars) return;
    const cam = camera as THREE.PerspectiveCamera;
    const narrow = size.width < 700;
    const tan = Math.tan(((cam.fov / 2) * Math.PI) / 180);
    const fitH = (stars.height * (narrow ? 1.18 : 1.5)) / (2 * tan);
    const fitW = (stars.height * 0.84 * 1.15) / (2 * tan) / (size.width / size.height);
    cam.position.set(0, 0, Math.max(fitH, fitW));
    cam.updateProjectionMatrix();
    if (group.current) group.current.position.y = stars.height * (narrow ? 0.12 : 0.13);
    material.uniforms.uSize.value = narrow ? 11 : 13;
  }, [stars, size, camera, material]);

  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const rot = useRef({ x: 0, y: 0 });

  useFrame((state, dt) => {
    const u = material.uniforms;
    const t = state.clock.elapsedTime;
    const p = pointer.current;
    u.uTime.value = t;
    u.uPR.value = state.gl.getPixelRatio();
    if (stars && u.uP.value < 2) u.uP.value = Math.min(2, u.uP.value + dt * 0.42);
    const sp = Math.min(1, Math.max(0, window.scrollY / Math.max(1, size.height)));
    p.burst = Math.max(0, p.burst - dt * 0.9);
    u.uScatter.value = sp * 1.4 + Math.sin(p.burst * Math.PI) * 0.9;
    const tx = (p.on ? p.x * 0.45 : Math.sin(t * 0.3) * 0.12) + sp * 1.2;
    const ty = p.on ? -p.y * 0.25 : 0;
    rot.current.y += (tx - rot.current.y) * 0.05;
    rot.current.x += (ty - rot.current.x) * 0.05;
    const g = group.current;
    if (!g) return;
    g.rotation.set(rot.current.x, rot.current.y, 0);
    u.uPush.value += ((p.on ? 1 : 0) - u.uPush.value) * 0.1;
    if (p.on) {
      ndc.set(p.x, p.y);
      ray.setFromCamera(ndc, state.camera);
      g.updateMatrixWorld();
      plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion), g.position);
      if (ray.ray.intersectPlane(plane, hit)) {
        g.worldToLocal(hit);
        u.uMouse.value.set(hit.x, hit.y);
      }
    }
  });

  return <group ref={group}>{stars && <points geometry={stars.geometry} material={material} />}</group>;
}

function Dust() {
  const geo = useMemo(() => {
    const n = 900;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (Math.random() - 0.5) * 14;
      p[i * 3 + 1] = (Math.random() - 0.5) * 9;
      p[i * 3 + 2] = -2 - Math.random() * 6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  const ref = useRef<THREE.Points>(null);
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.01;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#d9ae5f" size={0.025} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

export default function DipStars({ count, onReady }: { count: number; onReady: () => void }) {
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ touchAction: "pan-y" }}
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 35, near: 0.1, far: 100, position: [0, 0, 8] }}
      aria-label="نجوم ذهبية بتتجمع وترسم لوجو D.I.P"
    >
      <Dust />
      <Logo count={count} onReady={onReady} />
    </Canvas>
  );
}
