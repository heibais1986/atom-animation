export interface Translations {
  // Layout
  atomAnimation: string;
  interactiveAtomAnimation: string;
  
  // Bottom Menu
  speed: string;
  shakeAtom: string;
  resetView: string;
  protons: string;
  neutrons: string;
  electrons: string;
  
  // Element Modal
  nonAtomicMatter: string;
  freeNeutrons: string;
  freeElectrons: string;
  emptySpace: string;
  customParticle: string;
  ionIsotope: string;
  isotope: string;
  ion: string;
  ionCharge: string;
  coreStability: string;
  mostCommonIsotope: string;
  atomicNo: string;
  atomicMass: string;
  group: string;
  period: string;
  eConfiguration: string;
  stateSTP: string;
  meltingPt: string;
  boilingPt: string;
  
  // Stability types
  stable: string;
  unstable: string;
  islandOfStability: string;
  deformedStabilityPeninsula: string;
  
  // Language
  language: string;
  english: string;
  chinese: string;
  
  // Element Select
  element: string;
  search: string;
  noResults: string;
  previousElement: string;
  nextElement: string;
  
  // States
  gas: string;
  liquid: string;
  solid: string;
}

export const translations: Record<string, Translations> = {
  en: {
    // Layout
    atomAnimation: "Atom animation",
    interactiveAtomAnimation: "Interactive atom animation made in ThreeJS",
    
    // Bottom Menu
    speed: "Speed:",
    shakeAtom: "Shake Atom",
    resetView: "Reset View",
    protons: "Protons",
    neutrons: "Neutrons",
    electrons: "Electrons",
    
    // Element Modal
    nonAtomicMatter: "Non-Atomic Matter",
    freeNeutrons: "Free Neutron(s)",
    freeElectrons: "Free Electron(s)",
    emptySpace: "Empty Space",
    customParticle: "Custom particle",
    ionIsotope: "Ion Isotope",
    isotope: "Isotope",
    ion: "Ion",
    ionCharge: "ION CHARGE",
    coreStability: "CORE STABILITY",
    mostCommonIsotope: "MOST COMMON ISOTOPE",
    atomicNo: "ATOMIC NO.",
    atomicMass: "ATOMIC MASS",
    group: "GROUP",
    period: "PERIOD",
    eConfiguration: "E. CONFIGURATION",
    stateSTP: "STATE (STP)",
    meltingPt: "MELTING PT.",
    boilingPt: "BOILING PT.",
    
    // Stability types
    stable: "Stable",
    unstable: "Unstable",
    islandOfStability: "Island of Stability",
    deformedStabilityPeninsula: "Deformed Stability Peninsula",
    
    // Language
    language: "Language",
    english: "English",
    chinese: "中文",
    
    // Element Select
    element: "Element:",
    search: "Search...",
    noResults: "No results",
    previousElement: "Previous element",
    nextElement: "Next element",
    
    // States
    gas: "Gas",
    liquid: "Liquid",
    solid: "Solid",
  },
  zh: {
    // Layout
    atomAnimation: "原子动画",
    interactiveAtomAnimation: "使用 ThreeJS 制作的交互式原子动画",
    
    // Bottom Menu
    speed: "速度：",
    shakeAtom: "摇晃原子",
    resetView: "重置视图",
    protons: "质子",
    neutrons: "中子",
    electrons: "电子",
    
    // Element Modal
    nonAtomicMatter: "非原子物质",
    freeNeutrons: "自由中子",
    freeElectrons: "自由电子",
    emptySpace: "真空",
    customParticle: "自定义粒子",
    ionIsotope: "离子同位素",
    isotope: "同位素",
    ion: "离子",
    ionCharge: "离子电荷",
    coreStability: "核心稳定性",
    mostCommonIsotope: "最常见同位素",
    atomicNo: "原子序数",
    atomicMass: "原子质量",
    group: "族",
    period: "周期",
    eConfiguration: "电子构型",
    stateSTP: "标准状态",
    meltingPt: "熔点",
    boilingPt: "沸点",
    
    // Stability types
    stable: "稳定",
    unstable: "不稳定",
    islandOfStability: "稳定岛",
    deformedStabilityPeninsula: "变形稳定半岛",
    
    // Language
    language: "语言",
    english: "English",
    chinese: "中文",
    
    // Element Select
    element: "元素:",
    search: "搜索...",
    noResults: "无结果",
    previousElement: "上一个元素",
    nextElement: "下一个元素",
    
    // States
    gas: "气体",
    liquid: "液体",
    solid: "固体",
  },
};

export type Language = keyof typeof translations;

export const defaultLanguage: Language = 'zh';