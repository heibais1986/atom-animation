// src/components/layout/BottomMenu/BottomMenu.tsx
"use client";

import React, { useRef, useEffect } from "react";
import styles from "./BottomMenu.module.css";
import { ElementSelect } from "../../AtomModel/ElementSelect/ElementSelect";
import { CONFIG } from "../../AtomModel/AtomModel";
import { useAppStore, useCurrentElement } from "../../../store/appStore";
import { elements } from "../../AtomModel/elementsData";

export const BottomMenu = () => {
  const { sliderValue, setSliderValue, setSelectedElement } = useAppStore();
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

  const electronCount = element.shells.reduce((a, b) => a + b, 0);
  const isLongConfig = element.electronConfiguration.split(" ").length >= 5;

  return (
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
  );
};
