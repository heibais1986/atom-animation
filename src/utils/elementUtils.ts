import type { ElementConfig } from "@/elementsData/types";
import { elements } from "../elementsData/elementsData";

const orbitalOrder: { n: number; l: string; capacity: number }[] = [
  { n: 1, l: "s", capacity: 2 },
  { n: 2, l: "s", capacity: 2 },
  { n: 2, l: "p", capacity: 6 },
  { n: 3, l: "s", capacity: 2 },
  { n: 3, l: "p", capacity: 6 },
  { n: 4, l: "s", capacity: 2 },
  { n: 3, l: "d", capacity: 10 },
  { n: 4, l: "p", capacity: 6 },
  { n: 5, l: "s", capacity: 2 },
  { n: 4, l: "d", capacity: 10 },
  { n: 5, l: "p", capacity: 6 },
  { n: 6, l: "s", capacity: 2 },
  { n: 4, l: "f", capacity: 14 },
  { n: 5, l: "d", capacity: 10 },
  { n: 6, l: "p", capacity: 6 },
  { n: 7, l: "s", capacity: 2 },
  { n: 5, l: "f", capacity: 14 },
  { n: 6, l: "d", capacity: 10 },
  { n: 7, l: "p", capacity: 6 },
  { n: 8, l: "s", capacity: 2 },
  { n: 5, l: "g", capacity: 18 },
  { n: 6, l: "f", capacity: 14 },
  { n: 7, l: "d", capacity: 10 },
  { n: 8, l: "p", capacity: 6 },
  { n: 9, l: "s", capacity: 2 },
  { n: 6, l: "g", capacity: 18 },
  { n: 7, l: "f", capacity: 14 },
  { n: 8, l: "d", capacity: 10 },
  { n: 9, l: "p", capacity: 6 },
  { n: 10, l: "s", capacity: 2 },
  { n: 7, l: "g", capacity: 18 },
  { n: 8, l: "f", capacity: 14 },
  { n: 9, l: "d", capacity: 10 },
];

export const calculateElectronConfiguration = (
  electronCount: number
): { shells: number[]; electronConfiguration: string } => {
  if (electronCount === 0) {
    return { shells: [], electronConfiguration: "No electrons" };
  }

  const shells = new Array(12).fill(0);
  let electronsLeft = electronCount;

  for (const orbital of orbitalOrder) {
    if (electronsLeft <= 0) break;
    const electronsInOrbital = Math.min(electronsLeft, orbital.capacity);
    shells[orbital.n - 1] += electronsInOrbital;
    electronsLeft -= electronsInOrbital;
  }

  const nobleGases: { [key: number]: string } = {
    2: "[He]",
    10: "[Ne]",
    18: "[Ar]",
    36: "[Kr]",
    54: "[Xe]",
    86: "[Rn]",
    118: "[Og]",
  };
  const nobleGasKeys = Object.keys(nobleGases)
    .map(Number)
    .sort((a, b) => b - a);

  let precedingNobleGasElectrons = 0;
  for (const numKey of nobleGasKeys) {
    if (electronCount > numKey) {
      precedingNobleGasElectrons = numKey;
      break;
    }
  }

  let configString = "";
  let tempConfig = "";
  let electronsAfterNobleGas = electronCount - precedingNobleGasElectrons;
  let electronSum = 0;
  let started = precedingNobleGasElectrons === 0;

  for (const o of orbitalOrder) {
    if (!started) {
      electronSum += o.capacity;
      if (electronSum >= precedingNobleGasElectrons) {
        started = true;
      }
    }

    if (started) {
      if (electronsAfterNobleGas <= 0) break;
      const electronsInOrbital = Math.min(electronsAfterNobleGas, o.capacity);
      tempConfig += `${o.n}${o.l}${electronsInOrbital} `;
      electronsAfterNobleGas -= electronsInOrbital;
    }
  }

  if (precedingNobleGasElectrons > 0) {
    configString = `${
      nobleGases[precedingNobleGasElectrons]
    } ${tempConfig.trim()}`;
  } else {
    configString = tempConfig.trim();
  }

  const finalShells = shells.filter((s) => s > 0);
  return { shells: finalShells, electronConfiguration: configString.trim() };
};

export const getElementByProtons = (protons: number): ElementConfig => {
  const element = elements.find((el) => el.protons === protons);
  if (element) {
    return element;
  }

  return {
    name: "Unknown",
    symbol: "X",
    protons: protons,
    neutrons: 0,
    electrons: protons,
    atomicWeight: protons,
    stableNeutrons: [],
    electronConfiguration: "Custom",
    shells: [],
    group: -1,
    period: -1,
    stateAtSTP: null,
    phaseTransitions: [],
    title: "Custom Particle",
    description: `This is a hypothetical, undiscovered element with an atomic number of ${protons}. You're exploring the boundaries of science!`,
  };
};

export const formatValueWithUnit = (
  value: number | string | undefined | null,
  unit: string = ""
) => {
  if (value === undefined || value === null) return "N/A";
  if (typeof value === "number") {
    return `${value.toLocaleString()} ${unit}`.trim();
  }
  return `${value} ${unit}`.trim();
};

export const formatIonCharge = (charge: number): string => {
  if (charge === 0) return "Neutral";
  const sign = charge > 0 ? "+" : "−";
  const absCharge = Math.abs(charge);
  return `${absCharge}${sign}`;
};
