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
  beforeSrc: string;
  afterSrc: string;
  active: boolean;
  onReady: () => void;
  onPortraitHover: () => void;
};

const GOLD = new THREE.Color("#e0a54a");
const LIGHT = new THREE.Color("#fff1d0");

function Portrait({ morph, count, beforeSrc, afterSrc, onReady, onPortraitHover }: Omit<Props, "active">) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const group = useRef<THREE.Group>(null);
  const mouse = useRef({ strength: 0, lastMove: -1e9, inside: false });
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
      const [before, after] = await Promise.all([loadImage(beforeSrc), loadImage(afterSrc)]);
      if (cancelled) return;
      const a = sortSpatially(samplePortrait(before, count, 7));
      const b = sortSpatially(samplePortrait(after, count, 11));
      const seeds = new Float32Array(count);
      for (let i = 0; i < count; i++) seeds[i] = Math.random();
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(a.positions, 3));
      g.setAttribute("aTo", new THREE.BufferAttribute(b.positions, 3));
      g.setAttribute("aBFrom", new THREE.BufferAttribute(a.brightness, 1));
      g.setAttribute("aBTo", new THREE.BufferAttribute(b.brightness, 1));
      g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2);
      setGeometry(g);
      onReady();
    })();
    return () => {
      cancelled = true;
    };
  }, [beforeSrc, afterSrc, count, onReady]);

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
    if (group.current) group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, state.pointer.x * 0.08, 0.04);
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
