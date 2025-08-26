"use client";

import React, { useEffect, useState, useRef, RefObject } from "react";
import { createPortal } from "react-dom";
import styles from "./ElementModalSimple.module.css";
import { useDraggableModal } from "@/hooks/useDraggableModal";
import { useClickOutside } from "@/hooks/useClickOutside";
import { ExtendedElementConfig } from "@/store/appStore";
import { formatValueWithUnit, formatIonCharge } from "@/utils/elementUtils";
import { useTranslation } from "@/hooks/useTranslation";
import { getElementDescription } from "@/i18n/descriptions";

interface ElementModalSimpleProps {
  element: ExtendedElementConfig;
  currentPosition: { x: number; y: number };
  isManuallyPositioned: boolean;
  onClose: () => void;
  ignoredRefs?: RefObject<HTMLElement | null>[];
}

export const ElementModalSimple = ({
  element,
  currentPosition,
  onClose,
  ignoredRefs,
}: ElementModalSimpleProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { t, translateElementName, language } = useTranslation();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useClickOutside(modalRef, onClose, ignoredRefs, { dragAware: true });

  const {
    setNodeRef,
    listeners,
    attributes,
    style: dragStyle,
  } = useDraggableModal("homepage-modal");

  const getTitle = () => {
    if (element.protons === 0) {
      if (
        element.neutrons > 0 &&
        element.electrons > 0 &&
        element.protons === 0
      )
        return t.nonAtomicMatter;
      if (element.neutrons > 0 && element.electrons === 0)
        return t.freeNeutrons;
      if (element.electrons > 0 && element.neutrons === 0)
        return t.freeElectrons;
      if (
        element.electrons === 0 &&
        element.neutrons === 0 &&
        element.protons === 0
      )
        return t.emptySpace;
    }
    if (element.protons > 118) return t.customParticle;
    if (element.isIsotope && element.charge !== 0)
      return `${t.ionIsotope}: ${translateElementName(element.name)}-${Math.round(element.atomicWeight)}`;
    if (element.isIsotope)
      return `${t.isotope}: ${translateElementName(element.name)}-${Math.round(element.atomicWeight)}`;
    if (element.charge !== 0) return `${t.ion}: ${translateElementName(element.name)}`;
    return translateElementName(element.name);
  };

  const getDescription = () => {
    return getElementDescription(element, language, translateElementName);
  };

  const meltingPointK = element.phaseTransitions.find(
    (pt) => pt.type === "melting"
  )?.temperature_K;
  const boilingPointK = element.phaseTransitions.find(
    (pt) => pt.type === "boiling"
  )?.temperature_K;
  const isCustomParticle =
    element.isIsotope || element.charge !== 0 || element.protons > 118;

  const stabilityClass =
    element.stabilityInfo.type === "stable" ? styles.stable : styles.unstable;

  const showStabilityIcon = [
    "island_of_stability",
    "deformed_stability_peninsula",
  ].includes(element.stabilityInfo.type);

  if (!isMounted) {
    return null;
  }

  const modalStyle: React.CSSProperties = {
    position: "fixed",
    top: `${currentPosition.y}px`,
    left: `${currentPosition.x}px`,
    ...dragStyle,
  };

  const modalClasses = styles.panel;

  const modalContent = (
    <div ref={modalRef} className={modalClasses} style={modalStyle}>
      <div ref={setNodeRef}>
        <div className={styles.header} {...listeners} {...attributes}>
          <h3 className={styles.title}>{getTitle()}</h3>
        </div>
        <div className={styles.contentWrapper}>
          <div className={styles.content}>
            <p className={styles.description}>{getDescription()}</p>
            {element.charge !== 0 &&
              element.protons > 0 &&
              element.protons <= 118 && (
                <div className={styles.ionInfo}>
                  <span className={styles.label}>{t.ionCharge}</span>
                  <span className={styles.value}>
                    {formatIonCharge(element.charge)}
                    <span className={styles.detailValue}>
                      ({element.protons} {t.protons}, {element.electrons} {t.electrons})
                    </span>
                  </span>
                </div>
              )}
            {((element.isIsotope && element.charge === 0) ||
              element.protons > 118) &&
              element.protons > 0 && (
                <div className={styles.stabilityInfo}>
                  <div>
                    <span className={styles.label}>{t.coreStability}</span>
                    <span className={`${styles.value} ${stabilityClass}`}>
                      {element.stabilityInfo.type === 'stable' ? t.stable : t.unstable}
                    </span>
                  </div>
                  {showStabilityIcon && (
                    <a
                      href="https://en.wikipedia.org/wiki/Island_of_stability"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.stabilityIconLink}
                      title="Learn more about the Island of Stability"
                      onClick={(e) => e.stopPropagation()}
                    >
                      🏝️
                    </a>
                  )}
                </div>
              )}
            {element.isIsotope &&
              element.name !== "Unknown" &&
              element.charge === 0 && (
                <div className={styles.isotopeInfo}>
                  <span className={styles.label}>{t.mostCommonIsotope}</span>
                  <span className={styles.value}>
                    {`${translateElementName(element.name)}-${
                      element.protons + element.defaultNeutrons
                    }`}
                    <span className={styles.detailValue}>
                      ({element.defaultNeutrons} {t.neutrons})
                    </span>
                  </span>
                </div>
              )}
            {!isCustomParticle && element.name !== "Unknown" && (
              <>
                <div className={styles.divider}></div>
                <div className={styles.propertiesGrid}>
                  <div className={styles.property}>
                    <span className={styles.label}>{t.atomicNo}</span>
                    <span className={styles.value}>{element.protons}</span>
                  </div>
                  <div className={styles.property}>
                    <span className={styles.label}>{t.atomicMass}</span>
                    <span className={styles.value}>
                      {formatValueWithUnit(element.atomicWeight, "u")}
                    </span>
                  </div>
                  <div className={styles.property}>
                    <span className={styles.label}>{t.group}</span>
                    <span className={styles.value}>
                      {element.group > 0 ? element.group : "N/A"}
                    </span>
                  </div>
                  <div className={styles.property}>
                    <span className={styles.label}>{t.period}</span>
                    <span className={styles.value}>{element.period}</span>
                  </div>
                  <div className={styles.property}>
                    <span className={styles.label}>{t.eConfiguration}</span>
                    <span className={styles.value}>
                      {element.electronConfiguration}
                    </span>
                  </div>
                  <div className={styles.property}>
                    <span className={styles.label}>{t.stateSTP}</span>
                    <span className={styles.value}>
                      {element.stateAtSTP === 'gas' ? t.gas : 
                       element.stateAtSTP === 'liquid' ? t.liquid : 
                       element.stateAtSTP === 'solid' ? t.solid : 
                       element.stateAtSTP}
                    </span>
                  </div>
                  <div className={styles.property}>
                    <span className={styles.label}>{t.meltingPt}</span>
                    <span className={styles.value}>
                      {formatValueWithUnit(meltingPointK, "K")}
                    </span>
                  </div>
                  <div className={styles.property}>
                    <span className={styles.label}>{t.boilingPt}</span>
                    <span className={styles.value}>
                      {formatValueWithUnit(boilingPointK, "K")}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};