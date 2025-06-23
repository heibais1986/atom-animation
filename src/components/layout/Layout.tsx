// src/components/Layout/Layout.tsx
"use client";

import React, { useRef, useEffect } from "react";
import styles from "./Layout.module.css";
import { ElementSelect } from "../AtomModel/ElementSelect/ElementSelect";
import { ElementInfoPanel } from "../AtomModel/ElementInfoPanel";
import { CONFIG } from "../AtomModel/AtomModel";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";

import { useAppStore, useCurrentElement } from "../../store/appStore";
import { elements } from "../AtomModel/elementsData";
import { RefreshButton } from "./RefreshButton/RefreshButton";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const {
    sliderValue,
    isPanelVisible,
    panelPosition,
    setSliderValue,
    setSelectedElement,
    hideInfoPanel,
    setPanelPosition,
    triggerRefresh,
  } = useAppStore();

  const element = useCurrentElement();

  const isSelectFocused = useRef(false);
  const speedSliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateSliderFill = () => {
      const slider = speedSliderRef.current;
      if (slider) {
        const min = Number(slider.min);
        const max = Number(slider.max);
        const value = Number(slider.value);
        const percentage = ((value - min) / (max - min)) * 100;
        slider.style.setProperty("--slider-fill-percentage", `${percentage}%`);
      }
    };
    updateSliderFill();
    const slider = speedSliderRef.current;
    slider?.addEventListener("input", updateSliderFill);
    return () => slider?.removeEventListener("input", updateSliderFill);
  }, [sliderValue]);

  const clickOutsideTracker = useRef<{ x: number; y: number } | null>(null);

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
        if (dist < 5) hideInfoPanel();
      }
      clickOutsideTracker.current = null;
    };
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPanelVisible, hideInfoPanel]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    setPanelPosition({
      x: panelPosition.x + delta.x,
      y: panelPosition.y + delta.y,
    });
  };

  const handleRefresh = () => {
    triggerRefresh();
    hideInfoPanel();
  };

  const electronCount = element.shells.reduce((a, b) => a + b, 0);
  const isLongConfig = element.electronConfiguration.split(" ").length >= 5;

  return (
    <div className={styles.mainContainer}>
      <RefreshButton onClick={handleRefresh} />

      {children}

      <div className={styles.bottomMenu}>
        <div className={styles.elementDisplayWrapper}>
          <div
            className={`${styles.elementDisplay} ${
              isLongConfig ? styles.wideDisplay : ""
            }`}
          >
            <div className={styles.atomicNumber}>{element.protons}</div>
            <div className={styles.electronConfiguration}>
              {element.electronConfiguration}
            </div>
            <div className={styles.elementSymbol}>{element.symbol}</div>
            <div className={styles.elementName}>{element.name}</div>
            <div className={styles.atomicWeight}>{element.atomicWeight}</div>
          </div>
        </div>
        <div className={styles.rightPanel}>
          <div className={styles.controlsRow}>
            <ElementSelect
              elements={elements}
              selectedElementName={element.name}
              setSelectedElement={setSelectedElement}
              isSelectFocused={isSelectFocused}
            />
            <div className={styles.controlGroup} id="speed-control-group">
              <label htmlFor="speed">Speed:</label>
              <input
                id="speed"
                type="range"
                ref={speedSliderRef}
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
