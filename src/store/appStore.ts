"use client";

import { create } from "zustand";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { elements } from "../elementsData/elementsData";
import {
  getElementByProtons,
  calculateElectronConfiguration,
} from "../utils/elementUtils";
import { ElementConfig } from "@/elementsData/types";

export interface StabilityInfo {
  type:
    | "stable"
    | "unstable"
    | "island_of_stability"
    | "deformed_stability_peninsula";
  label: string;
}

export interface ExtendedElementConfig extends ElementConfig {
  isIsotope: boolean;
  stabilityInfo: StabilityInfo;
  charge: number;
  defaultNeutrons: number;
}

export type ModalContent = { type: "element"; data: ExtendedElementConfig };

interface ModalState {
  isVisible: boolean;
  content: ModalContent | null;
  currentPosition: { x: number; y: number };
  isManuallyPositioned: boolean;
  initialPlacement: "cursor" | "right-side";
}

type ModalType = "homepage";

export type PropertyViewKey =
  | "meltingPoint"
  | "boilingPoint"
  | "density"
  | "electronegativity"
  | "ionizationEnergy"
  | "atomicRadius"
  | "heatSpecific"
  | "electronAffinity"
  | "thermalConductivity"
  | "electricalConductivity"
  | "heatFusion"
  | "youngsModulus"
  | "universeAbundance"
  | "mohsHardness";

export type ScaleType = "linear" | "log";

export interface ActiveFilter {
  type: "occurrence" | "magneticOrdering" | "stability" | "stateAtSTP";
  value: string;
}

type AppState = {
  homepageModal: ModalState;

  isAtomModelInFocusView: boolean;
  bottomMenuSliderValue: number;
  bottomMenuProtons: number;
  bottomMenuNeutrons: number;
  bottomMenuElectrons: number;
  selectedElementName: string;
  bottomMenuRefreshCounter: number;
  bottomMenuShakeCounter: number;
  isParticleControlInputFocused: boolean;
  isNavigatingBetweenPages: boolean;
  activePropertyView: PropertyViewKey | null;
  propertyScale: ScaleType;
  temperatureKelvin: number;
  resetViewCounter: number;
};

type AppActions = {
  showHomepageModal: (
    placement: "cursor" | "right-side",
    position?: { x: number; y: number }
  ) => void;
  hideHomepageModal: () => void;

  setModalPosition: (
    type: ModalType,
    position: { x: number; y: number }
  ) => void;
  setModalManuallyPositioned: (type: ModalType, isManual: boolean) => void;

  setBottomMenuSliderValue: (value: number) => void;
  setBottomMenuParticles: (particles: {
    protons?: number;
    neutrons?: number;
    electrons?: number;
  }) => void;
  setSelectedElement: (
    name: string,
    position?: { x: number; y: number }
  ) => void;
  focusElementOnGrid: (name: string) => void;
  triggerAtomModelRefresh: () => void;
  triggerAtomModelShake: () => void;
  resetAtomModelToDefaults: () => void;
  resetActionCounters: () => void;
  setParticleControlInputFocus: (isFocused: boolean) => void;
  navigateToHomepage: (
    router: AppRouterInstance,
    elementName: string
  ) => Promise<void>;
  setIsAtomModelInFocusView: (isAnimating: boolean) => void;
  setActivePropertyView: (propertyKey: PropertyViewKey | null) => void;
  setPropertyScale: (scale: ScaleType) => void;
  setTemperature: (temp: number) => void;
  clearAllSelections: () => void;
  triggerViewReset: () => void;
};

const initialModalState: ModalState = {
  isVisible: false,
  content: null,
  currentPosition: { x: 0, y: 0 },
  isManuallyPositioned: false,
  initialPlacement: "cursor",
};

const initialState: AppState = {
  homepageModal: { ...initialModalState },

  isAtomModelInFocusView: false,
  bottomMenuSliderValue: 30,
  bottomMenuProtons: 22,
  bottomMenuNeutrons: 26,
  bottomMenuElectrons: 22,
  selectedElementName: "Titanium",
  bottomMenuRefreshCounter: 0,
  bottomMenuShakeCounter: 0,
  isParticleControlInputFocused: false,
  isNavigatingBetweenPages: false,

  activePropertyView: null,

  propertyScale: "linear",

  temperatureKelvin: 298.15,

  resetViewCounter: 0,
};

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  ...initialState,

  triggerViewReset: () => {
    set((state) => ({ resetViewCounter: state.resetViewCounter + 1 }));
  },

  clearAllSelections: () => {
    set({
      activePropertyView: null,

      propertyScale: "linear",
    });
  },

  resetAllViews: () => {
    get().triggerViewReset();
    get().clearAllSelections();
  },

  setActivePropertyView: (propertyKey) => {
    if (propertyKey) {
      set({
        activePropertyView: propertyKey,
      });
    } else {
      set({ activePropertyView: null });
    }
  },

  setPropertyScale: (scale) => set({ propertyScale: scale }),

  setTemperature: (temp) => set({ temperatureKelvin: temp }),

  showHomepageModal: (placement, position) => {
    const element = deriveCurrentElement(get());
    const content = { type: "element" as const, data: element };
    let modalPosition = position || { x: 0, y: 0 };
    let isManuallyPositioned = !!position;
    let isFocusView = false;
    if (placement === "right-side") {
      const panelWidth = 480;
      const panelHeight = 600;
      const screenWidth = window.innerWidth;
      let rightOffset;
      if (screenWidth >= 1750) {
        rightOffset = screenWidth * 0.17;
      } else if (screenWidth >= 1500) {
        rightOffset = 180;
      } else if (screenWidth >= 1280) {
        rightOffset = 150;
      } else {
        rightOffset = screenWidth * 0.1;
      }
      const x = screenWidth - panelWidth - rightOffset;
      const y = (window.innerHeight - panelHeight) / 2;
      modalPosition = { x: Math.max(10, x), y: Math.max(10, y) };
      isManuallyPositioned = true;
      isFocusView = true;
    }
    set({
      homepageModal: {
        isVisible: true,
        content: content,
        currentPosition: modalPosition,
        isManuallyPositioned: isManuallyPositioned,
        initialPlacement: placement,
      },
      isAtomModelInFocusView: isFocusView,
    });
  },

  hideHomepageModal: () => {
    set({
      homepageModal: { ...initialModalState },
      isAtomModelInFocusView: false,
    });
  },

  setModalPosition: (type, position) => {
    const modalName = `${type}Modal` as "homepageModal";
    set((state) => ({
      [modalName]: { ...state[modalName], currentPosition: position },
    }));
  },

  setModalManuallyPositioned: (type, isManual) => {
    const modalName = `${type}Modal` as "homepageModal";
    set((state) => ({
      [modalName]: {
        ...state[modalName],
        isManuallyPositioned: isManual,
      },
    }));
  },

  setBottomMenuSliderValue: (value) => set({ bottomMenuSliderValue: value }),

  setBottomMenuParticles: (newParticles) => {
    const currentState = get();
    const {
      protons = currentState.bottomMenuProtons,
      neutrons,
      electrons,
    } = newParticles;
    const elementData = getElementByProtons(protons);
    set({
      bottomMenuProtons: protons,
      bottomMenuNeutrons:
        neutrons !== undefined ? neutrons : currentState.bottomMenuNeutrons,
      bottomMenuElectrons:
        electrons !== undefined ? electrons : currentState.bottomMenuElectrons,
      selectedElementName: elementData.name,
    });
  },

  setSelectedElement: (name, position) => {
    if (position) {
      get().showHomepageModal("cursor", position);
    } else {
      const element = elements.find((el) => el.name === name);
      if (!element) return;
      const elementStateUpdate = {
        selectedElementName: element.name,
        bottomMenuProtons: element.protons,
        bottomMenuNeutrons: element.neutrons,
        bottomMenuElectrons: element.protons,
      };
      set(elementStateUpdate);
    }
  },

  focusElementOnGrid: (name) => {
    const element = elements.find((el) => el.name === name);
    if (!element) return;
    set({
      selectedElementName: element.name,
      bottomMenuProtons: element.protons,
      bottomMenuNeutrons: element.neutrons,
      bottomMenuElectrons: element.protons,
    });
  },

  triggerAtomModelRefresh: () =>
    set((state) => ({
      bottomMenuRefreshCounter: state.bottomMenuRefreshCounter + 1,
    })),

  triggerAtomModelShake: () =>
    set((state) => ({
      bottomMenuShakeCounter: state.bottomMenuShakeCounter + 1,
    })),

  resetActionCounters: () =>
    set({ bottomMenuRefreshCounter: 0, bottomMenuShakeCounter: 0 }),

  setParticleControlInputFocus: (isFocused) =>
    set({ isParticleControlInputFocused: isFocused }),

  resetAtomModelToDefaults: () => {
    const currentState = get();
    const currentProtons = currentState.bottomMenuProtons;
    let targetElement = [...elements]
      .sort((a, b) => b.protons - a.protons)
      .find((el) => el.protons <= currentProtons);
    if (!targetElement) {
      targetElement = elements[0];
    }
    set({
      bottomMenuSliderValue: 30,
      selectedElementName: targetElement.name,
      bottomMenuProtons: targetElement.protons,
      bottomMenuNeutrons: targetElement.neutrons,
      bottomMenuElectrons: targetElement.protons,
      isAtomModelInFocusView: false,
      homepageModal: { ...initialModalState },
      bottomMenuRefreshCounter: currentState.bottomMenuRefreshCounter + 1,
    });
  },

  navigateToHomepage: async (router, elementName) => {
    set({ isNavigatingBetweenPages: true });
    const element = elements.find((el) => el.name === elementName);
    if (element) {
      set({
        selectedElementName: element.name,
        bottomMenuProtons: element.protons,
        bottomMenuNeutrons: element.neutrons,
        bottomMenuElectrons: element.protons,
      });
    }
    await router.push("/");
    setTimeout(() => set({ isNavigatingBetweenPages: false }), 100);
  },

  setIsAtomModelInFocusView: (isAnimating) =>
    set({ isAtomModelInFocusView: isAnimating }),
}));

const getStabilityInfo = (
  protons: number,
  neutrons: number,
  baseElement: ElementConfig
): StabilityInfo => {
  const isIsland =
    protons >= 110 && protons <= 120 && neutrons >= 170 && neutrons <= 190;
  const isPeninsula =
    protons >= 106 && protons <= 110 && neutrons >= 160 && neutrons <= 164;

  if (isIsland) {
    return {
      type: "island_of_stability",
      label: "Unstable",
    };
  }
  if (isPeninsula) {
    return {
      type: "deformed_stability_peninsula",
      label: "Unstable",
    };
  }

  const isStandardStable =
    baseElement.stableNeutrons && baseElement.stableNeutrons.includes(neutrons);

  if (isStandardStable) {
    return {
      type: "stable",
      label: "Stable",
    };
  }

  return {
    type: "unstable",
    label: "Unstable",
  };
};

export const deriveCurrentElement = (
  state: AppState
): ExtendedElementConfig => {
  const {
    bottomMenuProtons,
    bottomMenuNeutrons,
    bottomMenuElectrons,
    selectedElementName,
  } = state;

  const baseElement =
    elements.find((el) => el.name === selectedElementName) ||
    getElementByProtons(bottomMenuProtons);

  let finalShells: number[];
  let finalUiConfig: string;

  const isNeutralKnownElement =
    bottomMenuProtons === bottomMenuElectrons && baseElement.name !== "Unknown";

  if (isNeutralKnownElement) {
    finalShells = baseElement.shells;
    finalUiConfig = baseElement.electronConfiguration;
  } else {
    const calculatedData = calculateElectronConfiguration(bottomMenuElectrons);
    finalShells = calculatedData.shells;
    if (baseElement.name === "Unknown") {
      finalUiConfig = "Custom";
    } else {
      const fullConfig = calculatedData.electronConfiguration;
      const configWords = fullConfig.split(" ");
      if (configWords.length > 4) {
        finalUiConfig = "Custom";
      } else {
        finalUiConfig = fullConfig;
      }
    }
  }

  const isIsotope = baseElement.neutrons !== bottomMenuNeutrons;
  const charge = bottomMenuProtons - bottomMenuElectrons;
  const massNumber = bottomMenuProtons + bottomMenuNeutrons;

  return {
    ...baseElement,
    protons: bottomMenuProtons,
    neutrons: bottomMenuNeutrons,
    electrons: bottomMenuElectrons,
    shells: finalShells,
    electronConfiguration: finalUiConfig,
    atomicWeight: isIsotope ? massNumber : baseElement.atomicWeight,
    isIsotope,
    charge,
    stabilityInfo: getStabilityInfo(
      bottomMenuProtons,
      bottomMenuNeutrons,
      baseElement
    ),
    defaultNeutrons: baseElement.neutrons,
  };
};
