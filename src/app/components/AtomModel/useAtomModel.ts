import { useState } from "react";
import { elements } from "./elements";

export const useAtomModel = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const [selectedName, setSelectedElement] = useState("Magnesium");

  const element = elements.find((el) => el.name === selectedName)!;

  // Powrót do prostej wersji - bez obsługi klawiatury w tym hooku
  return {
    elements,
    element,
    sliderValue,
    setSliderValue,
    setSelectedElement,
  };
};
