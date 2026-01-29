// HydrogenOrbitals/types.ts
/**
 * Type definitions, tasks and quiz for Hydrogen Orbitals simulation
 */

import type { HydrogenParams, HydrogenStats } from './index';

// Re-export types
export type { HydrogenParams, HydrogenStats };

// ============== ORBITAL PRESETS ==============
export interface OrbitalPreset {
  n: number;
  l: number;
  m: number;
  name: string;
  description: string;
  descriptionRu: string;
}

export const ORBITAL_PRESETS: OrbitalPreset[] = [
  { n: 1, l: 0, m: 0, name: '1s', description: 'Ground state', descriptionRu: 'Основное состояние' },
  { n: 2, l: 0, m: 0, name: '2s', description: 'First excited s', descriptionRu: 'Первый возбуждённый s' },
  { n: 2, l: 1, m: 0, name: '2p', description: 'First p orbital', descriptionRu: 'Первая p-орбиталь' },
  { n: 3, l: 0, m: 0, name: '3s', description: 'Second excited s', descriptionRu: 'Второй возбуждённый s' },
  { n: 3, l: 1, m: 0, name: '3p', description: 'Second p orbital', descriptionRu: 'Вторая p-орбиталь' },
  { n: 3, l: 2, m: 0, name: '3d', description: 'First d orbital', descriptionRu: 'Первая d-орбиталь' },
  { n: 4, l: 0, m: 0, name: '4s', description: 'Third excited s', descriptionRu: 'Третий возбуждённый s' },
  { n: 4, l: 1, m: 0, name: '4p', description: 'Third p orbital', descriptionRu: 'Третья p-орбиталь' },
  { n: 4, l: 2, m: 0, name: '4d', description: 'Second d orbital', descriptionRu: 'Вторая d-орбиталь' },
  { n: 4, l: 3, m: 0, name: '4f', description: 'First f orbital', descriptionRu: 'Первая f-орбиталь' },
];

// ============== TASK DEFINITIONS ==============
export interface HydrogenTask {
  id: number;
  title: string;
  titleRu: string;
  description: string;
  descriptionRu: string;
  check: (stats: HydrogenStats, params: HydrogenParams) => boolean;
  reward: number;
}

export const HYDROGEN_TASKS: HydrogenTask[] = [
  {
    id: 1,
    title: "Explore 1s Orbital",
    titleRu: "Изучи 1s орбиталь",
    description: "Set n=1, l=0 — this is the ground state of hydrogen",
    descriptionRu: "Установи n=1, l=0 — это основное состояние водорода",
    check: (s) => s.viewedOrbitals.includes('1s'),
    reward: 10,
  },
  {
    id: 2,
    title: "Discover p-Orbital",
    titleRu: "Открой p-орбиталь",
    description: "Set n≥2 and l=1 — see the dumbbell shape",
    descriptionRu: "Установи n≥2 и l=1 — увидишь форму гантели",
    check: (s) => s.viewedOrbitals.some(o => o.includes('p')),
    reward: 15,
  },
  {
    id: 3,
    title: "Discover d-Orbital",
    titleRu: "Открой d-орбиталь",
    description: "Set n≥3 and l=2 — four-lobed shape",
    descriptionRu: "Установи n≥3 и l=2 — четырёхлепестковая форма",
    check: (s) => s.viewedOrbitals.some(o => o.includes('d')),
    reward: 20,
  },
  {
    id: 4,
    title: "Explore Level 3",
    titleRu: "Исследуй 3 уровень",
    description: "View all orbitals on n=3 (3s, 3p, 3d)",
    descriptionRu: "Просмотри все орбитали на n=3 (3s, 3p, 3d)",
    check: (s) => 
      s.viewedOrbitals.includes('3s') && 
      s.viewedOrbitals.includes('3p') && 
      s.viewedOrbitals.includes('3d'),
    reward: 25,
  },
  {
    id: 5,
    title: "High Energy Level",
    titleRu: "Высокий уровень энергии",
    description: "Set n=5 and explore an orbital",
    descriptionRu: "Установи n=5 и изучи орбиталь",
    check: (s) => s.viewedOrbitals.some(o => o.startsWith('5')),
    reward: 15,
  },
  {
    id: 6,
    title: "Orbital Collector",
    titleRu: "Коллекционер орбиталей",
    description: "View at least 8 different orbitals",
    descriptionRu: "Просмотри не менее 8 разных орбиталей",
    check: (s) => s.viewedOrbitals.length >= 8,
    reward: 35,
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

export const HYDROGEN_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: "What does the principal quantum number n determine?",
    questionRu: "Что определяет главное квантовое число n?",
    options: [
      "The shape of the orbital",
      "The energy and size of the orbital",
      "The orientation in space",
      "The electron spin",
    ],
    optionsRu: [
      "Форму орбитали",
      "Энергию и размер орбитали",
      "Ориентацию в пространстве",
      "Спин электрона",
    ],
    correct: 1,
  },
  {
    id: 2,
    question: "What shape does an s-orbital have?",
    questionRu: "Какую форму имеет s-орбиталь?",
    options: [
      "Dumbbell-shaped",
      "Spherical",
      "Four-lobed",
      "Ring-shaped",
    ],
    optionsRu: [
      "Гантелеобразную",
      "Сферическую",
      "Четырёхлепестковую",
      "Кольцевую",
    ],
    correct: 1,
  },
  {
    id: 3,
    question: "How many p-orbitals can exist on one energy level?",
    questionRu: "Сколько p-орбиталей может быть на одном энергетическом уровне?",
    options: ["1", "2", "3", "5"],
    optionsRu: ["1", "2", "3", "5"],
    correct: 2,
  },
  {
    id: 4,
    question: "At what minimum n do d-orbitals appear?",
    questionRu: "На каком минимальном уровне n появляются d-орбитали?",
    options: ["n = 1", "n = 2", "n = 3", "n = 4"],
    optionsRu: ["n = 1", "n = 2", "n = 3", "n = 4"],
    correct: 2,
  },
  {
    id: 5,
    question: "What does an energy of -13.6 eV for the 1s orbital mean?",
    questionRu: "Что означает энергия -13.6 эВ для орбитали 1s?",
    options: [
      "The electron is free",
      "The electron is maximally bound to the nucleus",
      "The electron is far from the nucleus",
      "The orbital is unstable",
    ],
    optionsRu: [
      "Электрон свободен",
      "Электрон максимально связан с ядром",
      "Электрон находится далеко от ядра",
      "Орбиталь нестабильна",
    ],
    correct: 1,
  },
  {
    id: 6,
    question: "Why does the p-orbital have a dumbbell shape?",
    questionRu: "Почему p-орбиталь имеет форму гантели?",
    options: [
      "Due to the shape of the nucleus",
      "Due to the angular momentum of the electron (l=1)",
      "Due to the magnetic field",
      "It's random",
    ],
    optionsRu: [
      "Из-за формы ядра",
      "Из-за углового момента электрона (l=1)",
      "Из-за магнитного поля",
      "Это случайность",
    ],
    correct: 1,
  },
];
