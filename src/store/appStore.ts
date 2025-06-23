// src/store/appStore.ts
import { create } from "zustand";
import { ElementConfig, elements } from "../components/AtomModel/elementsData";

import type { SetStateAction } from "react"; // Dodano import SetStateAction

interface AppState {
  // Stan
  selectedElementName: string;
  sliderValue: number;
  isPanelVisible: boolean;
  panelPosition: { x: number; y: number };
  refreshCounter: number;

  // Akcje
  setSelectedElement: (update: SetStateAction<string>) => void; // Poprawiony typ akcji
  setSliderValue: (value: number) => void;
  showInfoPanel: (position: { x: number; y: number }) => void;
  hideInfoPanel: () => void;
  setPanelPosition: (position: { x: number; y: number }) => void;
  triggerRefresh: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Stan początkowy
  selectedElementName: "Oxygen",
  sliderValue: 50,
  isPanelVisible: false,
  panelPosition: { x: 0, y: 0 },
  refreshCounter: 0,

  // Implementacje akcji
  setSelectedElement: (update) =>
    set((state) => ({
      selectedElementName:
        typeof update === "function"
          ? update(state.selectedElementName)
          : update,
    })),
  setSliderValue: (value) => set({ sliderValue: value }),
  showInfoPanel: (position) =>
    set({ isPanelVisible: true, panelPosition: position }),
  hideInfoPanel: () => set({ isPanelVisible: false }),
  setPanelPosition: (position) => set({ panelPosition: position }),
  triggerRefresh: () =>
    set((state) => ({ refreshCounter: state.refreshCounter + 1 })),
}));

// Selektor, który zwraca cały obiekt aktualnie wybranego pierwiastka
export const useCurrentElement = (): ElementConfig => {
  // Zmieniono zwracany typ na ElementConfig
  const selectedName = useAppStore((state) => state.selectedElementName);
  // Upewnij się, że 'elements' to tablica typu ElementConfig[]
  // i dodaj zabezpieczenie na wypadek nieznalezienia pierwiastka.
  const element = elements.find((el) => el.name === selectedName);
  return element || elements[0];
};
