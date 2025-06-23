"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./Select.module.css";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const Select = ({
  options,
  value,
  onChange,
  onFocus,
  onBlur,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const handleToggle = () => {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);
    if (nextIsOpen) {
      onFocus?.();
    } else {
      onBlur?.();
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    onBlur?.();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onBlur?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onBlur]);

  return (
    <div className={styles.selectContainer} ref={selectRef}>
      <div
        className={`${styles.selectDisplay} ${isOpen ? styles.isOpen : ""}`}
        onClick={handleToggle}
      >
        <span>{selectedOption?.label || ""}</span>
        <span className={styles.arrow}>▼</span>
      </div>
      {isOpen && (
        <ul className={styles.selectDropdown}>
          {options.map((option) => (
            <li
              key={option.value}
              className={styles.selectOption}
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};