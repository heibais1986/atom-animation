"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./BottomMenuMobile.module.css";
import { useAppStore, deriveCurrentElement } from "../../../../store/appStore";
import { elements } from "../../../../elementsData/elementsData";
import { ShakeIcon } from "../../../../assets/icons/ShakeIcon";
import { RefreshIcon } from "../../../../assets/icons/RefreshIcon";
import { ChevronUpIcon } from "../../../../assets/icons/ChevronUpIcon";
import { ElementSelect } from "./elementSelect/ElementSelect";
import { ParticleControl } from "./particleControl/ParticleControl";
import { CONFIG } from "@/components/views/atomModel/AtomModel";
import { usePathname } from "next/navigation";

const PARTICLE_LIMIT = 300;

export const BottomMenuMobile = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const element = useAppStore(deriveCurrentElement);
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
    hideHomepageModal,
  } = useAppStore();
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

    if (isExpanded) {
      updateSliderFill();
      const slider = speedSliderRef.current;
      slider?.addEventListener("input", updateSliderFill);
      return () => slider?.removeEventListener("input", updateSliderFill);
    }
  }, [bottomMenuSliderValue, isExpanded]);
  const pathname = usePathname();

  
  if (pathname !== "/") {
    return null;
  }
  const handleRefreshClick = () => {
    resetAtomModelToDefaults();
    hideHomepageModal();
  };

  const handleToggleExpand = () => {
    const willBeExpanded = !isExpanded;
    if (willBeExpanded) {
      hideHomepageModal();
    }
    setIsExpanded(willBeExpanded);
  };

  const handleElementSelection = (value: React.SetStateAction<string>) => {
    const newName = typeof value === "function" ? value(element.name) : value;
    setSelectedElement(newName);
  };

  return (
    <div
      className={`${styles.bottomMenuMobile} ${
        isExpanded ? styles.expanded : ""
      }`}
    >
      <div className={styles.bar}>
        <button
          className={styles.toggleButton}
          onClick={handleToggleExpand}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
        >
          <ChevronUpIcon />
        </button>
        <div className={styles.elementSelectorWrapper}>
          <ElementSelect
            elements={elements}
            selectedElementName={element.name}
            setSelectedElement={handleElementSelection}
          />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.particleControls}>
          <ParticleControl
            name="Protons"
            count={bottomMenuProtons}
            color={CONFIG.protonColor}
            max={PARTICLE_LIMIT}
            onCountChange={(newCount) =>
              setBottomMenuParticles({ protons: newCount })
            }
          />
          <ParticleControl
            name="Neutrons"
            count={bottomMenuNeutrons}
            color={CONFIG.neutronColor}
            max={PARTICLE_LIMIT}
            onCountChange={(newCount) =>
              setBottomMenuParticles({ neutrons: newCount })
            }
          />
          <ParticleControl
            name="Electrons"
            count={bottomMenuElectrons}
            color={CONFIG.electronColor}
            max={PARTICLE_LIMIT}
            onCountChange={(newCount) =>
              setBottomMenuParticles({ electrons: newCount })
            }
          />
        </div>

        <div className={styles.controlsRow}>
          <div className={styles.controlGroup}>
            <label htmlFor="speedMobile">Speed:</label>
            <input
              id="speedMobile"
              type="range"
              ref={speedSliderRef}
              min={1}
              max={100}
              value={bottomMenuSliderValue}
              onChange={(e) => setBottomMenuSliderValue(Number(e.target.value))}
            />
          </div>
          <div className={styles.actionButtons}>
            <button
              className={styles.actionButton}
              onClick={triggerAtomModelShake}
              title="Shake Atom"
              aria-label="Shake Atom"
            >
              <ShakeIcon />
            </button>
            <button
              className={styles.actionButton}
              onClick={handleRefreshClick}
              title="Reset View"
              aria-label="Reset View"
            >
              <RefreshIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
