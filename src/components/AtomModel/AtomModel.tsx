// src/components/AtomModel/AtomModel.tsx
"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import styles from "./AtomModel.module.css";
import { useAppStore, useCurrentElement } from "../../store/appStore";

const KeyboardRotator = ({
  modelGroupRef,
  rotationState,
}: {
  modelGroupRef: React.RefObject<THREE.Group>;
  rotationState: React.RefObject<{
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  }>;
}) => {
  useFrame((_, delta) => {
    if (!modelGroupRef.current) return;
    const rotationSpeed = 2;
    if (rotationState.current.up) {
      modelGroupRef.current.rotation.x -= rotationSpeed * delta;
    }
    if (rotationState.current.down) {
      modelGroupRef.current.rotation.x += rotationSpeed * delta;
    }
    if (rotationState.current.left) {
      modelGroupRef.current.rotation.y -= rotationSpeed * delta;
    }
    if (rotationState.current.right) {
      modelGroupRef.current.rotation.y += rotationSpeed * delta;
    }
  });
  return null;
};

export const CONFIG = {
  modelScale: 1.35,
  initialRotation: new THREE.Euler(Math.PI / 4, Math.PI / 0.6, 0),
  cameraPosition: new THREE.Vector3(0, 5.6, 16.8),
  cameraFov: 50,
  ambientLightIntensity: 0.7,
  directionalLightIntensity: 1,
  directionalLightPosition: new THREE.Vector3(10, 10, 5),
  protonColor: "#ff554d",
  neutronColor: "#aaaaaa",
  nucleonBaseRadius: 0.2,
  nucleonDetail: 32,
  nucleusScaleFactor: 0.9,
  nucleonMaterial: { roughness: 0.4, metalness: 0.2 },
  electronColor: "#33ccff",
  electronBaseRadius: 0.1,
  electronDetail: 16,
  electronMaterial: { emissive: "#33ccff", emissiveIntensity: 0.5 },
  orbitRingColor: "#ffffff",
  orbitRingOpacity: 0.3,
  orbitRingThickness: 0.01,
  shellDistances: [2, 3.2, 4.4, 5.6, 6.8, 8.0, 9.2],
  speedConstant: 1.5 * Math.PI,
  sliderMidpoint: 50,
};

const Nucleus = ({
  protons,
  neutrons,
}: {
  protons: number;
  neutrons: number;
}) => {
  const { protonPositions, neutronPositions } = useMemo(() => {
    const total = protons + neutrons;
    if (total === 0) return { protonPositions: [], neutronPositions: [] };
    if (total === 1) {
      const position = [new THREE.Vector3(0, 0, 0)];
      return protons === 1
        ? { protonPositions: position, neutronPositions: [] }
        : { protonPositions: [], neutronPositions: position };
    }
    const points = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < total; i++) {
      const y = 1 - (i / (total - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      const nucleonRadius = CONFIG.nucleonBaseRadius * CONFIG.modelScale;
      const clusterRadius =
        nucleonRadius * Math.cbrt(total) * CONFIG.nucleusScaleFactor;
      points.push(new THREE.Vector3(x, y, z).multiplyScalar(clusterRadius));
    }
    const pPos: THREE.Vector3[] = [];
    const nPos: THREE.Vector3[] = [];
    const particleTypes: ("P" | "N")[] = [];
    for (let i = 0; i < protons; i++) particleTypes.push("P");
    for (let i = 0; i < neutrons; i++) particleTypes.push("N");
    for (let i = particleTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [particleTypes[i], particleTypes[j]] = [
        particleTypes[j],
        particleTypes[i],
      ];
    }
    points.forEach((pos, i) => {
      if (particleTypes[i] === "P") pPos.push(pos);
      else nPos.push(pos);
    });
    return { protonPositions: pPos, neutronPositions: nPos };
  }, [protons, neutrons]);

  return (
    <group>
      {protonPositions.map((pos, i) => (
        <mesh key={`p${i}`} position={pos}>
          <sphereGeometry
            args={[
              CONFIG.nucleonBaseRadius * CONFIG.modelScale,
              CONFIG.nucleonDetail,
              CONFIG.nucleonDetail,
            ]}
          />
          <meshStandardMaterial
            color={CONFIG.protonColor}
            {...CONFIG.nucleonMaterial}
          />
        </mesh>
      ))}
      {neutronPositions.map((pos, i) => (
        <mesh key={`n${i}`} position={pos}>
          <sphereGeometry
            args={[
              CONFIG.nucleonBaseRadius * CONFIG.modelScale,
              CONFIG.nucleonDetail,
              CONFIG.nucleonDetail,
            ]}
          />
          <meshStandardMaterial
            color={CONFIG.neutronColor}
            {...CONFIG.nucleonMaterial}
          />
        </mesh>
      ))}
    </group>
  );
};

const Electron = ({ radius, speed }: { radius: number; speed: number }) => {
  const ref = useRef<THREE.Mesh>(null!);
  const angle = useRef(Math.random() * Math.PI * 2);
  useFrame((_, delta) => {
    angle.current += delta * speed;
    const x = Math.cos(angle.current) * radius;
    const y = Math.sin(angle.current) * radius;
    if (ref.current) ref.current.position.set(x, y, 0);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry
        args={[
          CONFIG.electronBaseRadius * CONFIG.modelScale,
          CONFIG.electronDetail,
          CONFIG.electronDetail,
        ]}
      />
      <meshStandardMaterial
        color={CONFIG.electronColor}
        {...CONFIG.electronMaterial}
      />
    </mesh>
  );
};

const OrbitRing = ({ radius }: { radius: number }) => (
  <mesh>
    <ringGeometry
      args={[
        radius - CONFIG.orbitRingThickness * CONFIG.modelScale,
        radius + CONFIG.orbitRingThickness * CONFIG.modelScale,
        64,
      ]}
    />
    <meshBasicMaterial
      color={CONFIG.orbitRingColor}
      side={THREE.DoubleSide}
      transparent
      opacity={CONFIG.orbitRingOpacity}
    />
  </mesh>
);

export const AtomModel = () => {
  const element = useCurrentElement();
  const { sliderValue, refreshCounter, showInfoPanel } = useAppStore();
  const isSelectFocused = useRef(false);

  const modelGroupRef = useRef<THREE.Group>(null!);
  const controlsRef = useRef<OrbitControlsImpl>(null!);
  const rotationState = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const clickStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (refreshCounter > 0) {
      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.set(
          CONFIG.initialRotation.x,
          CONFIG.initialRotation.y,
          CONFIG.initialRotation.z
        );
      }
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
    }
  }, [refreshCounter]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent, isDown: boolean) => {
      if (
        isSelectFocused.current &&
        (event.key === "ArrowUp" || event.key === "ArrowDown")
      ) {
        return;
      }
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          rotationState.current.up = isDown;
          break;
        case "ArrowDown":
          event.preventDefault();
          rotationState.current.down = isDown;
          break;
        case "ArrowLeft":
          event.preventDefault();
          rotationState.current.left = isDown;
          break;
        case "ArrowRight":
          event.preventDefault();
          rotationState.current.right = isDown;
          break;
        default:
          return;
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => handleKey(e, true);
    const handleKeyUp = (e: KeyboardEvent) => handleKey(e, false);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (clickStartPos.current) {
      const dist = Math.sqrt(
        (e.clientX - clickStartPos.current.x) ** 2 +
          (e.clientY - clickStartPos.current.y) ** 2
      );
      if (dist < 5) {
        showInfoPanel({ x: e.clientX, y: e.clientY });
      }
    }
    clickStartPos.current = null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button === 2) {
      clickStartPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const speedMultiplier = (sliderValue / CONFIG.sliderMidpoint) ** 2;
  const shellDistances = useMemo(
    () => CONFIG.shellDistances.map((d) => d * CONFIG.modelScale),
    []
  );
  const orientations = useMemo(() => {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    return element.shells.map((_: number, idx: number) => {
      if (idx === 0) return new THREE.Euler(Math.PI / 2, 0, 0);
      if (idx === 1) return new THREE.Euler(0, 0, 0);
      if (idx === 2) return new THREE.Euler(Math.PI / 4, Math.PI / 4, 0);
      const angle = (idx - 2) * goldenAngle;
      return new THREE.Euler(angle, angle * 0.5, angle * 0.25);
    });
  }, [element]);

  return (
    <div className={styles.animationContainer}>
      <Canvas
        onContextMenu={handleContextMenu}
        onPointerDown={handlePointerDown}
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
        camera={{ position: CONFIG.cameraPosition, fov: CONFIG.cameraFov }}
      >
        <ambientLight intensity={CONFIG.ambientLightIntensity} />
        <directionalLight
          position={CONFIG.directionalLightPosition.toArray()}
          intensity={CONFIG.directionalLightIntensity}
        />
        <group ref={modelGroupRef} rotation={CONFIG.initialRotation}>
          <Nucleus protons={element.protons} neutrons={element.neutrons} />
          {element.shells.map((count: number, idx: number) => {
            const speed =
              CONFIG.speedConstant * speedMultiplier * (1 / (idx + 1));
            return (
              <group key={idx} rotation={orientations[idx]}>
                <OrbitRing radius={shellDistances[idx]} />
                {Array.from({ length: count }).map((_, i: number) => (
                  <Electron
                    key={i}
                    radius={shellDistances[idx]}
                    speed={speed}
                  />
                ))}
              </group>
            );
          })}
        </group>
        <OrbitControls ref={controlsRef} enableZoom enablePan />
        <KeyboardRotator
          modelGroupRef={modelGroupRef}
          rotationState={rotationState}
        />
      </Canvas>
    </div>
  );
};
