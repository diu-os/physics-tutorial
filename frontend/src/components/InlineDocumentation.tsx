// components/InlineDocumentation.tsx
/**
 * Inline Documentation System
 * 
 * Provides contextual help, tooltips, and explanations throughout the UI.
 * Scientists appreciate clarity and precision - every parameter should
 * be well-documented with units, ranges, and physical meaning.
 * 
 * "If you can't explain it simply, you don't understand it well enough" 
 * — Richard Feynman
 */

import { useState } from 'react';
import { HelpCircle, Info, BookOpen, ExternalLink, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

// Documentation entries for all parameters
export interface DocEntry {
  id: string;
  symbol?: string;
  name: { en: string; ru: string };
  description: { en: string; ru: string };
  unit?: string;
  range?: { min: number; max: number; typical?: number };
  formula?: string;
  physicalMeaning?: { en: string; ru: string };
  source?: {
    author: string;
    title: string;
    url?: string;
  };
  relatedParams?: string[];
  tips?: { en: string[]; ru: string[] };
  warnings?: { en: string; ru: string };
}

// Comprehensive documentation database
export const DOCUMENTATION: Record<string, DocEntry> = {
  wavelength: {
    id: 'wavelength',
    symbol: 'λ',
    name: { en: 'Wavelength', ru: 'Длина волны' },
    description: {
      en: 'The distance between successive crests of the electromagnetic wave. Determines the color of visible light and the interference pattern spacing.',
      ru: 'Расстояние между последовательными гребнями электромагнитной волны. Определяет цвет видимого света и расстояние между интерференционными полосами.'
    },
    unit: 'nm (nanometers)',
    range: { min: 380, max: 780, typical: 550 },
    formula: 'λ = c / f',
    physicalMeaning: {
      en: 'Shorter wavelength = blue/violet light, higher energy. Longer wavelength = red light, lower energy.',
      ru: 'Короткая волна = синий/фиолетовый свет, высокая энергия. Длинная волна = красный свет, низкая энергия.'
    },
    source: {
      author: 'Young, T.',
      title: 'On the Theory of Light and Colours (1802)',
    },
    relatedParams: ['slitDistance', 'fringeSpacing'],
    tips: {
      en: [
        'HeNe laser: 632.8 nm (red)',
        'Nd:YAG doubled: 532 nm (green)',
        'Human eye most sensitive: ~555 nm'
      ],
      ru: [
        'HeNe лазер: 632.8 нм (красный)',
        'Nd:YAG удвоенный: 532 нм (зелёный)',
        'Глаз наиболее чувствителен: ~555 нм'
      ]
    }
  },

  slitDistance: {
    id: 'slitDistance',
    symbol: 'd',
    name: { en: 'Slit Distance', ru: 'Расстояние между щелями' },
    description: {
      en: 'The center-to-center distance between the two slits in the barrier. Controls the angular separation of interference fringes.',
      ru: 'Расстояние между центрами двух щелей в барьере. Контролирует угловое разделение интерференционных полос.'
    },
    unit: 'mm (millimeters)',
    range: { min: 0.05, max: 2.0, typical: 0.25 },
    formula: 'Δθ ≈ λ/d (fringe angular spacing)',
    physicalMeaning: {
      en: 'Smaller d = wider fringe spacing (more obvious pattern). Larger d = narrower, more fringes visible.',
      ru: 'Меньше d = шире полосы (более заметный паттерн). Больше d = уже полосы, больше видимых полос.'
    },
    source: {
      author: 'Pearson, B.J. et al.',
      title: 'Measurements of slit-width effects (2018)',
      url: 'https://opg.optica.org/osac/abstract.cfm?uri=osac-1-2-755'
    },
    relatedParams: ['wavelength', 'slitWidth'],
    tips: {
      en: [
        'Typical educational setup: 0.1-0.5 mm',
        'Professional optics: 0.01-0.1 mm',
        'Must be much larger than wavelength'
      ],
      ru: [
        'Типичная учебная установка: 0.1-0.5 мм',
        'Профессиональная оптика: 0.01-0.1 мм',
        'Должно быть много больше длины волны'
      ]
    }
  },

  slitWidth: {
    id: 'slitWidth',
    symbol: 'a',
    name: { en: 'Slit Width', ru: 'Ширина щели' },
    description: {
      en: 'The width of each individual slit. Controls the diffraction envelope that modulates the interference pattern.',
      ru: 'Ширина каждой отдельной щели. Контролирует дифракционную огибающую, модулирующую интерференционную картину.'
    },
    unit: 'mm',
    range: { min: 0.01, max: 0.5, typical: 0.05 },
    formula: 'I ∝ sinc²(πa·sinθ/λ)',
    physicalMeaning: {
      en: 'Narrower slit = wider diffraction envelope = more visible fringes. Wider slit = sharper central peak.',
      ru: 'Уже щель = шире дифракционная огибающая = больше видимых полос. Шире щель = острее центральный пик.'
    },
    source: {
      author: 'Pearson, B.J. et al.',
      title: 'Measurements of slit-width effects (2018)',
      url: 'https://opg.optica.org/osac/abstract.cfm?uri=osac-1-2-755'
    },
    relatedParams: ['slitDistance', 'diffraction'],
    warnings: {
      en: 'If a ≈ d, diffraction envelope severely limits visible fringes',
      ru: 'Если a ≈ d, дифракционная огибающая сильно ограничивает видимые полосы'
    }
  },

  barrierThickness: {
    id: 'barrierThickness',
    symbol: 't',
    name: { en: 'Barrier Thickness', ru: 'Толщина барьера' },
    description: {
      en: 'The physical thickness of the barrier containing the slits. Affects angular selection of transmitted light.',
      ru: 'Физическая толщина барьера со щелями. Влияет на угловую селекцию прошедшего света.'
    },
    unit: 'mm',
    range: { min: 0.02, max: 0.5, typical: 0.1 },
    formula: 'θ_max = arctan(a/t)',
    physicalMeaning: {
      en: 'Thicker barrier = narrower angular acceptance = collimation effect. Blocks light at large angles to the normal.',
      ru: 'Толще барьер = уже угловая апертура = эффект коллимации. Блокирует свет под большими углами к нормали.'
    },
    source: {
      author: 'Born, M. & Wolf, E.',
      title: 'Principles of Optics (7th ed.), Chapter 8.5.2',
    },
    relatedParams: ['slitWidth', 'slitDistance'],
    tips: {
      en: [
        'Thin barrier (t << a): all angles pass freely',
        'Thick barrier (t >> a): acts as collimator',
        'Real-world slits typically have t ≈ 0.1-0.5 mm'
      ],
      ru: [
        'Тонкий барьер (t << a): все углы проходят свободно',
        'Толстый барьер (t >> a): работает как коллиматор',
        'Реальные щели обычно имеют t ≈ 0.1-0.5 мм'
      ]
    },
    warnings: {
      en: 'Very thick barriers (t > 0.3 mm) significantly narrow the pattern',
      ru: 'Очень толстые барьеры (t > 0.3 мм) значительно сужают картину'
    }
  },

  coherence: {
    id: 'coherence',
    symbol: 'V',
    name: { en: 'Coherence / Visibility', ru: 'Когерентность / Видимость' },
    description: {
      en: 'Measure of the phase correlation between light waves from the two slits. Determines the contrast of the interference pattern.',
      ru: 'Мера фазовой корреляции между световыми волнами из двух щелей. Определяет контраст интерференционной картины.'
    },
    unit: '% (0-100)',
    range: { min: 0, max: 100, typical: 95 },
    formula: 'V = (I_max - I_min) / (I_max + I_min)',
    physicalMeaning: {
      en: '100% = perfect coherence, maximum contrast. 0% = incoherent, no interference pattern visible.',
      ru: '100% = идеальная когерентность, максимальный контраст. 0% = некогерентный, интерференционная картина не видна.'
    },
    source: {
      author: 'Hong, C.K. & Noh, T.G.',
      title: 'Two-photon double-slit interference (1998)',
      url: 'https://opg.optica.org/josab/abstract.cfm?uri=josab-15-3-1192'
    },
    tips: {
      en: [
        'Laser sources: 95-100%',
        'LED: 30-70%',
        'Thermal sources: 5-30%'
      ],
      ru: [
        'Лазерные источники: 95-100%',
        'LED: 30-70%',
        'Тепловые источники: 5-30%'
      ]
    }
  },

  refractiveIndex: {
    id: 'refractiveIndex',
    symbol: 'n',
    name: { en: 'Refractive Index', ru: 'Показатель преломления' },
    description: {
      en: 'Ratio of the speed of light in vacuum to its speed in the medium. Affects the effective wavelength inside the medium.',
      ru: 'Отношение скорости света в вакууме к его скорости в среде. Влияет на эффективную длину волны внутри среды.'
    },
    unit: 'dimensionless',
    range: { min: 1.0, max: 1.5, typical: 1.000293 },
    formula: 'n = c / v, λ_medium = λ_vacuum / n',
    physicalMeaning: {
      en: 'Higher n = slower light = shorter effective wavelength = shifted interference pattern.',
      ru: 'Выше n = медленнее свет = короче эффективная длина волны = сдвинутая интерференционная картина.'
    },
    source: {
      author: 'Essen, L. & Froome, K.D.',
      title: 'Refractive Indices of Gases (1953)',
      url: 'https://iopscience.iop.org/article/10.1088/0370-1301/66/7/309'
    },
    tips: {
      en: [
        'Vacuum: 1.000000 (reference)',
        'Air at STP: 1.000293',
        'Water: 1.333'
      ],
      ru: [
        'Вакуум: 1.000000 (эталон)',
        'Воздух при СТП: 1.000293',
        'Вода: 1.333'
      ]
    }
  },

  intensity: {
    id: 'intensity',
    symbol: 'I',
    name: { en: 'Source Intensity', ru: 'Интенсивность источника' },
    description: {
      en: 'The rate of photon emission from the source. Controls how quickly the interference pattern builds up.',
      ru: 'Скорость испускания фотонов источником. Контролирует как быстро формируется интерференционная картина.'
    },
    unit: '% (relative)',
    range: { min: 1, max: 100, typical: 50 },
    formula: 'N_particles ∝ I × t',
    physicalMeaning: {
      en: 'Higher intensity = more photons per second = faster pattern formation. Does NOT affect pattern shape.',
      ru: 'Выше интенсивность = больше фотонов в секунду = быстрее формирование паттерна. НЕ влияет на форму паттерна.'
    },
    tips: {
      en: [
        'Low intensity reveals quantum nature',
        'High intensity shows classical wave behavior',
        'Try very low for dramatic single-photon effect'
      ],
      ru: [
        'Низкая интенсивность раскрывает квантовую природу',
        'Высокая интенсивность показывает классическое волновое поведение',
        'Попробуйте очень низкую для драматического эффекта одиночного фотона'
      ]
    }
  },

  observer: {
    id: 'observer',
    symbol: '👁️',
    name: { en: 'Observer / Detector', ru: 'Наблюдатель / Детектор' },
    description: {
      en: 'Simulates placing a detector at one slit to determine which path the photon takes. Demonstrates quantum measurement collapse.',
      ru: 'Симулирует размещение детектора у одной из щелей для определения пути фотона. Демонстрирует квантовый коллапс измерения.'
    },
    physicalMeaning: {
      en: 'When we know which slit the photon passed through, the interference pattern disappears. This is the essence of wave-particle duality.',
      ru: 'Когда мы знаем через какую щель прошёл фотон, интерференционная картина исчезает. Это суть корпускулярно-волнового дуализма.'
    },
    source: {
      author: 'Feynman, R.P.',
      title: 'The Feynman Lectures on Physics, Vol. III',
    },
    warnings: {
      en: 'The "observer" doesn\'t need to be conscious - any interaction that reveals path information destroys interference.',
      ru: '"Наблюдатель" не должен быть сознательным - любое взаимодействие, раскрывающее информацию о пути, разрушает интерференцию.'
    }
  }
};

/**
 * Tooltip component with rich documentation
 */
interface DocTooltipProps {
  paramId: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function DocTooltip({ paramId, children, position = 'top' }: DocTooltipProps) {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const [isOpen, setIsOpen] = useState(false);
  const doc = DOCUMENTATION[paramId];
  
  if (!doc) {
    return <>{children}</>;
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="cursor-help"
      >
        {children}
      </div>
      
      {isOpen && (
        <div className={`absolute z-50 ${positionClasses[position]} w-72`}>
          <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-3 text-sm">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
              {doc.symbol && (
                <span className="text-cyan-400 font-mono text-lg">{doc.symbol}</span>
              )}
              <span className="text-white font-medium">
                {isRu ? doc.name.ru : doc.name.en}
              </span>
              {doc.unit && (
                <span className="text-gray-500 text-xs ml-auto">[{doc.unit}]</span>
              )}
            </div>
            
            {/* Description */}
            <p className="text-gray-300 text-xs mb-2">
              {isRu ? doc.description.ru : doc.description.en}
            </p>
            
            {/* Formula */}
            {doc.formula && (
              <div className="bg-slate-900/50 rounded px-2 py-1 mb-2">
                <code className="text-cyan-300 text-xs font-mono">{doc.formula}</code>
              </div>
            )}
            
            {/* Range */}
            {doc.range && (
              <div className="text-[10px] text-gray-500 mb-2">
                Range: {doc.range.min} - {doc.range.max}
                {doc.range.typical && ` (typical: ${doc.range.typical})`}
              </div>
            )}
            
            {/* Source */}
            {doc.source && (
              <div className="text-[10px] text-amber-400/70 flex items-center gap-1">
                <BookOpen size={10} />
                {doc.source.author}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Help button that opens documentation panel
 */
interface HelpButtonProps {
  paramId: string;
  size?: 'sm' | 'md';
}

export function HelpButton({ paramId, size = 'sm' }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const doc = DOCUMENTATION[paramId];
  
  if (!doc) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-500 hover:text-gray-300 transition-colors"
        title="Help"
      >
        <HelpCircle className={sizeClasses[size]} />
      </button>
      
      {isOpen && (
        <DocDetailPanel 
          doc={doc} 
          onClose={() => setIsOpen(false)} 
        />
      )}
    </>
  );
}

/**
 * Detailed documentation panel
 */
interface DocDetailPanelProps {
  doc: DocEntry;
  onClose: () => void;
}

function DocDetailPanel({ doc, onClose }: DocDetailPanelProps) {
  const { language } = useLanguage();
  const isRu = language === 'ru';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-lg w-full max-h-[80vh] overflow-auto border border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {doc.symbol && (
              <span className="text-2xl text-cyan-400 font-mono">{doc.symbol}</span>
            )}
            <div>
              <h3 className="text-white font-bold">
                {isRu ? doc.name.ru : doc.name.en}
              </h3>
              {doc.unit && (
                <span className="text-xs text-gray-500">[{doc.unit}]</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 mb-1">
              {isRu ? 'Описание' : 'Description'}
            </h4>
            <p className="text-gray-300 text-sm">
              {isRu ? doc.description.ru : doc.description.en}
            </p>
          </div>

          {/* Physical Meaning */}
          {doc.physicalMeaning && (
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-purple-300 mb-1 flex items-center gap-1">
                <Info size={12} />
                {isRu ? 'Физический смысл' : 'Physical Meaning'}
              </h4>
              <p className="text-gray-300 text-sm">
                {isRu ? doc.physicalMeaning.ru : doc.physicalMeaning.en}
              </p>
            </div>
          )}

          {/* Formula */}
          {doc.formula && (
            <div className="bg-slate-900/50 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-gray-400 mb-1">
                {isRu ? 'Формула' : 'Formula'}
              </h4>
              <code className="text-cyan-300 font-mono">{doc.formula}</code>
            </div>
          )}

          {/* Range */}
          {doc.range && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-1">
                {isRu ? 'Диапазон значений' : 'Value Range'}
              </h4>
              <div className="flex gap-4 text-sm">
                <span className="text-gray-500">Min: <span className="text-white">{doc.range.min}</span></span>
                <span className="text-gray-500">Max: <span className="text-white">{doc.range.max}</span></span>
                {doc.range.typical && (
                  <span className="text-gray-500">Typical: <span className="text-green-400">{doc.range.typical}</span></span>
                )}
              </div>
            </div>
          )}

          {/* Tips */}
          {doc.tips && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-1">
                💡 {isRu ? 'Советы' : 'Tips'}
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                {(isRu ? doc.tips.ru : doc.tips.en).map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {doc.warnings && (
            <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-red-400 mb-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {isRu ? 'Предупреждение' : 'Warning'}
              </h4>
              <p className="text-gray-300 text-sm">
                {isRu ? doc.warnings.ru : doc.warnings.en}
              </p>
            </div>
          )}

          {/* Source */}
          {doc.source && (
            <div className="border-t border-slate-700 pt-3">
              <h4 className="text-xs font-semibold text-gray-400 mb-1">
                📚 {isRu ? 'Источник' : 'Source'}
              </h4>
              <p className="text-amber-300 text-sm">{doc.source.author}</p>
              <p className="text-gray-400 text-xs">{doc.source.title}</p>
              {doc.source.url && (
                <a
                  href={doc.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1"
                >
                  <ExternalLink size={10} />
                  {isRu ? 'Открыть источник' : 'Open source'}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Parameter label with integrated help
 */
interface ParamLabelProps {
  paramId: string;
  className?: string;
}

export function ParamLabel({ paramId, className = '' }: ParamLabelProps) {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const doc = DOCUMENTATION[paramId];

  if (!doc) return null;

  return (
    <DocTooltip paramId={paramId}>
      <span className={`flex items-center gap-1 ${className}`}>
        {doc.symbol && (
          <span className="text-cyan-400 font-mono text-xs">{doc.symbol}</span>
        )}
        <span>{isRu ? doc.name.ru : doc.name.en}</span>
        <HelpCircle size={12} className="text-gray-500" />
      </span>
    </DocTooltip>
  );
}
