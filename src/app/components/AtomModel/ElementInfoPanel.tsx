"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./ElementInfoPanel.module.css";
import { ElementConfig } from "./elementsData";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type ElementInfoPanelProps = {
  element: ElementConfig;
  position: { x: number; y: number };
};

const formatValue = (
  value: number | string | undefined | null,
  unit: string = ""
) => {
  if (value === undefined || value === null) return "N/A";
  if (typeof value === "number") {
    return `${value.toLocaleString()} ${unit}`.trim();
  }
  return `${value} ${unit}`.trim();
};

export const ElementInfoPanel = ({
  element,
  position,
}: ElementInfoPanelProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `draggable-panel-${element.name}`,
  });

  const style = {
    top: `${position.y}px`,
    left: `${position.x}px`,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
  };

  const panelContent = (
    <div
      ref={setNodeRef}
      className={styles.panel}
      style={style}
      onMouseDown={(e) => {
        if (!(e.target as HTMLElement).closest(`.${styles.header}`)) {
          e.stopPropagation();
        }
      }}
    >
      <div className={styles.header} {...listeners} {...attributes}>
        <h3 className={styles.title}>{element.title}</h3>
      </div>
      <div className={styles.content}>
        <p className={styles.description}>{element.description}</p>
        <div className={styles.divider}></div>
        <div className={styles.propertiesGrid}>
          {/* Row 1 */}
          <div className={styles.property}>
            <span className={styles.label}>ATOMIC NO.</span>
            <span className={styles.value}>{element.protons}</span>
          </div>
          <div className={styles.property}>
            <span className={styles.label}>ATOMIC MASS</span>
            <span className={styles.value}>
              {formatValue(element.atomicWeight, "u")}
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

          {/* Row 2 */}
          <div className={`${styles.property} ${styles.fullRow}`}>
            <span className={styles.label}>E. CONFIGURATION</span>
            <span className={styles.value}>
              {element.electronConfiguration}
            </span>
          </div>

          {/* Row 3 */}
          <div className={styles.property}>
            <span className={styles.label}>STATE (STP)</span>
            <span className={styles.value}>{element.stateAtSTP}</span>
          </div>
          <div className={styles.property}>
            <span className={styles.label}>MELTING PT.</span>
            <span className={styles.value}>
              {formatValue(element.meltingPointK, "K")}
            </span>
          </div>
          <div className={styles.property}>
            <span className={styles.label}>BOILING PT.</span>
            <span className={styles.value}>
              {formatValue(element.boilingPointK, "K")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMounted) {
    return createPortal(panelContent, document.body);
  }

  return null;
};
