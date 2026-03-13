// components/LabTasks.tsx
import { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Target, Trophy, ChevronDown, ChevronUp, Star, CheckCircle2 } from 'lucide-react';
import type { DoubleSlitStats, DoubleSlitParams } from '../simulations/DoubleSlit';
import type { LogEntry } from './ExperimentLog';

interface LabTasksProps {
  stats: DoubleSlitStats | null;
  params: DoubleSlitParams | null;
  entries?: LogEntry[];
}

interface LabTask {
  id: string;
  titleRu: string;
  titleEn: string;
  descriptionRu: string;
  descriptionEn: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  xp: number;
  checkCondition: (stats: DoubleSlitStats, params: DoubleSlitParams, entries: LogEntry[]) => boolean;
  hintRu?: string;
  hintEn?: string;
  category: 'observation' | 'measurement' | 'analysis' | 'advanced';
}

const labTasks: LabTask[] = [
  // Beginner - Observation
  {
    id: 'first-interference',
    titleRu: 'Первая интерференция',
    titleEn: 'First Interference',
    descriptionRu: 'Получите минимум 3 интерференционные полосы',
    descriptionEn: 'Obtain at least 3 interference fringes',
    difficulty: 'beginner',
    xp: 50,
    category: 'observation',
    checkCondition: (stats) => stats.fringeCount >= 3,
    hintRu: 'Соберите 100+ частиц с выключенным детектором',
    hintEn: 'Collect 100+ particles with detector OFF',
  },
  {
    id: 'high-contrast',
    titleRu: 'Высокий контраст',
    titleEn: 'High Contrast',
    descriptionRu: 'Достигните контраста > 50%',
    descriptionEn: 'Achieve contrast > 50%',
    difficulty: 'beginner',
    xp: 75,
    category: 'observation',
    checkCondition: (stats) => stats.contrast > 0.5,
    hintRu: 'Используйте оптимальные параметры: λ=500-600nm, d=0.4-0.6mm',
    hintEn: 'Use optimal parameters: λ=500-600nm, d=0.4-0.6mm',
  },
  
  // Intermediate - Measurement
  {
    id: 'observer-effect',
    titleRu: 'Эффект наблюдателя',
    titleEn: 'Observer Effect',
    descriptionRu: 'Запишите измерения с детектором и без (2+ записи каждого типа)',
    descriptionEn: 'Record measurements with and without detector (2+ entries each)',
    difficulty: 'intermediate',
    xp: 100,
    category: 'measurement',
    checkCondition: (_, __, entries) => {
      const withDetector = entries.filter(e => e.params.observerOn).length;
      const withoutDetector = entries.filter(e => !e.params.observerOn).length;
      return withDetector >= 2 && withoutDetector >= 2;
    },
    hintRu: 'Проведите серию измерений, переключая детектор',
    hintEn: 'Conduct a series of measurements, toggling the detector',
  },
  {
    id: 'wavelength-study',
    titleRu: 'Исследование длины волны',
    titleEn: 'Wavelength Study',
    descriptionRu: 'Запишите измерения для 3+ разных длин волн',
    descriptionEn: 'Record measurements for 3+ different wavelengths',
    difficulty: 'intermediate',
    xp: 100,
    category: 'measurement',
    checkCondition: (_, __, entries) => {
      const wavelengths = new Set(entries.map(e => e.params.wavelength));
      return wavelengths.size >= 3;
    },
    hintRu: 'Попробуйте λ = 400, 550, 700 нм',
    hintEn: 'Try λ = 400, 550, 700 nm',
  },
  {
    id: 'slit-distance-study',
    titleRu: 'Исследование расстояния щелей',
    titleEn: 'Slit Distance Study',
    descriptionRu: 'Запишите измерения для 3+ разных расстояний между щелями',
    descriptionEn: 'Record measurements for 3+ different slit distances',
    difficulty: 'intermediate',
    xp: 100,
    category: 'measurement',
    checkCondition: (_, __, entries) => {
      const distances = new Set(entries.map(e => e.params.slitDistance));
      return distances.size >= 3;
    },
    hintRu: 'Попробуйте d = 0.3, 0.5, 0.8 мм',
    hintEn: 'Try d = 0.3, 0.5, 0.8 mm',
  },
  
  // Advanced - Analysis
  {
    id: 'statistics-master',
    titleRu: 'Мастер статистики',
    titleEn: 'Statistics Master',
    descriptionRu: 'Соберите 500+ частиц в одном эксперименте',
    descriptionEn: 'Collect 500+ particles in a single experiment',
    difficulty: 'advanced',
    xp: 150,
    category: 'analysis',
    checkCondition: (stats) => stats.totalParticles >= 500,
    hintRu: 'Будьте терпеливы и наблюдайте формирование паттерна',
    hintEn: 'Be patient and observe the pattern formation',
  },
  {
    id: 'perfect-pattern',
    titleRu: 'Идеальный паттерн',
    titleEn: 'Perfect Pattern',
    descriptionRu: '5+ полос при контрасте > 60%',
    descriptionEn: '5+ fringes with contrast > 60%',
    difficulty: 'advanced',
    xp: 200,
    category: 'analysis',
    checkCondition: (stats) => stats.fringeCount >= 5 && stats.contrast > 0.6,
    hintRu: 'Тонкая настройка: d=0.5mm, λ=550nm, 300+ частиц',
    hintEn: 'Fine tuning: d=0.5mm, λ=550nm, 300+ particles',
  },
  {
    id: 'comprehensive-study',
    titleRu: 'Комплексное исследование',
    titleEn: 'Comprehensive Study',
    descriptionRu: 'Запишите 10+ измерений в журнал',
    descriptionEn: 'Record 10+ measurements in the log',
    difficulty: 'advanced',
    xp: 200,
    category: 'analysis',
    checkCondition: (_, __, entries) => entries.length >= 10,
    hintRu: 'Систематически исследуйте разные комбинации параметров',
    hintEn: 'Systematically explore different parameter combinations',
  },
  
  // Expert
  {
    id: 'quantum-explorer',
    titleRu: 'Квантовый исследователь',
    titleEn: 'Quantum Explorer',
    descriptionRu: 'Получите 7+ полос с контрастом > 70%',
    descriptionEn: 'Obtain 7+ fringes with contrast > 70%',
    difficulty: 'expert',
    xp: 300,
    category: 'advanced',
    checkCondition: (stats) => stats.fringeCount >= 7 && stats.contrast > 0.7,
    hintRu: 'Экспертный уровень: найдите оптимальное соотношение d/λ',
    hintEn: 'Expert level: find the optimal d/λ ratio',
  },
  {
    id: 'decoherence-proof',
    titleRu: 'Доказательство декогеренции',
    titleEn: 'Decoherence Proof',
    descriptionRu: 'Докажите эффект детектора: запись с контрастом >50% (выкл) и <30% (вкл)',
    descriptionEn: 'Prove detector effect: entry with contrast >50% (off) and <30% (on)',
    difficulty: 'expert',
    xp: 350,
    category: 'advanced',
    checkCondition: (_, __, entries) => {
      const highContrastOff = entries.some(e => !e.params.observerOn && e.stats.contrast > 0.5);
      const lowContrastOn = entries.some(e => e.params.observerOn && e.stats.contrast < 0.3);
      return highContrastOff && lowContrastOn;
    },
    hintRu: 'Используйте одинаковые λ и d, меняйте только детектор',
    hintEn: 'Use same λ and d, only toggle the detector',
  },
  {
    id: 'scientist',
    titleRu: 'Учёный',
    titleEn: 'Scientist',
    descriptionRu: 'Выполните все остальные задания',
    descriptionEn: 'Complete all other tasks',
    difficulty: 'expert',
    xp: 500,
    category: 'advanced',
    checkCondition: (stats, params, entries) => {
      // Check if all other tasks are complete
      const otherTasks = labTasks.filter(t => t.id !== 'scientist');
      return otherTasks.every(t => t.checkCondition(stats, params, entries));
    },
    hintRu: 'Станьте мастером квантовой физики!',
    hintEn: 'Become a master of quantum physics!',
  },
];

const difficultyColors = {
  beginner: { bg: 'bg-green-500/20', border: 'border-green-500/40', text: 'text-green-400' },
  intermediate: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400' },
  advanced: { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-400' },
  expert: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400' },
};

const difficultyLabels = {
  beginner: { ru: 'Начинающий', en: 'Beginner' },
  intermediate: { ru: 'Средний', en: 'Intermediate' },
  advanced: { ru: 'Продвинутый', en: 'Advanced' },
  expert: { ru: 'Эксперт', en: 'Expert' },
};

export function LabTasks({ stats, params, entries = [] }: LabTasksProps) {
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Safe defaults
  const safeStats = stats || { totalParticles: 0, fringeCount: 0, contrast: 0, histogram: [] };
  const safeParams = params || { wavelength: 550, slitDistance: 0.3, observerOn: false };
  const safeEntries = entries || [];
  
  const labels = {
    title: lang === 'ru' ? '🎯 Лабораторные задания' : '🎯 Laboratory Tasks',
    all: lang === 'ru' ? 'Все' : 'All',
    observation: lang === 'ru' ? 'Наблюдение' : 'Observation',
    measurement: lang === 'ru' ? 'Измерение' : 'Measurement',
    analysis: lang === 'ru' ? 'Анализ' : 'Analysis',
    advanced: lang === 'ru' ? 'Продвинутые' : 'Advanced',
    completed: lang === 'ru' ? 'Выполнено' : 'Completed',
    totalXP: lang === 'ru' ? 'Всего XP' : 'Total XP',
    hint: lang === 'ru' ? 'Подсказка' : 'Hint',
  };

  const taskStatus = useMemo(() => {
    const status: Record<string, boolean> = {};
    labTasks.forEach(task => {
      status[task.id] = task.checkCondition(safeStats, safeParams, safeEntries);
    });
    return status;
  }, [safeStats, safeParams, safeEntries]);

  const totalXP = useMemo(() => {
    return labTasks.reduce((sum, task) => {
      return sum + (taskStatus[task.id] ? task.xp : 0);
    }, 0);
  }, [taskStatus]);

  const completedCount = Object.values(taskStatus).filter(Boolean).length;

  const filteredTasks = selectedCategory === 'all' 
    ? labTasks 
    : labTasks.filter(t => t.category === selectedCategory);

  const categories = ['all', 'observation', 'measurement', 'analysis', 'advanced'];

  return (
    <div className="bg-emerald-900/60 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-emerald-500/30">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-emerald-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Target size={20} className="text-emerald-400" />
          {labels.title}
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm">
            <Trophy size={16} className="text-yellow-400" />
            <span className="text-yellow-300 font-medium">{totalXP} XP</span>
          </div>
          <span className="text-emerald-300 text-sm">
            {completedCount}/{labTasks.length}
          </span>
          {expanded ? <ChevronUp size={20} className="text-emerald-300" /> : <ChevronDown size={20} className="text-emerald-300" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Category filter */}
          <div className="flex flex-wrap gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-800/40 text-emerald-300 hover:bg-emerald-700/40'
                }`}
              >
                {labels[cat as keyof typeof labels] || cat}
              </button>
            ))}
          </div>

          {/* Tasks list */}
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {filteredTasks.map(task => {
              const isComplete = taskStatus[task.id];
              const colors = difficultyColors[task.difficulty];
              
              return (
                <div
                  key={task.id}
                  className={`rounded-lg p-3 border transition-all ${
                    isComplete 
                      ? 'bg-emerald-700/40 border-emerald-500/40' 
                      : `${colors.bg} ${colors.border}`
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isComplete ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border-2 ${colors.border}`} />
                        )}
                        <span className={`text-sm font-medium ${isComplete ? 'text-emerald-200' : 'text-white'}`}>
                          {lang === 'ru' ? task.titleRu : task.titleEn}
                        </span>
                      </div>
                      
                      <p className={`text-xs ml-6 ${isComplete ? 'text-emerald-300/70' : 'text-emerald-200/80'}`}>
                        {lang === 'ru' ? task.descriptionRu : task.descriptionEn}
                      </p>
                      
                      {!isComplete && (task.hintRu || task.hintEn) && (
                        <p className="text-xs ml-6 mt-1 text-emerald-400/60 italic">
                          💡 {lang === 'ru' ? task.hintRu : task.hintEn}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                        {difficultyLabels[task.difficulty][lang]}
                      </span>
                      <span className="text-xs text-yellow-400 flex items-center gap-0.5">
                        <Star size={10} />
                        {task.xp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress summary */}
          <div className="bg-emerald-800/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-emerald-200">{labels.completed}:</span>
              <span className="text-sm text-white font-medium">
                {completedCount} / {labTasks.length}
              </span>
            </div>
            <div className="w-full bg-emerald-900 rounded-full h-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${(completedCount / labTasks.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
