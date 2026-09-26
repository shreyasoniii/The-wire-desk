"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, Line } from "@react-three/drei";
import * as THREE from "three";
import { createPaperPlaneGeometry, latLonToVec3 } from "./paperPlane";

const RADIUS = 2;
const DOTS = 3200;
const INK = new THREE.Color("#121310");
const RULE = new THREE.Color("#b9ae97");
const GREEN = new THREE.Color("#0e5a36");

const DESK = { lat: 19.07, lon: 72.87 }; // the desk the wire goes out from
const CITIES = [
  { lat: 40.71, lon: -74.0 },
  { lat: 51.5, lon: -0.12 },
  { lat: 35.68, lon: 139.69 },
  { lat: -23.55, lon: -46.63 },
  { lat: 6.52, lon: 3.37 },
  { lat: 1.35, lon: 103.82 },
  { lat: -33.86, lon: 151.2 },
  { lat: 37.77, lon: -122.42 },
  { lat: 52.52, lon: 13.4 },
  { lat: 25.2, lon: 55.27 },
];

// Cheap smooth field on the sphere; thresholded it reads like landmasses.
function landField(p: THREE.Vector3) {
  const { x, y, z } = p;
  return (
    Math.sin(x * 1.7 + 0.6) * Math.cos(y * 2.1 - 0.3) +
    Math.sin(z * 1.9 + y * 0.8) * 0.8 +
    Math.cos(x * 3.1 - z * 2.3) * 0.35
  );
}

function HalftoneSphere() {
  const ref = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const golden = Math.PI * (3 - Math.sqrt(5));
    const color = new THREE.Color();
    for (let i = 0; i < DOTS; i++) {
      const y = 1 - (i / (DOTS - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = golden * i;
      const p = new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r);
      const land = landField(p.clone().multiplyScalar(1.2));
      const isLand = land > 0.35;
      const size = isLand ? 0.018 + Math.min(0.018, (land - 0.35) * 0.02) : 0.008;

      dummy.position.copy(p).multiplyScalar(RADIUS);
      dummy.lookAt(p.clone().multiplyScalar(RADIUS * 2));
      dummy.scale.setScalar(size / 0.02);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, isLand ? color.copy(INK) : color.copy(RULE));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, DOTS]}>
      <circleGeometry args={[0.02, 10]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function buildArc(from: THREE.Vector3, to: THREE.Vector3) {
  const mid = from.clone().add(to).multiplyScalar(0.5);
  const dist = from.distanceTo(to);
  mid.normalize().multiplyScalar(RADIUS + dist * 0.42);
  return new THREE.QuadraticBezierCurve3(from, mid, to);
}

function Flight({
  curve,
  offset,
  speed,
  geometry,
  reduced,
}: {
  curve: THREE.QuadraticBezierCurve3;
  offset: number;
  speed: number;
  geometry: THREE.BufferGeometry;
  reduced: boolean;
}) {
  const plane = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const end = useMemo(() => curve.getPoint(1), [curve]);
  const ringQuat = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), end.clone().normalize()),
    [end]
  );
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const raw = reduced ? 0.55 : (clock.elapsedTime * speed + offset) % 1.35;
    const t = Math.min(1, raw);
    const g = plane.current;
    if (g) {
      g.visible = raw < 1;
      const p = curve.getPoint(t);
      g.position.copy(p);
      tmp.copy(curve.getTangent(t)).add(p);
      up.copy(p).normalize();
      g.up.copy(up);
      g.lookAt(tmp);
    }
    const r = ring.current;
    if (r) {
      const land = raw >= 1 ? (raw - 1) / 0.35 : 0;
      r.visible = land > 0;
      r.scale.setScalar(0.4 + land * 2.2);
      (r.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - land);
    }
  });

  return (
    <>
      <group ref={plane} scale={0.11}>
        <mesh geometry={geometry}>
          <meshStandardMaterial color="#fbf9f4" side={THREE.DoubleSide} flatShading roughness={0.9} />
          <Edges threshold={1} color="#121310" />
        </mesh>
      </group>
      <mesh ref={ring} position={end} quaternion={ringQuat} visible={false}>
        <ringGeometry args={[0.05, 0.065, 32]} />
        <meshBasicMaterial color="#ff5a1f" transparent toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
}

function Globe({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const drag = useRef({ active: false, x: 0, vel: 0 });
  const geometry = useMemo(() => createPaperPlaneGeometry(), []);

  const desk = useMemo(() => latLonToVec3(DESK.lat, DESK.lon, RADIUS), []);
  const arcs = useMemo(
    () => CITIES.map((c) => buildArc(desk, latLonToVec3(c.lat, c.lon, RADIUS))),
    [desk]
  );
  const arcPoints = useMemo(() => arcs.map((a) => a.getPoints(48)), [arcs]);

  useEffect(() => {
    const d = drag.current;
    const down = (e: PointerEvent) => {
      d.active = true;
      d.x = e.clientX;
    };
    const move = (e: PointerEvent) => {
      if (!d.active) return;
      d.vel = (e.clientX - d.x) * 0.0035;
      d.x = e.clientX;
    };
    const up = () => (d.active = false);
    const el = document.getElementById("wire-globe");
    el?.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el?.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  useFrame(({ pointer }, delta) => {
    const g = group.current;
    if (!g) return;
    const d = drag.current;
    if (!reduced) g.rotation.y += delta * 0.08;
    g.rotation.y += d.vel;
    d.vel *= d.active ? 0.5 : 0.94;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0.35 - pointer.y * 0.18, 0.05);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -0.12 + pointer.x * 0.06, 0.05);
  });

  return (
    // Starting yaw puts the desk (and its outbound flights) facing the viewer
    <group ref={group} rotation={[0.35, -2.6, -0.12]}>
      <mesh>
        <sphereGeometry args={[RADIUS * 0.985, 64, 64]} />
        <meshBasicMaterial color="#f3efe6" />
      </mesh>
      <HalftoneSphere />

      {arcPoints.map((pts, i) => (
        <Line key={i} points={pts} color="#121310" lineWidth={0.9} dashed dashSize={0.05} gapSize={0.05} transparent opacity={0.55} />
      ))}

      {arcs.map((curve, i) => (
        <Flight
          key={i}
          curve={curve}
          geometry={geometry}
          offset={i * 0.137}
          speed={0.16 + (i % 3) * 0.03}
          reduced={reduced}
        />
      ))}

      <mesh position={desk}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color={GREEN} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function WireGlobe() {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    return () => {
      mq.removeEventListener("change", onChange);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrap}
      id="wire-globe"
      className="h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
      aria-label="A rotating globe with paper planes carrying posts from the desk to cities around the world"
      role="img"
    >
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6.4], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        fallback={<GlobeFallback />}
      >
        <ambientLight intensity={1.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.4} />
        <Globe reduced={reduced} />
      </Canvas>
    </div>
  );
}

export function GlobeFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="halftone aspect-square w-3/4 rounded-full text-ink/30 [mask-image:radial-gradient(circle,black_60%,transparent_71%)]" />
    </div>
  );
}
