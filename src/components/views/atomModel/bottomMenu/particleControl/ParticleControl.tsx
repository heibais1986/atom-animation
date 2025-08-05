"use client";

import React from "react";

import styles from "./ParticleControl.module.css";
import { useAppStore } from "@/store/appStore";
import { useLongPress } from "@/hooks/useLongPress";

interface ParticleControlProps {
  name: string;
  count: number;
  color: string;
  max: number;
  onCountChange: (newCount: number) => void;
}

export const ParticleControl: React.FC<ParticleControlProps> = ({
  name,
  count,
  color,
  max,
  onCountChange,
}) => {
  const { setParticleControlInputFocus } = useAppStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onCountChange(Math.max(0, Math.min(value, max)));
    }
  };

  const handleIncrement = () => {
    if (count < max) {
      onCountChange(count + 1);
    }
  };

  const handleDecrement = () => {
    onCountChange(Math.max(0, count - 1));
  };

  const incrementPressProps = useLongPress(handleIncrement, 60);
  const decrementPressProps = useLongPress(handleDecrement, 60);

  return (
    <div className={styles.particleControl}>
      <div
        className={styles.colorIndicator}
        style={{ backgroundColor: color }}
      />
      <span className={styles.particleName}>{name}</span>
      <div className={styles.inputWrapper}>
        <button {...decrementPressProps} className={styles.particleButton}>
          -
        </button>
        <input
          type="number"
          value={count}
          onChange={handleInputChange}
          className={styles.particleInput}
          min="0"
          max={max}
          onFocus={() => setParticleControlInputFocus(true)}
          onBlur={() => setParticleControlInputFocus(false)}
        />
        <button {...incrementPressProps} className={styles.particleButton}>
          +
        </button>
      </div>
    </div>
  );
};
