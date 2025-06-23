"use client";

import React, { useRef, useMemo } from "react";
import styles from "./ElementSelect.module.css";
import { Select, SelectOption } from "../../common/Select/Select";

export interface ElementData {
  name: string;
  protons: number;
  neutrons: number;
  atomicWeight: string;
  symbol: string;
  electronConfiguration: string;
  shells: number[];
}

interface ElementSelectProps {
  elements: ElementData[];
  selectedElementName: string;
  setSelectedElement: React.Dispatch<React.SetStateAction<string>>;
  isSelectFocused: React.MutableRefObject<boolean>;
}

export const ElementSelect = ({
  elements,
  selectedElementName,
  setSelectedElement,
  isSelectFocused,
}: ElementSelectProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const elementOptions: SelectOption[] = useMemo(
    () => elements.map((el) => ({ value: el.name, label: el.name })),
    [elements]
  );

  return (
    <div className={styles.controlGroup}>
      <label>Element:</label>
      <Select
        options={elementOptions}
        value={selectedElementName}
        onChange={setSelectedElement}
        onFocus={() => (isSelectFocused.current = true)}
        onBlur={() => (isSelectFocused.current = false)}
      />
      <div className={styles.navButtonGroup}>
        <button
          className={styles.elementNavButton}
          onMouseDown={() => startChangingElement("up")}
          onMouseUp={stopChangingElement}
          onMouseLeave={stopChangingElement}
          title="Previous element"
        >
          ▲
        </button>
        <button
          className={styles.elementNavButton}
          onMouseDown={() => startChangingElement("down")}
          onMouseUp={stopChangingElement}
          onMouseLeave={stopChangingElement}
          title="Next element"
        >
          ▼
        </button>
      </div>
    </div>
  );
};