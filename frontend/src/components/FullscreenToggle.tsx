// components/FullscreenToggle.tsx
/**
 * Fullscreen Toggle Component
 * 
 * Allows users to view the 3D canvas in fullscreen mode
 * for immersive observation and presentations.
 * 
 * Features:
 * - Toggle fullscreen on/off
 * - Keyboard shortcut (F11 or F)
 * - Overlay controls in fullscreen mode
 * - Exit hint display
 */

import { useState, useEffect, useCallback } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface FullscreenToggleProps {
  targetRef: React.RefObject<HTMLElement>;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export function FullscreenToggle({ targetRef, onFullscreenChange }: FullscreenToggleProps) {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if fullscreen is supported
  const isSupported = typeof document !== 'undefined' && 
    (document.fullscreenEnabled || 
     (document as any).webkitFullscreenEnabled || 
     (document as any).mozFullScreenEnabled);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement
      );
      setIsFullscreen(isNowFullscreen);
      onFullscreenChange?.(isNowFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, [onFullscreenChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          toggleFullscreen();
        }
      }
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const enterFullscreen = useCallback(async () => {
    if (!targetRef.current) return;
    
    try {
      if (targetRef.current.requestFullscreen) {
        await targetRef.current.requestFullscreen();
      } else if ((targetRef.current as any).webkitRequestFullscreen) {
        await (targetRef.current as any).webkitRequestFullscreen();
      } else if ((targetRef.current as any).mozRequestFullScreen) {
        await (targetRef.current as any).mozRequestFullScreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, [targetRef]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      }
    } catch (err) {
      console.error('Exit fullscreen error:', err);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={toggleFullscreen}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-all
        ${isFullscreen 
          ? 'bg-red-600 hover:bg-red-500 text-white' 
          : 'bg-slate-800/80 hover:bg-slate-700 text-gray-300'
        }
      `}
      title={isRu 
        ? (isFullscreen ? 'Выйти из полноэкранного (Esc)' : 'Полный экран (F)') 
        : (isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)')
      }
    >
      {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      <span className="text-sm hidden sm:inline">
        {isRu 
          ? (isFullscreen ? 'Выйти' : 'Полный экран') 
          : (isFullscreen ? 'Exit' : 'Fullscreen')
        }
      </span>
    </button>
  );
}

/**
 * Fullscreen overlay controls
 * Shown only in fullscreen mode
 */
interface FullscreenOverlayProps {
  isFullscreen: boolean;
  onExit: () => void;
  children?: React.ReactNode;
}

export function FullscreenOverlay({ isFullscreen, onExit, children }: FullscreenOverlayProps) {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const [showControls, setShowControls] = useState(true);
  const [showHint, setShowHint] = useState(true);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!isFullscreen) return;

    let timeout: NodeJS.Timeout;
    
    const hideControls = () => {
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    const showControlsOnMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      hideControls();
    };

    window.addEventListener('mousemove', showControlsOnMove);
    hideControls();

    return () => {
      window.removeEventListener('mousemove', showControlsOnMove);
      clearTimeout(timeout);
    };
  }, [isFullscreen]);

  // Hide hint after 5 seconds
  useEffect(() => {
    if (isFullscreen && showHint) {
      const timeout = setTimeout(() => setShowHint(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [isFullscreen, showHint]);

  if (!isFullscreen) return null;

  return (
    <>
      {/* Exit hint */}
      {showHint && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="px-4 py-2 bg-slate-900/90 backdrop-blur rounded-lg border border-slate-700 text-gray-300 text-sm">
            {isRu 
              ? 'Нажмите Esc или F для выхода из полноэкранного режима' 
              : 'Press Esc or F to exit fullscreen mode'
            }
          </div>
        </div>
      )}

      {/* Top controls bar */}
      <div 
        className={`
          absolute top-0 left-0 right-0 z-50 p-4
          transition-opacity duration-300
          ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur rounded-lg">
            <span className="text-2xl">🔬</span>
            <span className="text-white font-bold">DIU Physics</span>
          </div>

          {/* Exit button */}
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-500 backdrop-blur rounded-lg text-white transition-colors"
          >
            <X size={18} />
            <span>{isRu ? 'Выйти' : 'Exit'}</span>
          </button>
        </div>
      </div>

      {/* Bottom controls */}
      <div 
        className={`
          absolute bottom-0 left-0 right-0 z-50 p-4
          transition-opacity duration-300
          ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        {children}
      </div>
    </>
  );
}

/**
 * Minimal fullscreen controls for bottom bar
 */
interface MinimalFullscreenControlsProps {
  wavelength: number;
  slitDistance: number;
  intensity: number;
  observerOn: boolean;
  totalParticles: number;
  fringeCount: number;
}

export function MinimalFullscreenControls({
  wavelength,
  slitDistance,
  intensity: _intensity,
  observerOn,
  totalParticles,
  fringeCount,
}: MinimalFullscreenControlsProps) {
  const { language } = useLanguage();
  const isRu = language === 'ru';

  // Wavelength to color
  const getColor = (wl: number) => {
    if (wl >= 620) return '#ef4444';
    if (wl >= 590) return '#f97316';
    if (wl >= 565) return '#eab308';
    if (wl >= 495) return '#22c55e';
    if (wl >= 450) return '#3b82f6';
    return '#8b5cf6';
  };

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {/* Wavelength */}
      <div className="px-4 py-2 bg-slate-900/80 backdrop-blur rounded-lg flex items-center gap-2">
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: getColor(wavelength) }}
        />
        <span className="text-white font-mono">{wavelength} nm</span>
      </div>

      {/* Slit distance */}
      <div className="px-4 py-2 bg-slate-900/80 backdrop-blur rounded-lg text-gray-300">
        d = {slitDistance.toFixed(2)} mm
      </div>

      {/* Observer status */}
      <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
        observerOn ? 'bg-red-600/80 text-white' : 'bg-slate-900/80 text-gray-300'
      }`}>
        {observerOn ? '👁️' : '👁️‍🗨️'} 
        {isRu 
          ? (observerOn ? 'Наблюдатель ВКЛ' : 'Наблюдатель ВЫКЛ')
          : (observerOn ? 'Observer ON' : 'Observer OFF')
        }
      </div>

      {/* Stats */}
      <div className="px-4 py-2 bg-slate-900/80 backdrop-blur rounded-lg text-gray-300">
        {isRu ? 'Частиц' : 'Particles'}: <span className="text-white font-mono">{totalParticles}</span>
      </div>

      <div className="px-4 py-2 bg-slate-900/80 backdrop-blur rounded-lg text-gray-300">
        {isRu ? 'Полос' : 'Fringes'}: <span className="text-cyan-400 font-mono">{fringeCount}</span>
      </div>
    </div>
  );
}
