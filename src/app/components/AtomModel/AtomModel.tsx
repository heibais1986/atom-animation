"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import styles from "./AtomModel.module.css";
import { useAtomModel } from "./useAtomModel";
import { ElementInfoPanel } from "./ElementInfoPanel";
import { RefreshButton } from "../RefreshButton/RefreshButton";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";

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

const CONFIG = {
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
  const { elements, element, sliderValue, setSliderValue, setSelectedElement } =
    useAtomModel();

  const modelGroupRef = useRef<THREE.Group>(null!);
  const controlsRef = useRef<OrbitControlsImpl>(null!);
  const rotationState = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });
  const isSelectFocused = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
  const clickStartPos = useRef<{ x: number; y: number } | null>(null);
  const clickOutsideTracker = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button === 2) {
      clickStartPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (clickStartPos.current) {
      const dist = Math.sqrt(
        (e.clientX - clickStartPos.current.x) ** 2 +
          (e.clientY - clickStartPos.current.y) ** 2
      );
      if (dist < 5) {
        setPanelPosition({ x: e.clientX, y: e.clientY });
        setIsPanelVisible(true);
      }
    }
    clickStartPos.current = null;
  };

  useEffect(() => {
    if (!isPanelVisible) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      const onInfoPanel = target.closest('[class*="ElementInfoPanel_panel"]');
      const onControlsPanel = target.closest(`.${styles.secondRow}`);
      if (!onInfoPanel && !onControlsPanel) {
        clickOutsideTracker.current = { x: e.clientX, y: e.clientY };
      }
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (clickOutsideTracker.current) {
        const dist = Math.sqrt(
          (e.clientX - clickOutsideTracker.current.x) ** 2 +
            (e.clientY - clickOutsideTracker.current.y) ** 2
        );
        if (dist < 5) setIsPanelVisible(false);
      }
      clickOutsideTracker.current = null;
    };
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPanelVisible]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    setPanelPosition((prev) => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y,
    }));
  };

  const handleRefresh = () => {
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
    setIsPanelVisible(false);
  };

  const handleNextElement = () => {
    setSelectedElement((currentElementName) => {
      const currentIndex = elements.findIndex(
        (el) => el.name === currentElementName
      );
      const nextIndex = (currentIndex + 1) % elements.length;
      return elements[nextIndex].name;
    });
  };

  const handlePreviousElement = () => {
    setSelectedElement((currentElementName) => {
      const currentIndex = elements.findIndex(
        (el) => el.name === currentElementName
      );
      const prevIndex = (currentIndex - 1 + elements.length) % elements.length;
      return elements[prevIndex].name;
    });
  };

  const startChangingElement = (direction: "up" | "down") => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const changeFunction =
      direction === "up" ? handlePreviousElement : handleNextElement;
    changeFunction();
    intervalRef.current = setInterval(changeFunction, 100);
  };

  const stopChangingElement = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const speedMultiplier = (sliderValue / CONFIG.sliderMidpoint) ** 2;
  const shellDistances = useMemo(
    () => CONFIG.shellDistances.map((d) => d * CONFIG.modelScale),
    []
  );
  const orientations = useMemo(() => {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    return element.shells.map((_, idx) => {
      if (idx === 0) return new THREE.Euler(Math.PI / 2, 0, 0);
      if (idx === 1) return new THREE.Euler(0, 0, 0);
      if (idx === 2) return new THREE.Euler(Math.PI / 4, Math.PI / 4, 0);
      const angle = (idx - 2) * goldenAngle;
      return new THREE.Euler(angle, angle * 0.5, angle * 0.25);
    });
  }, [element]);
  const electronCount = element.shells.reduce((a, b) => a + b, 0);
  const massNumber = element.protons + element.neutrons;

  return (
    <div className={styles.mainContainer} onPointerDown={handlePointerDown}>
      <RefreshButton onClick={handleRefresh} />

      <div className={styles.animationContainer}>
        <Canvas
          onContextMenu={handleContextMenu}
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
            {element.shells.map((count, idx) => {
              const speed =
                CONFIG.speedConstant * speedMultiplier * (1 / (idx + 1));
              return (
                <group key={idx} rotation={orientations[idx]}>
                  <OrbitRing radius={shellDistances[idx]} />
                  {Array.from({ length: count }).map((_, i) => (
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
      <div className={styles.secondRow}>
        <div className={styles.elementDisplay}>
          <div className={styles.atomicNumber}>{element.protons}</div>
          <div className={styles.elementSymbol}>{element.symbol}</div>
          <div className={styles.elementName}>{element.name}</div>
          <div className={styles.atomicMass}>{massNumber}</div>
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.controlsRow}>
            <div className={styles.controlGroup}>
              <label htmlFor="element">Element:</label>
              <select
                id="element"
                value={element.name}
                onChange={(e) => setSelectedElement(e.target.value)}
                onFocus={() => (isSelectFocused.current = true)}
                onBlur={() => (isSelectFocused.current = false)}
              >
                {elements.map((el) => (
                  <option key={el.name} value={el.name}>
                    {el.name}
                  </option>
                ))}
              </select>
              <button
                className={styles.elementNavButton}
                onMouseDown={() => startChangingElement("up")}
                onMouseUp={stopChangingElement}
                onMouseLeave={stopChangingElement}
                title="Previous element"
              >
                &#9650;
              </button>
              <button
                className={styles.elementNavButton}
                onMouseDown={() => startChangingElement("down")}
                onMouseUp={stopChangingElement}
                onMouseLeave={stopChangingElement}
                title="Next element"
              >
                &#9660;
              </button>
            </div>
            <div className={styles.controlGroup}>
              <label htmlFor="speed">Speed:</label>
              <input
                id="speed"
                type="range"
                min={1}
                max={100}
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
              />
            </div>
          </div>
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div
                className={styles.colorIndicator}
                style={{ backgroundColor: CONFIG.protonColor }}
              />
              <span>{`Protons (${element.protons})`}</span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={styles.colorIndicator}
                style={{ backgroundColor: CONFIG.neutronColor }}
              />
              <span>{`Neutrons (${element.neutrons})`}</span>
            </div>
            <div className={styles.legendItem}>
              <div
                className={styles.colorIndicator}
                style={{ backgroundColor: CONFIG.electronColor }}
              />
              <span>{`Electrons (${electronCount})`}</span>
            </div>
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {isPanelVisible && (
          <ElementInfoPanel element={element} position={panelPosition} />
        )}
      </DndContext>
    </div>
  );
};
