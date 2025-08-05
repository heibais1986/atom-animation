"use client";

import React, { useEffect, useState, useRef, RefObject } from "react";
import { createPortal } from "react-dom";
import styles from "./ElementModalSimple.module.css";
import { useDraggableModal } from "@/hooks/useDraggableModal";
import { useClickOutside } from "@/hooks/useClickOutside";
import { ExtendedElementConfig } from "@/store/appStore";
import { formatValueWithUnit, formatIonCharge } from "@/utils/elementUtils";

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
        return "Non-Atomic Matter";
      if (element.neutrons > 0 && element.electrons === 0)
        return "Free Neutron(s)";
      if (element.electrons > 0 && element.neutrons === 0)
        return "Free Electron(s)";
      if (
        element.electrons === 0 &&
        element.neutrons === 0 &&
        element.protons === 0
      )
        return "Empty Space";
    }
    if (element.protons > 118) return `Custom particle`;
    if (element.isIsotope && element.charge !== 0)
      return `Ion Isotope: ${element.name}-${Math.round(element.atomicWeight)}`;
    if (element.isIsotope)
      return `Isotope: ${element.name}-${Math.round(element.atomicWeight)}`;
    if (element.charge !== 0) return `Ion: ${element.name}`;
    return element.title;
  };

  const getDescription = () => {
    // 1. Special non-atomic particles
    if (element.protons === 0) {
      if (
        element.neutrons > 0 &&
        element.electrons > 0 &&
        element.protons === 0
      )
        return "Although this visualization shows an electron orbiting a neutron, in reality, such a stable system cannot be formed without the attractive force of a proton. This configuration does not represent an atom, but rather a transient cloud of coexisting particles, a state that might exist for a fleeting moment in extreme environments like the heart of a neutron star.";
      if (element.neutrons > 0 && element.electrons === 0)
        return "This represents one or more free neutrons. A single neutron is a subatomic particle that decays outside of a nucleus, while a theoretical cluster of neutrons, known as a neutronium, is only stable under the immense gravity of a neutron star.";
      if (element.electrons > 0 && element.neutrons === 0)
        return "This represents one or more free electrons. Without a positively charged nucleus to form an atom, these fundamental particles exist as a cloud of negative charge or a beam.";
    }

    if (
      element.protons === 0 &&
      element.neutrons === 0 &&
      element.electrons === 0
    ) {
      return "This represents a classical vacuum, a space devoid of any real particles. In quantum physics, however, the vacuum is a dynamic place, constantly fizzing with 'virtual' particle-antiparticle pairs that pop into and out of existence in an instant.";
    }

    if (element.neutrons > 0 && element.electrons > 0 && element.protons === 0)
      return "Non-Atomic Matter";

    // 2. Beyond the fundamental limit of the periodic table (Z > 173)
    if (element.protons > 173) {
      return `This represents a particle beyond the theoretical limit of the periodic table (Z ≈ 173). According to physics, an atom with such an extreme nuclear charge would be fundamentally unstable, as its electric field would be strong enough to pull electron-positron pairs from the vacuum, making a stable electron structure impossible. You're probing the absolute limits of matter.`;
    }

    // 3. Beyond the known periodic table (119 < Z <= 173)
    if (element.protons > 118) {
      return `This is a hypothetical element beyond the currently known periodic table. Scientists are attempting to synthesize elements in this region, searching for a theoretical 'Island of Stability'. Even if found, they are expected to be exceptionally radioactive with extremely short half-lives.`;
    }

    // 4. Fully ionized atom (bare nucleus)
    // if (element.electrons === 0 && element.protons > 0) {
    //   return `This is a bare nucleus of ${element.name}, completely stripped of all its electrons. Such fully ionized atoms are found only in extreme high-energy environments like the core of stars or inside particle accelerators.`;
    // }

    // 5. Nuclei without neutrons (for Z > 1)
    if (element.neutrons === 0 && element.protons > 1) {
      return `This nucleus, containing only protons and no neutrons, is exceptionally unstable. The lack of stabilizing neutrons means the intense electrostatic repulsion between protons causes it to fly apart almost instantaneously. For Z=2, this is known as a diproton.`;
    }

    // 6. Ion of an Isotope (combined case)
    if (element.isIsotope && element.charge !== 0 && element.protons > 0) {
      const electronChange = element.charge > 0 ? "lost" : "gained";
      return `This is an ion of the isotope ${element.name}-${Math.round(
        element.atomicWeight
      )}. This charged isotope has ${electronChange} electrons, altering its chemical reactivity and bonding behavior compared to the neutral atom.`;
    }

    // 7. Neutral Isotope
    if (element.isIsotope && element.protons > 0) {
      return `This is an isotope of ${
        element.name
      } with a mass number of ${Math.round(
        element.atomicWeight
      )}. It contains the standard ${element.protons} protons, but has ${
        element.neutrons
      } neutrons.`;
    }

    // 8. Standard Ion
    if (element.charge !== 0 && element.protons > 0) {
      return `This is an ion of ${element.name}. An ion is an atom that has a net electrical charge because its number of electrons does not equal its number of protons.`;
    }

    // 9. Default description for a standard element
    return element.description;
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
                  <span className={styles.label}>ION CHARGE</span>
                  <span className={styles.value}>
                    {formatIonCharge(element.charge)}
                    <span className={styles.detailValue}>
                      ({element.protons} Protons, {element.electrons} Electrons)
                    </span>
                  </span>
                </div>
              )}
            {((element.isIsotope && element.charge === 0) ||
              element.protons > 118) &&
              element.protons > 0 && (
                <div className={styles.stabilityInfo}>
                  <div>
                    <span className={styles.label}>CORE STABILITY</span>
                    <span className={`${styles.value} ${stabilityClass}`}>
                      {element.stabilityInfo.label}
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
                  <span className={styles.label}>MOST COMMON ISOTOPE</span>
                  <span className={styles.value}>
                    {`${element.name}-${
                      element.protons + element.defaultNeutrons
                    }`}
                    <span className={styles.detailValue}>
                      ({element.defaultNeutrons} Neutrons)
                    </span>
                  </span>
                </div>
              )}
            {!isCustomParticle && element.name !== "Unknown" && (
              <>
                <div className={styles.divider}></div>
                <div className={styles.propertiesGrid}>
                  <div className={styles.property}>
                    <span className={styles.label}>ATOMIC NO.</span>
                    <span className={styles.value}>{element.protons}</span>
                  </div>
                  <div className={styles.property}>
                    <span className={styles.label}>ATOMIC MASS</span>
                    <span className={styles.value}>
                      {formatValueWithUnit(element.atomicWeight, "u")}
                    </span>
                  </div>
                  <div className={styles.property}>
                    <span className={styles.label}>GROUP</span>
                    <span className={styles.value}>
                      {element.group > 0 ? element.group : "N/A"}
                    </span>
                  </div>
                  <div className={styles.property}>
                    <span className={styles.label}>PERIOD</span>
                    <span className={styles.value}>{element.period}</span>
                  </div>
                  <div className={styles.property}>
                    <span className={styles.label}>E. CONFIGURATION</span>
                    <span className={styles.value}>
                      {element.electronConfiguration}
                    </span>
                  </div>
                  <div className={styles.property}>
                    <span className={styles.label}>STATE (STP)</span>
                    <span className={styles.value}>{element.stateAtSTP}</span>
                  </div>
                  <div className={styles.property}>
                    <span className={styles.label}>MELTING PT.</span>
                    <span className={styles.value}>
                      {formatValueWithUnit(meltingPointK, "K")}
                    </span>
                  </div>
                  <div className={styles.property}>
                    <span className={styles.label}>BOILING PT.</span>
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
