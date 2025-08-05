import * as THREE from "three";

import { CONFIG } from "../AtomModel";

export const OrbitRing = ({ radius }: { radius: number }) => (
  <mesh>
    <torusGeometry
      args={[radius, CONFIG.orbitRingThickness * CONFIG.modelScale, 16, 64]}
    />
    <meshBasicMaterial
      color={CONFIG.orbitRingColor}
      side={THREE.DoubleSide}
      transparent
      opacity={CONFIG.orbitRingOpacity}
    />
  </mesh>
);
