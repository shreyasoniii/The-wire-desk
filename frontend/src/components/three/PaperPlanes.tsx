"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, Float, Trail } from "@react-three/drei";
import * as THREE from "three";
import { createPaperPlaneGeometry } from "./paperPlane";

type Loop = { a: number; b: number; speed: number; phase: number; y: number; color: string };

const LOOPS: Loop[] = [
  { a: 2.6, b: 1.2, speed: 0.34, phase: 0, y: 0.6, color: "#ff5a1f" },
  { a: 2.1, b: 1.6, speed: 0.27, phase: 2.1, y: -0.4, color: "#f3efe6" },
  { a: 3.0, b: 0.9, speed: 0.22, phase: 4.2, y: 1.3, color: "#7fb08f" },
  { a: 1.7, b: 1.1, speed: 0.4, phase: 1.1, y: -1.3, color: "#f3efe6" },
];

function Plane({ loop, geometry, reduced }: { loop: Loop; geometry: THREE.BufferGeometry; reduced: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const next = useMemo(() => new THREE.Vector3(), []);

  const pos = (t: number, out: THREE.Vector3) =>
    out.set(
      Math.sin(t) * loop.a,
      loop.y + Math.sin(t * 2) * 0.35,
      Math.cos(t) * loop.b - 0.5
    );

  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = (reduced ? 0.8 : clock.elapsedTime) * loop.speed + loop.phase;
    pos(t, g.position);
    pos(t + 0.05, next);
    g.lookAt(next);
    g.rotateZ(Math.cos(t) * -0.5); // bank into the turn
  });

  return (
    <Trail width={1.4} length={reduced ? 0 : 7} color={loop.color} attenuation={(w) => w * w} decay={1.4}>
      <group ref={ref} scale={0.32}>
        <mesh geometry={geometry}>
          <meshStandardMaterial color="#fbf9f4" side={THREE.DoubleSide} flatShading roughness={0.85} />
          <Edges threshold={1} color="#121310" />
        </mesh>
      </group>
    </Trail>
  );
}

function Sheet() {
  return (
    <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.6}>
      <group rotation={[-0.25, 0.4, 0.08]}>
        <mesh>
          <boxGeometry args={[1.5, 1.95, 0.02]} />
          <meshStandardMaterial color="#fbf9f4" roughness={1} />
        </mesh>
        {/* column rules printed on the sheet */}
        {[0.62, 0.5, 0.38, 0.2, 0.08, -0.04, -0.16, -0.28, -0.4, -0.52, -0.64].map((y, i) => (
          <mesh key={y} position={[i < 2 ? -0.12 : 0, y, 0.012]}>
            <planeGeometry args={[i < 2 ? 1.0 : 1.22, i < 2 ? 0.07 : 0.035]} />
            <meshBasicMaterial color={i < 2 ? "#121310" : "#b9ae97"} />
          </mesh>
        ))}
        <mesh position={[0.52, 0.56, 0.012]}>
          <circleGeometry args={[0.07, 24]} />
          <meshBasicMaterial color="#ff5a1f" />
        </mesh>
      </group>
    </Float>
  );
}

export default function PaperPlanes() {
  const geometry = useMemo(() => createPaperPlaneGeometry(), []);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0.4, 6], fov: 42 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 5, 4]} intensity={2} />
      <Sheet />
      {LOOPS.map((loop, i) => (
        <Plane key={i} loop={loop} geometry={geometry} reduced={reduced} />
      ))}
    </Canvas>
  );
}
