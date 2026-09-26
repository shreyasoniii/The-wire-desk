import * as THREE from "three";

/**
 * A folded paper plane pointing down +Z: two wings and a small keel.
 * Built by hand so it stays a handful of triangles.
 */
export function createPaperPlaneGeometry(scale = 1) {
  const nose = [0, 0, 1];
  const left = [-0.62, 0.06, -0.55];
  const right = [0.62, 0.06, -0.55];
  const tail = [0, 0, -0.42];
  const keel = [0, -0.2, -0.5];

  const tris = [
    nose, tail, left, // left wing
    nose, right, tail, // right wing
    nose, keel, tail, // keel, left face
    nose, tail, keel, // keel, right face
  ];

  const positions = new Float32Array(tris.flat().map((v) => v * scale));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/** Converts latitude/longitude in degrees to a point on a sphere. */
export function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}
