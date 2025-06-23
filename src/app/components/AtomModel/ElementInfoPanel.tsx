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
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className={styles.header} {...listeners} {...attributes}>
        <h3 className={styles.title}>{element.title}</h3>
      </div>
      <div className={styles.content}>
        <p>{element.description}</p>
        <div className={styles.stats}>
          <span>Liczba atomowa: {element.protons}</span>
          <span>Powłoki elektronowe: {element.shells.join(", ")}</span>
        </div>
      </div>
    </div>
  );

  if (isMounted) {
    return createPortal(panelContent, document.body);
  }

  return null;
};
