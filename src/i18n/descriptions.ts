import { Language } from './index';
import { elementDescriptions } from './elementDescriptions';

export const getElementDescription = (
  element: any,
  language: Language,
  translateElementName: (name: string) => string
): string => {
  if (language === 'zh') {
    return getChineseDescription(element, translateElementName);
  } else {
    return getEnglishDescription(element, translateElementName);
  }
};

const getChineseDescription = (element: any, translateElementName: (name: string) => string): string => {
  // 1. 特殊非原子粒子
  if (element.protons === 0) {
    if (
      element.neutrons > 0 &&
      element.electrons > 0 &&
      element.protons === 0
    )
      return "虽然这个可视化显示了电子围绕中子运行，但在现实中，没有质子的吸引力，这样的稳定系统是无法形成的。这种配置不代表原子，而是共存粒子的瞬态云，这种状态可能在中子星核心等极端环境中短暂存在。";
    if (element.neutrons > 0 && element.electrons === 0)
      return "这代表一个或多个自由中子。单个中子是一个在原子核外会衰变的亚原子粒子，而理论上的中子团簇，被称为中子素，只有在中子星的巨大引力下才能保持稳定。";
    if (element.electrons > 0 && element.neutrons === 0)
      return "这代表一个或多个自由电子。没有带正电的原子核形成原子，这些基本粒子以负电荷云或电子束的形式存在。";
  }

  if (
    element.protons === 0 &&
    element.neutrons === 0 &&
    element.electrons === 0
  ) {
    return "这代表经典真空，一个没有任何真实粒子的空间。然而，在量子物理学中，真空是一个动态的地方，不断地产生'虚拟'粒子-反粒子对，它们瞬间出现又消失。";
  }

  if (element.neutrons > 0 && element.electrons > 0 && element.protons === 0)
    return "非原子物质";

  // 2. 超出周期表基本极限 (Z > 173)
  if (element.protons > 173) {
    return `这代表一个超出周期表理论极限（Z ≈ 173）的粒子。根据物理学，具有如此极端核电荷的原子在根本上是不稳定的，因为其电场强度足以从真空中拉出电子-正电子对，使稳定的电子结构变得不可能。您正在探索物质的绝对极限。`;
  }

  // 3. 超出已知周期表 (119 < Z <= 173)
  if (element.protons > 118) {
    return `这是一个超出当前已知周期表的假想元素。科学家们正在尝试合成这个区域的元素，寻找理论上的"稳定岛"。即使被发现，它们预计也会具有极强的放射性和极短的半衰期。`;
  }

  // 6. 同位素的离子（组合情况）
  if (element.isIsotope && element.charge !== 0 && element.protons > 0) {
    const electronChange = element.charge > 0 ? "失去了" : "获得了";
    return `这是同位素${translateElementName(element.name)}-${Math.round(
      element.atomicWeight
    )}的离子。这个带电同位素${electronChange}电子，与中性原子相比，改变了其化学反应性和键合行为。`;
  }

  // 7. 中性同位素
  if (element.isIsotope && element.protons > 0) {
    return `这是${translateElementName(
      element.name
    )}的同位素，质量数为${Math.round(
      element.atomicWeight
    )}。它包含标准的${element.protons}个质子，但有${
      element.neutrons
    }个中子。`;
  }

  // 8. 标准离子
  if (element.charge !== 0 && element.protons > 0) {
    return `这是${translateElementName(element.name)}的离子。离子是一个具有净电荷的原子，因为其电子数不等于质子数。`;
  }

  // 9. 标准元素的中文描述
  return elementDescriptions[element.name] || `${translateElementName(element.name)}是周期表中的一个化学元素。`;
};

const getEnglishDescription = (element: any, translateElementName: (name: string) => string): string => {
  // 1. Special non-atomic particles
  if (element.protons === 0) {
    if (
      element.neutrons > 0 &&
      element.electrons > 0 &&
      element.protons === 0
    )
      return "Although this visualization shows an electron orbiting a neutron, in reality, such a stable system cannot be formed without the attractive force of a proton. This configuration does not represent an atom, but rather a transient cloud of coexisting particles, a state that might exist for a fleeting moment in extreme environments like the heart of a neutron star.";
    if (element.neutrons > 0 && element.electrons === 0)
      return "This represents one or more free neutrons. A single neutron is a subatomic particle that decays outside of a nucleus, while a theoretical cluster of neutrons, known as a neutronium, is only stable under the immense gravity of a neutron star.";
    if (element.electrons > 0 && element.neutrons === 0)
      return "This represents one or more free electrons. Without a positively charged nucleus to form an atom, these fundamental particles exist as a cloud of negative charge or a beam.";
  }

  if (
    element.protons === 0 &&
    element.neutrons === 0 &&
    element.electrons === 0
  ) {
    return "This represents a classical vacuum, a space devoid of any real particles. In quantum physics, however, the vacuum is a dynamic place, constantly fizzing with 'virtual' particle-antiparticle pairs that pop into and out of existence in an instant.";
  }

  if (element.neutrons > 0 && element.electrons > 0 && element.protons === 0)
    return "Non-Atomic Matter";

  // 2. Beyond the fundamental limit of the periodic table (Z > 173)
  if (element.protons > 173) {
    return `This represents a particle beyond the theoretical limit of the periodic table (Z ≈ 173). According to physics, an atom with such an extreme nuclear charge would be fundamentally unstable, as its electric field would be strong enough to pull electron-positron pairs from the vacuum, making a stable electron structure impossible. You're probing the absolute limits of matter.`;
  }

  // 3. Beyond the known periodic table (119 < Z <= 173)
  if (element.protons > 118) {
    return `This is a hypothetical element beyond the currently known periodic table. Scientists are attempting to synthesize elements in this region, searching for a theoretical 'Island of Stability'. Even if found, they are expected to be exceptionally radioactive with extremely short half-lives.`;
  }

  // 6. Ion of an Isotope (combined case)
  if (element.isIsotope && element.charge !== 0 && element.protons > 0) {
    const electronChange = element.charge > 0 ? "lost" : "gained";
    return `This is an ion of the isotope ${element.name}-${Math.round(
      element.atomicWeight
    )}. This charged isotope has ${electronChange} electrons, altering its chemical reactivity and bonding behavior compared to the neutral atom.`;
  }

  // 7. Neutral Isotope
  if (element.isIsotope && element.protons > 0) {
    return `This is an isotope of ${
      element.name
    } with a mass number of ${Math.round(
      element.atomicWeight
    )}. It contains the standard ${element.protons} protons, but has ${
      element.neutrons
    } neutrons.`;
  }

  // 8. Standard Ion
  if (element.charge !== 0 && element.protons > 0) {
    return `This is an ion of ${element.name}. An ion is an atom that has a net electrical charge because its number of electrons does not equal its number of protons.`;
  }

  // 9. 标准元素的默认描述
  return element.description || `${translateElementName(element.name)}是周期表中的一个化学元素。`;
};