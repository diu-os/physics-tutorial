// components/ControlsPanel.tsx
import React, { useState, useEffect } from 'react';
import { RotateCcw, Eye, EyeOff, Volume2, VolumeX, Info } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface DoubleSlitParams {
  wavelength: number; slitDistance: number; slitWidth: number; barrierThickness?: number; 
  transmissionEfficiency?: number; coherence: number;
  intensity: number; observerOn: boolean; slowMotion?: boolean; showTrails?: boolean;
  showHeatmap?: boolean; soundEnabled?: boolean; showDiscretePoints?: boolean; showTheoryOverlay?: boolean;
}

interface ControlsPanelProps {
  params: DoubleSlitParams;
  setParams: React.Dispatch<React.SetStateAction<DoubleSlitParams>> | ((params: DoubleSlitParams) => void);
  onReset: () => void;
  isLabMode?: boolean;
}

const T: Record<string, Record<string, string>> = {
  title: { en: 'Controls', ru: 'Управление', es: 'Controles', pt: 'Controles', de: 'Steuerung', fr: 'Contrôles', zh: '控制', ar: 'التحكم' },
  wavelength: { en: 'Wavelength', ru: 'Длина волны', es: 'Longitud de Onda', pt: 'Comprimento de Onda', de: 'Wellenlänge', fr: 'Longueur d\'Onde', zh: '波长', ar: 'طول الموجة' },
  slitDistance: { en: 'Slit Distance', ru: 'Расстояние щелей', es: 'Distancia Rendijas', pt: 'Distância Fendas', de: 'Spaltabstand', fr: 'Distance Fentes', zh: '狭缝间距', ar: 'المسافة بين الشقوق' },
  slitWidth: { en: 'Slit Width', ru: 'Ширина щели', es: 'Ancho Rendija', pt: 'Largura Fenda', de: 'Spaltbreite', fr: 'Largeur Fente', zh: '狭缝宽度', ar: 'عرض الشق' },
  barrierThickness: { en: 'Barrier Thickness', ru: 'Толщина барьера', es: 'Grosor Barrera', pt: 'Espessura Barreira', de: 'Barrieredicke', fr: 'Épaisseur Barrière', zh: '屏障厚度', ar: 'سمك الحاجز' },
  transmission: { en: 'Transmission', ru: 'Пропускание', es: 'Transmisión', pt: 'Transmissão', de: 'Transmission', fr: 'Transmission', zh: '透射率', ar: 'النفاذية' },
  intensity: { en: 'Intensity', ru: 'Интенсивность', es: 'Intensidad', pt: 'Intensidade', de: 'Intensität', fr: 'Intensité', zh: '强度', ar: 'الشدة' },
  coherence: { en: 'Coherence', ru: 'Когерентность', es: 'Coherencia', pt: 'Coerência', de: 'Kohärenz', fr: 'Cohérence', zh: '相干性', ar: 'التماسك' },
  detectorOn: { en: 'Detector ON', ru: 'Детектор ВКЛ', es: 'Detector ON', pt: 'Detector ON', de: 'Detektor AN', fr: 'Détecteur ON', zh: '探测器开', ar: 'الكاشف مفعّل' },
  detectorOff: { en: 'Detector OFF', ru: 'Детектор ВЫКЛ', es: 'Detector OFF', pt: 'Detector OFF', de: 'Detektor AUS', fr: 'Détecteur OFF', zh: '探测器关', ar: 'الكاشف معطّل' },
  slow: { en: 'Slow', ru: 'Замедл.', es: 'Lento', pt: 'Lento', de: 'Langsam', fr: 'Ralenti', zh: '慢速', ar: 'بطيء' },
  sound: { en: 'Sound', ru: 'Звук', es: 'Sonido', pt: 'Som', de: 'Ton', fr: 'Son', zh: '声音', ar: 'صوت' },
  trails: { en: 'Trails', ru: 'Следы', es: 'Estelas', pt: 'Rastros', de: 'Spuren', fr: 'Traînées', zh: '轨迹', ar: 'المسارات' },
  heat: { en: 'Heat', ru: 'Карта', es: 'Calor', pt: 'Calor', de: 'Wärme', fr: 'Chaleur', zh: '热图', ar: 'حرارة' },
  points: { en: 'Points', ru: 'Точки', es: 'Puntos', pt: 'Pontos', de: 'Punkte', fr: 'Points', zh: '点', ar: 'نقاط' },
  theory: { en: 'Theory', ru: 'Теория', es: 'Teoría', pt: 'Teoria', de: 'Theorie', fr: 'Théorie', zh: '理论', ar: 'النظرية' },
  narrow: { en: 'Narrow', ru: 'Узкая', es: 'Estrecha', pt: 'Estreita', de: 'Eng', fr: 'Étroite', zh: '窄', ar: 'ضيق' },
  wide: { en: 'Wide', ru: 'Широкая', es: 'Ancha', pt: 'Larga', de: 'Breit', fr: 'Large', zh: '宽', ar: 'واسع' },
  thin: { en: 'Thin', ru: 'Тонкий', es: 'Delgada', pt: 'Fina', de: 'Dünn', fr: 'Mince', zh: '薄', ar: 'رقيق' },
  thick: { en: 'Thick', ru: 'Толстый', es: 'Gruesa', pt: 'Grossa', de: 'Dick', fr: 'Épaisse', zh: '厚', ar: 'سميك' },
  lossy: { en: 'Lossy', ru: 'С потерями', es: 'Con pérdidas', pt: 'Com perdas', de: 'Verlustreich', fr: 'Avec pertes', zh: '有损', ar: 'مع خسائر' },
  perfect: { en: 'Perfect', ru: 'Идеально', es: 'Perfecto', pt: 'Perfeito', de: 'Perfekt', fr: 'Parfait', zh: '完美', ar: 'مثالي' },
  incoh: { en: 'Incoh.', ru: 'Некогер.', es: 'Incoh.', pt: 'Incoh.', de: 'Inkoh.', fr: 'Incoh.', zh: '非相干', ar: 'غير متماسك' },
  coh: { en: 'Coh.', ru: 'Когер.', es: 'Coh.', pt: 'Coh.', de: 'Koh.', fr: 'Coh.', zh: '相干', ar: 'متماسك' },
  // Rotating tips
  tip0: { en: '💡 Use mouse to rotate camera', ru: '💡 Мышь для вращения камеры', es: '💡 Usa ratón para rotar', pt: '💡 Use mouse para girar', de: '💡 Maus zum Drehen', fr: '💡 Souris pour tourner', zh: '💡 鼠标旋转相机', ar: '💡 استخدم الماوس للتدوير' },
  tip1: { en: '💡 Scroll to zoom in/out', ru: '💡 Колесо мыши для масштаба', es: '💡 Desplaza para zoom', pt: '💡 Scroll para zoom', de: '💡 Scrollen zum Zoomen', fr: '💡 Défilez pour zoomer', zh: '💡 滚轮缩放', ar: '💡 مرر للتكبير/التصغير' },
  tip2: { en: '💡 Press F for fullscreen', ru: '💡 Нажми F для полного экрана', es: '💡 Pulsa F para pantalla completa', pt: '💡 Pressione F para tela cheia', de: '💡 F für Vollbild', fr: '💡 Appuyez sur F pour plein écran', zh: '💡 按F全屏', ar: '💡 اضغط F للشاشة الكاملة' },
  tip3: { en: '💡 Try turning detector ON', ru: '💡 Включи детектор для опыта', es: '💡 Activa el detector', pt: '💡 Tente ligar o detector', de: '💡 Detektor einschalten', fr: '💡 Essayez le détecteur', zh: '💡 试试打开探测器', ar: '💡 جرب تشغيل الكاشف' },
  tip4: { en: '💡 Shorter λ = more fringes', ru: '💡 Короче λ = больше полос', es: '💡 Menor λ = más franjas', pt: '💡 Menor λ = mais franjas', de: '💡 Kürzeres λ = mehr Streifen', fr: '💡 λ court = plus de franges', zh: '💡 短波长=更多条纹', ar: '💡 λ أقصر = المزيد من الأهداب' },
  tip5: { en: '💡 Reset clears all data', ru: '💡 Сброс очищает данные', es: '💡 Reiniciar borra datos', pt: '💡 Reset limpa os dados', de: '💡 Reset löscht Daten', fr: '💡 Reset efface les données', zh: '💡 重置清除所有数据', ar: '💡 إعادة التعيين تمسح البيانات' },
  // Tooltips
  tipWavelength: { en: 'Light wavelength (nm). Violet to Red. Affects fringe spacing.', ru: 'Длина волны света (нм). От фиолетового до красного. Влияет на расстояние между полосами.', es: 'Longitud de onda (nm). Afecta el espaciado.', pt: 'Comprimento de onda (nm). Afeta o espaçamento.', de: 'Lichtwellenlänge (nm). Beeinflusst Streifenabstand.', fr: 'Longueur d\'onde (nm). Affecte l\'espacement.', zh: '光波长(nm)。影响条纹间距。', ar: 'طول الموجة. يؤثر على التباعد.' },
  tipSlitDist: { en: 'Distance between slits. More distance = more fringes.', ru: 'Расстояние между щелями. Больше = больше полос.', es: 'Distancia entre rendijas. Más = más franjas.', pt: 'Distância entre fendas. Mais = mais franjas.', de: 'Spaltabstand. Mehr = mehr Streifen.', fr: 'Distance entre fentes. Plus = plus de franges.', zh: '狭缝间距。越大=越多条纹。', ar: 'المسافة بين الشقوق. أكثر = المزيد من الأهداب.' },
  tipSlitWidth: { en: 'Width of each slit. Narrower = wider diffraction envelope.', ru: 'Ширина щели. Уже = шире огибающая дифракции.', es: 'Ancho de rendija. Más estrecha = envoltura más ancha.', pt: 'Largura da fenda. Mais estreita = envelope mais largo.', de: 'Spaltbreite. Enger = breitere Beugungshülle.', fr: 'Largeur de fente. Plus étroite = enveloppe plus large.', zh: '狭缝宽度。越窄=衍射包络越宽。', ar: 'عرض الشق. أضيق = غلاف أوسع.' },
  tipBarrier: { 
    en: 'Barrier thickness (t). θ_max = arctan(a/t). Thin barrier: all angles pass freely, wide pattern. Thick barrier: acts as collimator, blocks large angles → narrows interference pattern. Real slits: 0.1-0.5 mm.', 
    ru: 'Толщина барьера (t). θ_max = arctan(a/t). Тонкий: все углы проходят, широкая картина. Толстый: работает как коллиматор, блокирует большие углы → сужает интерференционную картину. Реальные щели: 0.1-0.5 мм.', 
    es: 'Grosor de barrera (t). θ_max = arctan(a/t). Delgada: todos los ángulos pasan. Gruesa: actúa como colimador, bloquea ángulos grandes → estrecha el patrón.', 
    pt: 'Espessura da barreira (t). θ_max = arctan(a/t). Fina: todos os ângulos passam. Grossa: atua como colimador, bloqueia grandes ângulos → estreita o padrão.', 
    de: 'Barrieredicke (t). θ_max = arctan(a/t). Dünn: alle Winkel passieren. Dick: wirkt als Kollimator, blockiert große Winkel → verengt das Muster.', 
    fr: 'Épaisseur barrière (t). θ_max = arctan(a/t). Mince: tous les angles passent. Épaisse: agit comme collimateur, bloque les grands angles → rétrécit le motif.', 
    zh: '屏障厚度(t)。θ_max = arctan(a/t)。薄：所有角度通过，宽图样。厚：起准直器作用，阻挡大角度→缩窄干涉图样。', 
    ar: 'سمك الحاجز (t). θ_max = arctan(a/t). رقيق: جميع الزوايا تمر. سميك: يعمل كموحد، يحجب الزوايا الكبيرة ← يضيق النمط.' 
  },
  tipIntensity: { en: 'Particles per second. Higher = faster pattern.', ru: 'Частиц в секунду. Больше = быстрее паттерн.', es: 'Partículas/seg. Más = patrón más rápido.', pt: 'Partículas/seg. Mais = padrão mais rápido.', de: 'Teilchen/Sek. Mehr = schnelleres Muster.', fr: 'Particules/sec. Plus = motif plus rapide.', zh: '每秒粒子数。越高=图样形成越快。', ar: 'جسيمات/ثانية. أعلى = نمط أسرع.' },
  tipCoherence: { en: 'Source coherence. 100% = perfect interference.', ru: 'Когерентность. 100% = идеальная интерференция.', es: 'Coherencia. 100% = interferencia perfecta.', pt: 'Coerência. 100% = interferência perfeita.', de: 'Kohärenz. 100% = perfekte Interferenz.', fr: 'Cohérence. 100% = interférence parfaite.', zh: '相干性。100%=完美干涉。', ar: 'التماسك. 100% = تداخل مثالي.' },
  tipTransmission: { en: 'Slit transmission efficiency. 100% = all pass through. Lower values = some particles absorbed/reflected by barrier (realistic losses).', ru: 'Эффективность пропускания щели. 100% = все проходят. Меньше = часть поглощается/отражается барьером (реалистичные потери).', es: 'Eficiencia de transmisión. 100% = todas pasan. Menor = algunas partículas absorbidas.', pt: 'Eficiência de transmissão. 100% = todas passam. Menor = algumas partículas absorvidas.', de: 'Transmissionseffizienz. 100% = alle passieren. Niedriger = einige Teilchen absorbiert.', fr: 'Efficacité de transmission. 100% = toutes passent. Inférieur = certaines particules absorbées.', zh: '透射效率。100%=全部通过。较低=部分粒子被屏障吸收/反射。', ar: 'كفاءة النفاذ. 100% = الكل يمر. أقل = بعض الجسيمات تُمتص.' },
  tipDetector: { en: 'Detector collapses wave function — no interference!', ru: 'Детектор коллапсирует волновую функцию — нет интерференции!', es: '¡El detector colapsa la función de onda!', pt: 'O detector colapsa a função de onda!', de: 'Detektor kollabiert die Wellenfunktion!', fr: 'Le détecteur effondre la fonction d\'onde!', zh: '探测器导致波函数坍缩——无干涉！', ar: 'الكاشف يُسقط دالة الموجة!' },
};

function Tip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex">
      <Info size={12} className="text-indigo-400 cursor-help" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} />
      {show && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 border border-slate-600 rounded text-xs text-slate-200 z-50">{text}</div>}
    </div>
  );
}

function getWavelengthColor(wl: number): string {
  if (wl < 450) return '#8b5cf6'; if (wl < 495) return '#3b82f6'; if (wl < 520) return '#06b6d4';
  if (wl < 565) return '#22c55e'; if (wl < 590) return '#eab308'; if (wl < 625) return '#f97316'; return '#ef4444';
}

export function ControlsPanel({ params, setParams, onReset, isLabMode = false }: ControlsPanelProps) {
  const { language } = useLanguage();
  const g = (k: string) => T[k]?.[language] || T[k]?.en || k;
  
  // Rotating tips - change every 5 seconds
  const [tipIndex, setTipIndex] = useState(0);
  const tipCount = 6;
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tipCount);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const { wavelength, slitDistance, slitWidth = 0.05, barrierThickness = 0.1, transmissionEfficiency = 100, coherence = 100, intensity, observerOn,
    slowMotion = false, showTrails = true, showHeatmap = true, soundEnabled = false, showDiscretePoints = true, showTheoryOverlay = false } = params;

  const up = <K extends keyof DoubleSlitParams>(key: K, value: DoubleSlitParams[K]) => {
    if (typeof setParams === 'function') setParams((prev: DoubleSlitParams) => ({ ...prev, [key]: value }));
  };

  // Draft state: sliders update visuals immediately, physics updates only on pointer/key up
  const [drafts, setDrafts] = useState({ wavelength, slitDistance, slitWidth, barrierThickness, transmissionEfficiency, coherence, intensity });
  useEffect(() => {
    setDrafts({ wavelength, slitDistance, slitWidth, barrierThickness, transmissionEfficiency, coherence, intensity });
  }, [wavelength, slitDistance, slitWidth, barrierThickness, transmissionEfficiency, coherence, intensity]);
  const setDraft = (key: keyof typeof drafts, value: number) => setDrafts(prev => ({ ...prev, [key]: value }));
  const commitDraft = (key: keyof typeof drafts) => up(key as keyof DoubleSlitParams, drafts[key] as DoubleSlitParams[keyof DoubleSlitParams]);

  const cls = isLabMode ? "bg-slate-900/95 backdrop-blur-md rounded-xl p-4 space-y-4 shadow-lg border border-emerald-500/30"
    : "bg-indigo-900/60 backdrop-blur-md rounded-xl p-4 space-y-4 shadow-lg border border-indigo-500/30";

  return (
    <div className={cls}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{g('title')}{isLabMode && <span className="ml-2 text-xs text-emerald-400">🔬</span>}</h3>
        <button onClick={onReset} className="p-2 hover:bg-indigo-700/50 rounded-lg"><RotateCcw size={18} className="text-indigo-300" /></button>
      </div>

      {/* Wavelength */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1"><label className="text-sm text-indigo-200">{g('wavelength')}</label><Tip text={g('tipWavelength')} /></div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getWavelengthColor(wavelength), boxShadow: `0 0 10px ${getWavelengthColor(wavelength)}` }} />
            <span className="text-cyan-300 font-mono text-sm">{drafts.wavelength} nm</span>
          </div>
        </div>
        <input type="range" min={400} max={700} step={10} value={drafts.wavelength}
          onChange={(e) => setDraft('wavelength', Number(e.target.value))}
          onPointerUp={() => commitDraft('wavelength')}
          onKeyUp={() => commitDraft('wavelength')}
          className="w-full h-2 rounded-lg cursor-pointer accent-cyan-500" style={{ background: 'linear-gradient(to right, #8b5cf6, #3b82f6, #06b6d4, #22c55e, #eab308, #f97316, #ef4444)' }} />
      </div>

      {/* Slit Distance */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1"><label className="text-sm text-indigo-200">{g('slitDistance')}</label><Tip text={g('tipSlitDist')} /></div>
          <span className="text-cyan-300 font-mono text-sm">{drafts.slitDistance.toFixed(2)} mm</span>
        </div>
        <input type="range" min={0.1} max={1.0} step={0.05} value={drafts.slitDistance}
          onChange={(e) => setDraft('slitDistance', Number(e.target.value))}
          onPointerUp={() => commitDraft('slitDistance')}
          onKeyUp={() => commitDraft('slitDistance')}
          className="w-full h-2 bg-indigo-800 rounded-lg cursor-pointer accent-cyan-500" />
      </div>

      {/* Slit Width */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1"><label className="text-sm text-indigo-200">{g('slitWidth')}</label><Tip text={g('tipSlitWidth')} /></div>
          <span className="text-teal-300 font-mono text-sm">{drafts.slitWidth.toFixed(3)} mm</span>
        </div>
        <input type="range" min={0.01} max={0.2} step={0.005} value={drafts.slitWidth}
          onChange={(e) => setDraft('slitWidth', Number(e.target.value))}
          onPointerUp={() => commitDraft('slitWidth')}
          onKeyUp={() => commitDraft('slitWidth')}
          className="w-full h-2 bg-indigo-800 rounded-lg cursor-pointer accent-teal-500" />
        <div className="flex justify-between text-[10px] text-gray-500 mt-1"><span>{g('narrow')}</span><span>{g('wide')}</span></div>
      </div>

      {/* Barrier Thickness (Lab only) */}
      {isLabMode && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1"><label className="text-sm text-indigo-200">{g('barrierThickness')}</label><Tip text={g('tipBarrier')} /></div>
            <span className="text-amber-300 font-mono text-sm">{drafts.barrierThickness.toFixed(2)} mm</span>
          </div>
          <input type="range" min={0.02} max={0.5} step={0.02} value={drafts.barrierThickness}
            onChange={(e) => setDraft('barrierThickness', Number(e.target.value))}
            onPointerUp={() => commitDraft('barrierThickness')}
            onKeyUp={() => commitDraft('barrierThickness')}
            className="w-full h-2 bg-indigo-800 rounded-lg cursor-pointer accent-amber-500" />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1"><span>{g('thin')}</span><span>{g('thick')}</span></div>
        </div>
      )}

      {/* Transmission Efficiency (Lab only) */}
      {isLabMode && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1"><label className="text-sm text-indigo-200">{g('transmission')}</label><Tip text={g('tipTransmission')} /></div>
            <span className="text-rose-300 font-mono text-sm">{drafts.transmissionEfficiency}%</span>
          </div>
          <input type="range" min={50} max={100} step={5} value={drafts.transmissionEfficiency}
            onChange={(e) => setDraft('transmissionEfficiency', Number(e.target.value))}
            onPointerUp={() => commitDraft('transmissionEfficiency')}
            onKeyUp={() => commitDraft('transmissionEfficiency')}
            className="w-full h-2 bg-indigo-800 rounded-lg cursor-pointer accent-rose-500" />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1"><span>{g('lossy')}</span><span>{g('perfect')}</span></div>
        </div>
      )}

      {/* Coherence (Lab only) */}
      {isLabMode && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1"><label className="text-sm text-indigo-200">{g('coherence')}</label><Tip text={g('tipCoherence')} /></div>
            <span className="text-purple-300 font-mono text-sm">{drafts.coherence}%</span>
          </div>
          <input type="range" min={0} max={100} step={5} value={drafts.coherence}
            onChange={(e) => setDraft('coherence', Number(e.target.value))}
            onPointerUp={() => commitDraft('coherence')}
            onKeyUp={() => commitDraft('coherence')}
            className="w-full h-2 bg-indigo-800 rounded-lg cursor-pointer accent-purple-500" />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1"><span>{g('incoh')}</span><span>{g('coh')}</span></div>
        </div>
      )}

      {/* Intensity */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1"><label className="text-sm text-indigo-200">{g('intensity')}</label><Tip text={g('tipIntensity')} /></div>
          <span className="text-yellow-300 font-mono text-sm">{drafts.intensity}</span>
        </div>
        <input type="range" min={10} max={100} step={5} value={drafts.intensity}
          onChange={(e) => setDraft('intensity', Number(e.target.value))}
          onPointerUp={() => commitDraft('intensity')}
          onKeyUp={() => commitDraft('intensity')}
          className="w-full h-2 bg-indigo-800 rounded-lg cursor-pointer accent-yellow-500" />
      </div>

      {/* Detector Button */}
      <div className="relative">
        <button onClick={() => up('observerOn', !observerOn)}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${observerOn ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30' : 'bg-indigo-700/50 hover:bg-indigo-600/50 text-indigo-100'}`}>
          {observerOn ? <Eye size={20} /> : <EyeOff size={20} />}
          {observerOn ? g('detectorOn') : g('detectorOff')}
        </button>
        <div className="absolute right-2 top-1/2 -translate-y-1/2"><Tip text={g('tipDetector')} /></div>
      </div>

      {/* Additional Controls Grid */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => up('slowMotion', !slowMotion)} className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 transition-all ${slowMotion ? 'bg-purple-600 text-white' : 'bg-indigo-800/50 text-indigo-300 hover:bg-indigo-700/50'}`}>
          🐢 {g('slow')}
        </button>
        <button onClick={() => up('soundEnabled', !soundEnabled)} className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 transition-all ${soundEnabled ? 'bg-green-600 text-white' : 'bg-indigo-800/50 text-indigo-300 hover:bg-indigo-700/50'}`}>
          {soundEnabled ? <Volume2 size={16}/> : <VolumeX size={16}/>} {g('sound')}
        </button>
        <button onClick={() => up('showTrails', !showTrails)} className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 transition-all ${showTrails ? 'bg-blue-600 text-white' : 'bg-indigo-800/50 text-indigo-300 hover:bg-indigo-700/50'}`}>
          ✨ {g('trails')}
        </button>
        <button onClick={() => up('showHeatmap', !showHeatmap)} className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 transition-all ${showHeatmap ? 'bg-orange-600 text-white' : 'bg-indigo-800/50 text-indigo-300 hover:bg-indigo-700/50'}`}>
          🌡️ {g('heat')}
        </button>
        {/* Points button - only in Lab mode (Demo uses screenMode) */}
        {isLabMode && (
          <button onClick={() => up('showDiscretePoints', !showDiscretePoints)} className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 transition-all ${showDiscretePoints ? 'bg-cyan-600 text-white' : 'bg-indigo-800/50 text-indigo-300 hover:bg-indigo-700/50'}`}>
            ⚬ {g('points')}
          </button>
        )}
        {isLabMode && (
          <button onClick={() => up('showTheoryOverlay', !showTheoryOverlay)} className={`py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-1 transition-all ${showTheoryOverlay ? 'bg-pink-600 text-white' : 'bg-indigo-800/50 text-indigo-300 hover:bg-indigo-700/50'}`}>
            📈 {g('theory')}
          </button>
        )}
      </div>

      <p className="text-xs text-indigo-400 text-center pt-2 border-t border-indigo-700/50 transition-all duration-500">{g(`tip${tipIndex}`)}</p>
    </div>
  );
}
