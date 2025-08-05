"use client";

import React, { useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import styles from "./AtomModel.module.css";
import { useAppStore, deriveCurrentElement } from "../../../store/appStore";
import { Nucleus } from "./atomParts/Nucleus";
import { OrbitRing } from "./atomParts/OrbitRing";
import { Electron } from "./atomParts/Electron";

const DETAILED_VIEW_CONFIG = {
  ATOM_POSITION: new THREE.Vector3(-16, 0, 0),
  CAMERA_TARGET: new THREE.Vector3(-12, 0, 0),
  CAMERA_POSITION: new THREE.Vector3(-12, 2, 14),
};
export const CONFIG = {
  modelScale: 1.35,
  initialRotation: new THREE.Euler(Math.PI / 4, Math.PI / 0.6, 0),
  cameraPosition: new THREE.Vector3(0, 5.6, 16.8),
  cameraFov: 50,
  hemisphereLightSkyColor: "#ffffff",
  hemisphereLightGroundColor: "#bbbbbb",
  hemisphereLightIntensity: 1.0,
  directionalLightIntensity: 1.0,
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
  orbitRingOpacity: 0.15,
  orbitRingThickness: 0.005,
  shellDistances: [2, 3.2, 4.4, 5.6, 6.8, 8.0, 9.2],
  speedConstant: 1.5 * Math.PI,
  sliderMidpoint: 50,
};

const ScenePhysics = ({
  modelGroupRef,
  controlsRef,
  linearVelocity,
  rotationAxis,
  rotationSpeed,
  targetPosition,
  targetCameraPosition,
  targetControlsTarget,
  isCameraAnimating,
  setIsCameraAnimating,
  keysPressed,
}: {
  modelGroupRef: React.RefObject<THREE.Group>;
  controlsRef: React.RefObject<OrbitControlsImpl>;
  linearVelocity: React.RefObject<THREE.Vector3>;
  rotationAxis: React.RefObject<THREE.Vector3>;
  rotationSpeed: React.RefObject<number>;
  targetPosition: React.RefObject<THREE.Vector3>;
  targetCameraPosition: React.RefObject<THREE.Vector3>;
  targetControlsTarget: React.RefObject<THREE.Vector3>;
  isCameraAnimating: boolean;
  setIsCameraAnimating: (isAnimating: boolean) => void;
  keysPressed: React.RefObject<{ [key: string]: boolean }>;
}) => {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const model = modelGroupRef.current;
    const controls = controlsRef.current;

    if (!model || !controls) return;

    if (Math.abs(rotationSpeed.current) > 0.01) {
      model.rotateOnAxis(rotationAxis.current, rotationSpeed.current * delta);
      rotationSpeed.current *= 0.99;
    }

    const panSpeed = 2.0;
    const panVector = new THREE.Vector3();

    if (keysPressed.current) {
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
      const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);

      if (keysPressed.current["ArrowLeft"]) panVector.add(right);
      if (keysPressed.current["ArrowRight"]) panVector.sub(right);
      if (keysPressed.current["ArrowDown"]) panVector.add(up);
      if (keysPressed.current["ArrowUp"]) panVector.sub(up);
    }

    if (panVector.lengthSq() > 0) {
      if (isCameraAnimating) {
        setIsCameraAnimating(false);
      }
      linearVelocity.current.set(0, 0, 0);

      const targetDistance = camera.position.distanceTo(controls.target);
      panVector
        .normalize()
        .multiplyScalar(panSpeed * delta * targetDistance * 0.25);

      camera.position.add(panVector);
      controls.target.add(panVector);
    } else {
      if (linearVelocity.current.lengthSq() > 0.0001) {
        model.position.add(
          linearVelocity.current.clone().multiplyScalar(delta)
        );
        linearVelocity.current.multiplyScalar(0.95);
        controls.target.copy(model.position);
      } else {
        if (isCameraAnimating) {
          const smoothingFactor = 0.05;
          model.position.lerp(targetPosition.current, smoothingFactor);
          camera.position.lerp(targetCameraPosition.current, smoothingFactor);
          controls.target.lerp(targetControlsTarget.current, smoothingFactor);

          const modelDist = model.position.distanceTo(targetPosition.current);
          const cameraDist = camera.position.distanceTo(
            targetCameraPosition.current
          );
          const controlsDist = controls.target.distanceTo(
            targetControlsTarget.current
          );

          if (modelDist < 0.01 && cameraDist < 0.01 && controlsDist < 0.01) {
            setIsCameraAnimating(false);
          }
        }
      }
    }
    controls.update();
  });

  return null;
};

export const AtomModel = () => {
  const {
    bottomMenuSliderValue,
    bottomMenuRefreshCounter,
    setSelectedElement,
    bottomMenuShakeCounter,
    isAtomModelInFocusView,
    setIsAtomModelInFocusView,
    hideHomepageModal,
  } = useAppStore();
  const element = useAppStore(deriveCurrentElement);

  const modelGroupRef = useRef<THREE.Group>(null!);
  const controlsRef = useRef<OrbitControlsImpl>(null!);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const rightClickStartPos = useRef<{ x: number; y: number } | null>(null);
  const leftClickStartPos = useRef<{ x: number; y: number } | null>(null);
  const userHasInteracted = useRef(false);
  const currentMouseButton = useRef<number | null>(null);

  const linearVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const rotationAxis = useRef(new THREE.Vector3(0, 1, 0));
  const rotationSpeed = useRef(0);
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));
  const targetCameraPosition = useRef(
    new THREE.Vector3(
      CONFIG.cameraPosition.x,
      CONFIG.cameraPosition.y,
      CONFIG.cameraPosition.z
    )
  );
  const targetControlsTarget = useRef(new THREE.Vector3(0, 0, 0));

  const totalNucleons = element.protons + element.neutrons;
  const nucleusRadius =
    totalNucleons > 0
      ? CONFIG.nucleonBaseRadius *
        CONFIG.modelScale *
        Math.cbrt(totalNucleons) *
        CONFIG.nucleusScaleFactor
      : 0;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        event.preventDefault();
        keysPressed.current[event.key] = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        event.preventDefault();
        keysPressed.current[event.key] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isAtomModelInFocusView) {
      userHasInteracted.current = false;
    }

    if (userHasInteracted.current && !isAtomModelInFocusView) {
      return;
    }

    if (isAtomModelInFocusView) {
      targetPosition.current.copy(DETAILED_VIEW_CONFIG.ATOM_POSITION);
      targetControlsTarget.current.copy(DETAILED_VIEW_CONFIG.CAMERA_TARGET);
      targetCameraPosition.current.copy(DETAILED_VIEW_CONFIG.CAMERA_POSITION);
    } else {
      targetPosition.current.set(0, 0, 0);
      targetControlsTarget.current.set(0, 0, 0);
      targetCameraPosition.current.copy(CONFIG.cameraPosition);
    }
  }, [isAtomModelInFocusView]);

  useEffect(() => {
    if (bottomMenuRefreshCounter > 0) {
      if (modelGroupRef.current && controlsRef.current) {
        userHasInteracted.current = false;
        setIsAtomModelInFocusView(false);

        modelGroupRef.current.position.set(0, 0, 0);
        modelGroupRef.current.rotation.set(
          CONFIG.initialRotation.x,
          CONFIG.initialRotation.y,
          CONFIG.initialRotation.z
        );

        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.object.position.copy(CONFIG.cameraPosition);
        controlsRef.current.update();

        linearVelocity.current.set(0, 0, 0);
        rotationSpeed.current = 0;
      }
    }
  }, [bottomMenuRefreshCounter, setIsAtomModelInFocusView]);

  const triggerAtomModelShake = useCallback(() => {
    userHasInteracted.current = false;
    setIsAtomModelInFocusView(false);
    linearVelocity.current.set(0, 0, 0);

    const angularMinStrength = 10;
    const angularMaxStrength = 18;

    const newAxis = new THREE.Vector3();
    do {
      newAxis.set(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      );
    } while (newAxis.lengthSq() === 0);
    newAxis.normalize();
    rotationAxis.current.copy(newAxis);

    const speed =
      angularMinStrength +
      Math.random() * (angularMaxStrength - angularMinStrength);
    rotationSpeed.current = speed;
  }, [setIsAtomModelInFocusView]);

  useEffect(() => {
    if (bottomMenuShakeCounter > 0) {
      triggerAtomModelShake();
    }
  }, [bottomMenuShakeCounter, triggerAtomModelShake]);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (rightClickStartPos.current) {
      const dist = Math.hypot(
        e.clientX - rightClickStartPos.current.x,
        e.clientY - rightClickStartPos.current.y
      );
      if (dist < 5) {
        setSelectedElement(element.name, { x: e.clientX, y: e.clientY });
      }
    }
    rightClickStartPos.current = null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    currentMouseButton.current = e.button;
    if (e.button === 0) {
      leftClickStartPos.current = { x: e.clientX, y: e.clientY };
    } else if (e.button === 2) {
      rightClickStartPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    currentMouseButton.current = null;
    if (e.button === 0 && leftClickStartPos.current) {
      const dist = Math.hypot(
        e.clientX - leftClickStartPos.current.x,
        e.clientY - leftClickStartPos.current.y
      );
      if (dist < 5) {
        hideHomepageModal();
      }
    }
    leftClickStartPos.current = null;
  };

  const speedMultiplier = (bottomMenuSliderValue / CONFIG.sliderMidpoint) ** 2;

  const dynamicShellDistances = useMemo(() => {
    const baseDistances = CONFIG.shellDistances;
    const numShells = element.shells.length;
    const modelScale = CONFIG.modelScale;

    const nucleusInfluenceFactor = 0.15;
    const scaleFactor = 1 + nucleusRadius * nucleusInfluenceFactor;

    const finalBaseDistances = [...baseDistances];

    if (numShells > baseDistances.length) {
      for (let i = baseDistances.length; i < numShells; i++) {
        const newDist = finalBaseDistances[i - 1] * 1.2;
        finalBaseDistances.push(newDist);
      }
    }

    return finalBaseDistances
      .slice(0, numShells)
      .map((d) => d * modelScale * scaleFactor);
  }, [element.shells.length, nucleusRadius]);

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

  const handleControlsStart = useCallback(() => {
    userHasInteracted.current = true;
    if (isAtomModelInFocusView) {
      setIsAtomModelInFocusView(false);
    }
    linearVelocity.current.set(0, 0, 0);

    if (currentMouseButton.current === 0) {
      rotationSpeed.current = 0;
    }
  }, [isAtomModelInFocusView, setIsAtomModelInFocusView]);

  return (
    <div
      className={styles.animationContainer}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
    >
      <Canvas
        onContextMenu={handleContextMenu}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        gl={{ alpha: true }}
        style={{ background: "transparent" }}
        camera={{ position: CONFIG.cameraPosition, fov: CONFIG.cameraFov }}
      >
        <hemisphereLight
          args={[
            CONFIG.hemisphereLightSkyColor,
            CONFIG.hemisphereLightGroundColor,
            CONFIG.hemisphereLightIntensity,
          ]}
        />
        <directionalLight
          position={CONFIG.directionalLightPosition.toArray()}
          intensity={CONFIG.directionalLightIntensity}
        />
        <group ref={modelGroupRef} rotation={CONFIG.initialRotation}>
          <Nucleus
            protons={element.protons}
            neutrons={element.neutrons}
            clusterRadius={nucleusRadius}
          />
          {element.shells.map((count: number, idx: number) => {
            const speed =
              CONFIG.speedConstant * speedMultiplier * (1 / (idx + 1));
            return (
              <group key={idx} rotation={orientations[idx]}>
                <OrbitRing radius={dynamicShellDistances[idx]} />
                {Array.from({ length: count }).map((_, i: number) => (
                  <Electron
                    key={i}
                    radius={dynamicShellDistances[idx]}
                    speed={speed}
                  />
                ))}
              </group>
            );
          })}
        </group>
        <OrbitControls
          ref={controlsRef}
          enableZoom
          enablePan
          onStart={handleControlsStart}
        />
        <ScenePhysics
          modelGroupRef={modelGroupRef}
          controlsRef={controlsRef}
          linearVelocity={linearVelocity}
          rotationAxis={rotationAxis}
          rotationSpeed={rotationSpeed}
          targetPosition={targetPosition}
          targetCameraPosition={targetCameraPosition}
          targetControlsTarget={targetControlsTarget}
          isCameraAnimating={isAtomModelInFocusView}
          setIsCameraAnimating={setIsAtomModelInFocusView}
          keysPressed={keysPressed}
        />
      </Canvas>
    </div>
  );
};
