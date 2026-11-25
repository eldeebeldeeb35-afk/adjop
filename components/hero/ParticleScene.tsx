"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { loadImage, samplePortrait, sortSpatially } from "@/lib/samplePortrait";
import { dustFragment, dustVertex, portraitFragment, portraitVertex } from "./shaders";

export type MorphState = { progress: number };

type Props = {
  morph: MorphState;
  count: number;
  // [back, profile looking up, three-quarter front] of the old look
  beforeSrcs: string[];
  // [turned left, front, turned right] of the current look
  afterSrcs: string[];
  active: boolean;
  onReady: () => void;
  onPortraitHover: () => void;
};

const GOLD = new THREE.Color("#e0a54a");
const LIGHT = new THREE.Color("#fff1d0");

function Portrait({ morph, count, beforeSrcs, afterSrcs, onReady, onPortraitHover }: Omit<Props, "active">) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const group = useRef<THREE.Group>(null);
  const mouse = useRef({ strength: 0, lastMove: -1e9, inside: false });
  const turn = useRef({ from: 0, to: 0, t: 1 });
  const { viewport, size, gl } = useThree();

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: portraitVertex,
        fragmentShader: portraitFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uProgress: { value: 0 },
          uViewFrom: { value: 0 },
          uViewTo: { value: 0 },
          uViewT: { value: 1 },
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(9, 9) },
          uMouseStrength: { value: 0 },
          uSize: { value: 14 },
          uPixelRatio: { value: 1 },
          uGold: { value: GOLD },
          uLight: { value: LIGHT },
        },
      }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const images = await Promise.all([...beforeSrcs, ...afterSrcs].map(loadImage));
      if (cancelled) return;
      // every view gets the same number of stars, sorted along a Hilbert curve so
      // star i lands on the same region (hair, eye, beard...) in each view
      const views = images.map((img, i) => sortSpatially(samplePortrait(img, count, 7 + i * 4)));
      const [b0, b1, b2, a0, a1, a2] = views;
      const lumB = new Float32Array(count * 3);
      const lumA = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        lumB.set([b0.brightness[i], b1.brightness[i], b2.brightness[i]], i * 3);
        lumA.set([a0.brightness[i], a1.brightness[i], a2.brightness[i]], i * 3);
      }
      const seeds = new Float32Array(count);
      for (let i = 0; i < count; i++) seeds[i] = Math.random();
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(b0.positions, 3));
      g.setAttribute("aB1", new THREE.BufferAttribute(b1.positions, 3));
      g.setAttribute("aB2", new THREE.BufferAttribute(b2.positions, 3));
      g.setAttribute("aA0", new THREE.BufferAttribute(a0.positions, 3));
      g.setAttribute("aA1", new THREE.BufferAttribute(a1.positions, 3));
      g.setAttribute("aA2", new THREE.BufferAttribute(a2.positions, 3));
      g.setAttribute("aLumB", new THREE.BufferAttribute(lumB, 3));
      g.setAttribute("aLumA", new THREE.BufferAttribute(lumA, 3));
      g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2);
      setGeometry(g);
      onReady();
    })();
    return () => {
      cancelled = true;
    };
  }, [beforeSrcs, afterSrcs, count, onReady]);

  useEffect(() => () => geometry?.dispose(), [geometry]);

  // only real pointer movement counts (R3F reports a centred pointer before any)
  useEffect(() => {
    const onMove = () => (mouse.current.lastMove = performance.now());
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // portrait framing: fills most of the height; on wide screens it sits on the
  // left so the name (RTL, right side) has room.
  const wide = viewport.width / viewport.height > 1.15;
  const scale = Math.min(viewport.height * (wide ? 0.92 : 0.78), viewport.width * (wide ? 0.62 : 1.05) * 1.25);
  const offsetX = wide ? -viewport.width * 0.17 : 0;
  const offsetY = wide ? -viewport.height * 0.02 : viewport.height * 0.08;

  useFrame((state, delta) => {
    const u = material.uniforms;
    u.uTime.value += Math.min(delta, 0.05);
    u.uProgress.value = morph.progress;
    u.uPixelRatio.value = gl.getPixelRatio();
    // keep stars about the same on-screen size whatever the portrait size
    u.uSize.value = ((scale / viewport.height) * size.height) / 42;

    const m = mouse.current;
    const px = (state.pointer.x * viewport.width) / 2;
    const py = (state.pointer.y * viewport.height) / 2;
    const lx = (px - offsetX) / scale;
    const ly = (py - offsetY) / scale;
    const moving = performance.now() - m.lastMove < 600;
    m.strength += ((moving ? 1 : 0) - m.strength) * Math.min(1, delta * 3);
    u.uMouse.value.set(lx, ly);
    u.uMouseStrength.value = m.strength;

    // fire only on the outside -> inside transition, so the morph runs once per visit
    const inside = Math.abs(lx) < 0.36 && Math.abs(ly) < 0.46;
    if (moving && inside && !m.inside) onPortraitHover();
    if (moving) m.inside = inside;
    // no automatic sway (turned off in the portrait lab): the portrait only leans toward the pointer
    if (group.current) {
      const pointerOn = performance.now() - m.lastMove < 4000 ? 1 : 0;
      const ry = THREE.MathUtils.clamp(state.pointer.x * 0.16 * pointerOn, -0.3, 0.3);
      const rx = -state.pointer.y * 0.08 * pointerOn;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, ry, 0.035);
      // the current look turns its head toward the pointer: the lean picks the
      // left / front / right photo (with hysteresis), and each change is a 1.6s rebuild
      const tr = turn.current;
      const y = group.current.rotation.y;
      const want = y > 0.13 ? 1 : y < -0.13 ? -1 : Math.abs(y) < 0.05 ? 0 : tr.to;
      if (tr.t >= 1 && want !== tr.to) {
        tr.from = tr.to;
        tr.to = want;
        tr.t = 0;
      }
      tr.t = Math.min(1, tr.t + Math.min(delta, 0.05) / 1.6);
      u.uViewFrom.value = tr.from;
      u.uViewTo.value = tr.to;
      u.uViewT.value = tr.t;
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, rx, 0.035);
    }
  });

  if (!geometry) return null;
  return (
    <group ref={group} position={[offsetX, offsetY, 0]} scale={scale}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const { gl } = useThree();
  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = -Math.random() * 8 + 1;
      seeds[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    const m = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uGold: { value: GOLD } },
    });
    return { geometry: g, material: m };
  }, [count]);

  useFrame((_, delta) => {
    material.uniforms.uTime.value += Math.min(delta, 0.05);
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
  });
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

export default function ParticleScene({ active, ...props }: Props) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 35 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <Dust count={props.count > 20000 ? 900 : 450} />
      <Portrait {...props} />
    </Canvas>
  );
}
