// Plik: useAtomModel.ts

import { useState } from "react";
import { elements } from "./elements"; // Importujemy nową, zunifikowaną listę

export const useAtomModel = () => {
  const [sliderValue, setSliderValue] = useState(50);
  // Zaczynamy od Tlenu, żeby od razu widzieć efekt
  const [selectedName, setSelectedElement] = useState("Oxygen"); 

  const element = elements.find((el) => el.name === selectedName)!;

  return {
    elements,
    element,
    sliderValue,
    setSliderValue,
    setSelectedElement,
  };
};