// QuantumTunneling/types.ts
/**
 * Type definitions, tasks and quiz for Quantum Tunneling simulation
 */

import type { TunnelingParams, TunnelingStats } from './index';
import { calculateTunnelingProbability } from './hooks/useTunneling';

// Re-export types
export type { TunnelingParams, TunnelingStats };

// ============== TASK DEFINITIONS ==============
export interface TunnelingTask {
  id: number;
  title: string;
  titleRu: string;
  description: string;
  descriptionRu: string;
  check: (stats: TunnelingStats, params: TunnelingParams) => boolean;
  reward: number;
}

export const TUNNELING_TASKS: TunnelingTask[] = [
  {
    id: 1,
    title: "Observe Tunneling",
    titleRu: "Наблюдай туннелирование",
    description: "Set E < V₀ and wait for 10 particles to tunnel through",
    descriptionRu: "Установи E < V₀ и дождись когда 10 частиц протуннелируют",
    check: (s, p) => p.particleEnergy < p.barrierHeight && s.tunneled >= 10,
    reward: 15,
  },
  {
    id: 2,
    title: "High Barrier",
    titleRu: "Высокий барьер",
    description: "Set V₀ ≥ 12 eV and observe near-total reflection",
    descriptionRu: "Установи V₀ ≥ 12 эВ и наблюдай почти полное отражение",
    check: (s, p) => p.barrierHeight >= 12 && s.reflected >= 15,
    reward: 15,
  },
  {
    id: 3,
    title: "Classical Case",
    titleRu: "Классический случай",
    description: "Make E ≥ V₀ — all particles should pass through",
    descriptionRu: "Сделай E ≥ V₀ — все частицы должны проходить",
    check: (s, p) => p.particleEnergy >= p.barrierHeight && s.tunneled >= 10 && s.reflected === 0,
    reward: 20,
  },
  {
    id: 4,
    title: "Thin Barrier",
    titleRu: "Тонкий барьер",
    description: "Set width L ≤ 1 nm and observe high tunneling probability",
    descriptionRu: "Установи ширину L ≤ 1 нм и наблюдай высокую вероятность туннелирования",
    check: (s, p) => p.barrierWidth <= 1 && p.particleEnergy < p.barrierHeight && s.tunneled >= 5,
    reward: 20,
  },
  {
    id: 5,
    title: "Thick Barrier",
    titleRu: "Толстый барьер",
    description: "Set L ≥ 3 nm — tunneling becomes nearly impossible",
    descriptionRu: "Установи L ≥ 3 нм — туннелирование почти невозможно",
    check: (s, p) => p.barrierWidth >= 3 && p.particleEnergy < p.barrierHeight && s.reflected >= 20,
    reward: 20,
  },
  {
    id: 6,
    title: "Tunneling Master",
    titleRu: "Мастер туннелирования",
    description: "Accumulate 100 particles with experimental T within 10% of theory",
    descriptionRu: "Накопи 100 частиц с экспериментальным T в пределах 10% от теории",
    check: (s, _p) => {
      if (s.totalParticles < 100) return false;
      const diff = Math.abs(s.experimentalProbability - s.tunnelingProbability);
      return diff <= 0.1 * s.tunnelingProbability;
    },
    reward: 40,
  },
];

// ============== QUIZ QUESTIONS ==============
export interface QuizQuestion {
  id: number;
  question: string;
  questionRu: string;
  options: string[];
  optionsRu: string[];
  correct: number;
}

export const TUNNELING_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: "What is quantum tunneling?",
    questionRu: "Что такое квантовое туннелирование?",
    options: [
      "The particle drills a hole through the barrier",
      "The particle passes through despite lacking classical energy",
      "The particle jumps over the barrier",
      "The particle goes around the barrier",
    ],
    optionsRu: [
      "Частица пробивает дыру в барьере",
      "Частица проходит сквозь барьер, хотя классически не имеет достаточно энергии",
      "Частица перепрыгивает через барьер",
      "Частица огибает барьер",
    ],
    correct: 1,
  },
  {
    id: 2,
    question: "How does barrier width affect tunneling probability?",
    questionRu: "Как ширина барьера влияет на вероятность туннелирования?",
    options: [
      "No effect",
      "Wider barrier = higher probability",
      "Wider barrier = exponentially lower probability",
      "Only affects very large values",
    ],
    optionsRu: [
      "Не влияет",
      "Чем шире барьер, тем выше вероятность",
      "Чем шире барьер, тем экспоненциально ниже вероятность",
      "Влияет только при очень больших значениях",
    ],
    correct: 2,
  },
  {
    id: 3,
    question: "What happens when E ≥ V₀?",
    questionRu: "Что происходит когда E ≥ V₀?",
    options: [
      "Tunneling becomes maximum",
      "The particle is completely reflected",
      "The particle passes freely (classical case)",
      "The barrier becomes impenetrable",
    ],
    optionsRu: [
      "Туннелирование становится максимальным",
      "Частица полностью отражается",
      "Частица свободно проходит (классический случай)",
      "Барьер становится непроницаемым",
    ],
    correct: 2,
  },
  {
    id: 4,
    question: "Where is tunneling used in practice?",
    questionRu: "Где применяется туннелирование на практике?",
    options: [
      "Only in theoretical physics",
      "In Scanning Tunneling Microscope (STM)",
      "In ordinary optical microscopes",
      "In radio telescopes",
    ],
    optionsRu: [
      "Только в теоретической физике",
      "В сканирующем туннельном микроскопе (STM)",
      "В обычных оптических микроскопах",
      "В радиотелескопах",
    ],
    correct: 1,
  },
  {
    id: 5,
    question: "What is the evanescent wave inside the barrier?",
    questionRu: "Что такое эванесцентная волна внутри барьера?",
    options: [
      "A wave that amplifies inside the barrier",
      "A wave that exponentially decays inside the barrier",
      "A wave that reflects from the barrier",
      "A wave that goes around the barrier",
    ],
    optionsRu: [
      "Волна, которая усиливается внутри барьера",
      "Волна, которая экспоненциально затухает внутри барьера",
      "Волна, которая отражается от барьера",
      "Волна, которая огибает барьер",
    ],
    correct: 1,
  },
  {
    id: 6,
    question: "Why did the 2025 Nobel Prize honor tunneling research?",
    questionRu: "За что Нобелевская премия 2025 отметила исследования туннелирования?",
    options: [
      "For discovering tunneling in atoms",
      "For demonstrating macroscopic quantum tunneling in circuits",
      "For inventing the tunnel diode",
      "For explaining alpha decay",
    ],
    optionsRu: [
      "За открытие туннелирования в атомах",
      "За демонстрацию макроскопического квантового туннелирования в цепях",
      "За изобретение туннельного диода",
      "За объяснение альфа-распада",
    ],
    correct: 1,
  },
];

// Re-export calculation function
export { calculateTunnelingProbability };
