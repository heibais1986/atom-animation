"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ElementModalMobile.module.css";
import { ExtendedElementConfig } from "@/store/appStore";
import { formatValueWithUnit, formatIonCharge } from "@/utils/elementUtils";

interface ElementModalMobileProps {
  element: ExtendedElementConfig;
  onClose: () => void;
}

export const ElementModalMobile = ({
  element,
  onClose,
}: ElementModalMobileProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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

    if (element.protons > 173) {
      return `This represents a particle beyond the theoretical limit of the periodic table (Z ≈ 173). According to physics, an atom with such an extreme nuclear charge would be fundamentally unstable, as its electric field would be strong enough to pull electron-positron pairs from the vacuum, making a stable electron structure impossible. You're probing the absolute limits of matter.`;
    }

    if (element.protons > 118) {
      return `This is a hypothetical element beyond the currently known periodic table. Scientists are attempting to synthesize elements in this region, searching for a theoretical 'Island of Stability'. Even if found, they are expected to be exceptionally radioactive with extremely short half-lives.`;
    }

    if (element.neutrons === 0 && element.protons > 1) {
      return `This nucleus, containing only protons and no neutrons, is exceptionally unstable. The lack of stabilizing neutrons means the intense electrostatic repulsion between protons causes it to fly apart almost instantaneously. For Z=2, this is known as a diproton.`;
    }

    if (element.isIsotope && element.charge !== 0 && element.protons > 0) {
      const electronChange = element.charge > 0 ? "lost" : "gained";
      return `This is an ion of the isotope ${element.name}-${Math.round(
        element.atomicWeight
      )}. This charged isotope has ${electronChange} electrons, altering its chemical reactivity and bonding behavior compared to the neutral atom.`;
    }

    if (element.isIsotope && element.protons > 0) {
      return `This is an isotope of ${
        element.name
      } with a mass number of ${Math.round(
        element.atomicWeight
      )}. It contains the standard ${element.protons} protons, but has ${
        element.neutrons
      } neutrons.`;
    }

    if (element.charge !== 0 && element.protons > 0) {
      return `This is an ion of ${element.name}. An ion is an atom that has a net electrical charge because its number of electrons does not equal its number of protons.`;
    }

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

  const isDefaultElement =
    !element.isIsotope &&
    element.charge === 0 &&
    element.protons > 0 &&
    element.protons <= 118;

  let mainTitle: string;
  let subtitleText: string | null;

  if (isDefaultElement) {
    const parts = element.title.split(" - ");
    mainTitle = parts[0];
    subtitleText = parts.length > 1 ? parts.slice(1).join(" - ") : null;
  } else {
    mainTitle = getTitle();
    subtitleText = null;
  }

  const modalContent = (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h3 className={styles.title}>{mainTitle}</h3>
          {subtitleText && (
            <span className={styles.subtitle}>
              <span className={styles.subtitleHyphen}>&nbsp;-&nbsp;</span>
              <span className={styles.subtitleText}>{subtitleText}</span>
            </span>
          )}
        </div>
        <button onClick={onClose} className={styles.closeButton}>
          &times;
        </button>
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
  );

  return createPortal(modalContent, document.body);
};
