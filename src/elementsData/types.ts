/**
 * Represents a phase transition point, including its type and conditions.
 */
export type PhaseTransitionPoint = {
  type: "melting" | "boiling" | "sublimation";
  temperature_K: number; // Kelvin
};

/**
 * Defines the complete configuration for a single chemical element.
 */
export type ElementConfig = {
  // --- Primary Identifiers ---
  name: string;
  symbol: string;

  // --- Core Atomic Properties ---
  protons: number; // Atomic number (unitless)
  neutrons: number; // Default neutron count for the most common isotope (unitless)
  electrons: number; // Number of electrons in a neutral atom (unitless)
  atomicWeight: number; // Atomic weight (u)
  stableNeutrons: number[]; // List of stable neutron counts (unitless)

  // --- Electron & Chemical Properties ---
  electronConfiguration: string; // Condensed, e.g., [Ar] 3d³ 4s²
  shells: number[]; // Electron shell configuration, e.g., [2, 8, 11, 2]

  // --- Periodic Table Classification ---
  group: number;
  period: number;

  // --- Physical Properties ---
  stateAtSTP: "gas" | "liquid" | "solid" | null;
  phaseTransitions: PhaseTransitionPoint[];

  // --- App-Specific Content ---
  title: string;
  description: string;
};
