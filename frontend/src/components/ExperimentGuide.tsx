// components/ExperimentGuide.tsx
import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ChevronDown, ChevronUp, Lightbulb, AlertCircle, Sparkles } from 'lucide-react';
import type { DoubleSlitStats, DoubleSlitParams } from '../simulations/DoubleSlit';

interface ExperimentGuideProps {
  stats: DoubleSlitStats;
  params: DoubleSlitParams;
}

export function ExperimentGuide({ stats, params }: ExperimentGuideProps) {
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(true);

  // Determine current step based on stats
  const getCurrentStep = () => {
    if (stats.totalParticles === 0) return 0;
    if (stats.totalParticles < 30) return 1;
    if (!params.observerOn && stats.fringeCount < 3) return 2;
    if (!params.observerOn && stats.fringeCount >= 3) return 3;
    if (params.observerOn) return 4;
    return 5;
  };

  const currentStep = getCurrentStep();

  const content = lang === 'ru' ? {
    title: '🎓 Руководство по эксперименту',
    steps: [
      {
        title: 'Шаг 1: Запуск',
        desc: 'Эксперимент начался! Наблюдайте, как фотоны вылетают из источника (слева) и движутся к барьеру с двумя щелями.',
        tip: '💡 Вращайте камеру мышью, чтобы рассмотреть установку со всех сторон.',
        active: currentStep === 0
      },
      {
        title: 'Шаг 2: Накопление частиц',
        desc: 'Частицы проходят через щели и попадают на экран. Каждое попадание отображается на тепловой карте справа.',
        tip: '💡 Подождите, пока накопится хотя бы 50 частиц для статистики.',
        active: currentStep === 1
      },
      {
        title: 'Шаг 3: Наблюдение интерференции',
        desc: 'Вы должны увидеть полосы на экране — это интерференционная картина! Каждая частица проходит через ОБЕ щели одновременно.',
        tip: '💡 Попробуйте уменьшить длину волны (400-450 нм) для большего числа полос.',
        active: currentStep === 2 || currentStep === 3
      },
      {
        title: 'Шаг 4: Эффект наблюдателя',
        desc: 'Включите детектор (кнопка "Детектор ВКЛ"). Интерференция исчезнет! Измерение разрушает квантовую суперпозицию.',
        tip: '💡 Это ключевой парадокс квантовой механики: наблюдение меняет результат.',
        active: currentStep === 4
      },
      {
        title: 'Шаг 5: Исследование',
        desc: 'Экспериментируйте с параметрами! Меняйте длину волны, расстояние между щелями и толщину барьера.',
        tip: '💡 Толстый барьер работает как коллиматор — блокирует большие углы и сужает картину.',
        active: currentStep === 5
      }
    ],
    recommendations: {
      title: '📋 Рекомендации',
      items: [
        { condition: stats.totalParticles < 50, text: '▸ Соберите больше частиц для надёжной статистики' },
        { condition: !params.observerOn && stats.fringeCount < 3 && stats.totalParticles > 50, text: '▸ Уменьшите длину волны для более чёткой интерференции' },
        { condition: params.slitDistance > 1.5, text: '▸ Расстояние щелей большое — полосы могут сливаться' },
        { condition: params.intensity < 20, text: '▸ Увеличьте интенсивность для быстрого сбора данных' },
        { condition: stats.contrast < 0.3 && stats.totalParticles > 100, text: '▸ Низкий контраст — попробуйте другие параметры' },
        { condition: (params.barrierThickness || 0) > 0.3, text: '▸ Толстый барьер — угловое ограничение активно (θ_max = arctan(a/t))' },
      ]
    },
    whatIsHappening: {
      title: '❓ Что происходит?',
      quantum: 'Сейчас детектор выключен. Каждый фотон существует в суперпозиции — он проходит через обе щели одновременно и интерферирует сам с собой! На экране появляются характерные полосы.',
      classical: 'Детектор включён и "наблюдает" за щелями. Это заставляет фотон выбрать одну щель, и он ведёт себя как обычная частица. Интерференция исчезает, остаются только две полосы.'
    }
  } : {
    title: '🎓 Experiment Guide',
    steps: [
      {
        title: 'Step 1: Launch',
        desc: 'The experiment has started! Watch photons emerge from the source (left) and travel toward the barrier with two slits.',
        tip: '💡 Rotate the camera with your mouse to view the setup from all angles.',
        active: currentStep === 0
      },
      {
        title: 'Step 2: Collecting Particles',
        desc: 'Particles pass through the slits and hit the screen. Each hit is displayed on the heatmap on the right.',
        tip: '💡 Wait until at least 50 particles accumulate for meaningful statistics.',
        active: currentStep === 1
      },
      {
        title: 'Step 3: Observing Interference',
        desc: 'You should see bands on the screen — this is the interference pattern! Each particle passes through BOTH slits simultaneously.',
        tip: '💡 Try reducing the wavelength (400-450 nm) for more fringes.',
        active: currentStep === 2 || currentStep === 3
      },
      {
        title: 'Step 4: Observer Effect',
        desc: 'Turn on the detector ("Detector ON" button). The interference will disappear! Measurement destroys quantum superposition.',
        tip: '💡 This is the key paradox of quantum mechanics: observation changes the outcome.',
        active: currentStep === 4
      },
      {
        title: 'Step 5: Exploration',
        desc: 'Experiment with the parameters! Change wavelength, slit distance, and barrier thickness.',
        tip: '💡 A thick barrier acts as a collimator — blocks large angles and narrows the pattern.',
        active: currentStep === 5
      }
    ],
    recommendations: {
      title: '📋 Recommendations',
      items: [
        { condition: stats.totalParticles < 50, text: '▸ Collect more particles for reliable statistics' },
        { condition: !params.observerOn && stats.fringeCount < 3 && stats.totalParticles > 50, text: '▸ Reduce wavelength for clearer interference' },
        { condition: params.slitDistance > 1.5, text: '▸ Slit distance is large — fringes may merge' },
        { condition: params.intensity < 20, text: '▸ Increase intensity for faster data collection' },
        { condition: stats.contrast < 0.3 && stats.totalParticles > 100, text: '▸ Low contrast — try different parameters' },
        { condition: (params.barrierThickness || 0) > 0.3, text: '▸ Thick barrier — angular cutoff active (θ_max = arctan(a/t))' },
      ]
    },
    whatIsHappening: {
      title: '❓ What\'s Happening?',
      quantum: 'The detector is currently off. Each photon exists in superposition — it passes through both slits simultaneously and interferes with itself! Characteristic bands appear on the screen.',
      classical: 'The detector is on and "watching" the slits. This forces the photon to choose one slit, and it behaves like an ordinary particle. Interference disappears, leaving only two bands.'
    }
  };

  const activeRecommendations = content.recommendations.items.filter(item => item.condition);

  return (
    <div className="bg-indigo-900/60 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-indigo-500/30">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-indigo-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          {content.title}
        </h3>
        {expanded ? <ChevronUp size={18} className="text-indigo-300" /> : <ChevronDown size={18} className="text-indigo-300" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* What is happening now */}
          <div className={`rounded-lg p-3 ${params.observerOn ? 'bg-orange-500/15 border border-orange-500/30' : 'bg-blue-500/15 border border-blue-500/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className={params.observerOn ? 'text-orange-400' : 'text-blue-400'} />
              <span className="text-sm font-medium text-white">{content.whatIsHappening.title}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {params.observerOn ? content.whatIsHappening.classical : content.whatIsHappening.quantum}
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {content.steps.map((step, index) => (
              <div 
                key={index}
                className={`rounded-lg p-3 transition-all ${
                  step.active 
                    ? 'bg-emerald-500/20 border border-emerald-500/40' 
                    : 'bg-slate-700/30'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    step.active ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${step.active ? 'text-emerald-300' : 'text-slate-300'}`}>
                      {step.title}
                    </div>
                    {step.active && (
                      <>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{step.desc}</p>
                        <p className="text-xs text-yellow-300 mt-2 flex items-start gap-1">
                          <Lightbulb size={12} className="flex-shrink-0 mt-0.5" />
                          <span>{step.tip}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          {activeRecommendations.length > 0 && (
            <div className="bg-amber-500/15 border border-amber-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-amber-400" />
                <span className="text-sm font-medium text-amber-300">{content.recommendations.title}</span>
              </div>
              <div className="space-y-1">
                {activeRecommendations.map((item, index) => (
                  <p key={index} className="text-xs text-slate-200">{item.text}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
