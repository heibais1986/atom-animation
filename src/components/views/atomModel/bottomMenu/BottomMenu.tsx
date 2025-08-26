"use client";

import React, { useRef, useEffect } from "react";
import styles from "./BottomMenu.module.css";
import { ParticleControl } from "./particleControl/ParticleControl";
import { ShakeIcon } from "@/assets/icons/ShakeIcon";
import { RefreshIcon } from "@/assets/icons/RefreshIcon";
import { ElementSelect } from "./elementSelect/ElementSelect";
import { CONFIG } from "@/components/views/atomModel/AtomModel";
import { deriveCurrentElement, useAppStore } from "@/store/appStore";
import { elements } from "@/elementsData/elementsData";
import { useTranslation } from "@/hooks/useTranslation";

const PARTICLE_LIMIT = 300;

const formatCharge = (charge: number): string => {
  if (charge === 0) return "";
  const sign = charge > 0 ? "+" : "−";
  const absCharge = Math.abs(charge);
  if (absCharge === 1) return sign;
  return `${absCharge}${sign}`;
};

export const BottomMenu = () => {
  const {
    bottomMenuSliderValue,
    setBottomMenuSliderValue,
    bottomMenuProtons,
    bottomMenuNeutrons,
    bottomMenuElectrons,
    setBottomMenuParticles,
    setSelectedElement,
    triggerAtomModelShake,
    resetAtomModelToDefaults,
    showHomepageModal,
    hideHomepageModal,
  } = useAppStore();
  const element = useAppStore(deriveCurrentElement);
  const speedSliderRef = useRef<HTMLInputElement>(null);
  const { t, translateElementName } = useTranslation();

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
  }, [bottomMenuSliderValue]);

  const handleRefreshClick = () => {
    resetAtomModelToDefaults();
    hideHomepageModal();
  };

  const handleElementSelection = (value: React.SetStateAction<string>) => {
    const newName = typeof value === "function" ? value(element.name) : value;
    setSelectedElement(newName);
  };

  const handleDisplayClick = () => {
    showHomepageModal("right-side");
  };

  const isLongConfig = element.electronConfiguration.split(" ").length >= 5;

  return (
    <div className={styles.bottomMenu}>
      <div className={styles.elementDisplayWrapper}>
        <div
          className={`${styles.elementDisplay} ${
            isLongConfig ? styles.wideDisplay : ""
          }`}
          onClick={handleDisplayClick}
        >
          <div className={styles.atomicNumber}>
            {element.protons > 0 ? element.protons : ""}
          </div>
          <div className={styles.electronConfiguration}>
            {element.electronConfiguration}
          </div>
          <div className={styles.elementSymbol}>
            {element.symbol}
            {element.charge !== 0 && (
              <sup className={styles.chargeIndicator}>
                {formatCharge(element.charge)}
              </sup>
            )}
          </div>
          <div className={styles.elementName}>{translateElementName(element.name)}</div>
          <div className={styles.atomicWeight}>{element.atomicWeight}</div>
        </div>
      </div> 
      <div className={styles.rightPanel}>
        <div className={styles.controlsRow}>
          <ElementSelect
            elements={elements}
            selectedElementName={element.name}
            setSelectedElement={handleElementSelection}
          />
          <div className={styles.controlGroup} id="speed-control-group">
            <label htmlFor="speed">{t.speed}</label>
            <input
              id="speed"
              type="range"
              ref={speedSliderRef}
              min={1}
              max={100}
              value={bottomMenuSliderValue}
              onChange={(e) => setBottomMenuSliderValue(Number(e.target.value))}
            />
            <div className={styles.actionButtons}>
              <button
                className={styles.actionButton}
                onClick={triggerAtomModelShake}
                title={t.shakeAtom}
                aria-label={t.shakeAtom}
              >
                <ShakeIcon />
              </button>
              <button
                className={styles.actionButton}
                onClick={handleRefreshClick}
                title={t.resetView}
                aria-label={t.resetView}
              >
                <RefreshIcon size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className={styles.legend}>
          <ParticleControl
            name={t.protons}
            count={bottomMenuProtons}
            color={CONFIG.protonColor}
            max={PARTICLE_LIMIT}
            onCountChange={(newCount) =>
              setBottomMenuParticles({ protons: newCount })
            }
          />
          <ParticleControl
            name={t.neutrons}
            count={bottomMenuNeutrons}
            color={CONFIG.neutronColor}
            max={PARTICLE_LIMIT}
            onCountChange={(newCount) =>
              setBottomMenuParticles({ neutrons: newCount })
            }
          />
          <ParticleControl
            name={t.electrons}
            count={bottomMenuElectrons}
            color={CONFIG.electronColor}
            max={PARTICLE_LIMIT}
            onCountChange={(newCount) =>
              setBottomMenuParticles({ electrons: newCount })
            }
          />
        </div>
      </div>
    </div>
  );
};
