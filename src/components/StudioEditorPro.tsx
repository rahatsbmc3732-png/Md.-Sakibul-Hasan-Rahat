import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Sliders,
  Palette,
  Check,
  Move,
  RotateCcw,
  Sparkles,
  MousePointer,
  Film,
} from 'lucide-react';

interface StudioEditorProProps {
  particleSpeed: number;
  setParticleSpeed: (v: number) => void;
  activeTheme: string;
  setActiveTheme: (t: string) => void;
  isCustomizeMode?: boolean;
  setIsCustomizeMode?: (v: boolean) => void;
  onResetAllLayouts?: () => void;
}

export const StudioEditorPro: React.FC<StudioEditorProProps> = ({
  particleSpeed,
  setParticleSpeed,
  activeTheme,
  setActiveTheme,
  isCustomizeMode = false,
  setIsCustomizeMode,
  onResetAllLayouts,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleTrigger = () => setIsOpen(true);
    window.addEventListener('rahat:open-studio-editor', handleTrigger);
    return () => window.removeEventListener('rahat:open-studio-editor', handleTrigger);
  }, []);

  const themes = [
    { id: 'award-dark', name: 'Award Dark (Gold & Charcoal)', color: '#D4AF37' },
    { id: 'sci-fi-neon', name: 'Sci-Fi Neon (Cyan & Emerald)', color: '#00F0FF' },
    { id: 'zen-minimal', name: 'Zen Minimal (Obsidian & Silver)', color: '#E5E5E5' },
  ];

  const handleToggleCustomize = () => {
    if (setIsCustomizeMode) {
      const next = !isCustomizeMode;
      setIsCustomizeMode(next);
      setSavedMsg(
        next
          ? '✨ Drag & Customize Mode turned ON! You can now drag videos and graphics freely.'
          : '🔒 Customize Mode locked and positions saved.'
      );
      setTimeout(() => setSavedMsg(null), 3500);
    }
  };

  const handleReset = () => {
    if (onResetAllLayouts) {
      onResetAllLayouts();
      setSavedMsg('🔄 Default video and graphic order restored!');
      setTimeout(() => setSavedMsg(null), 3000);
    }
  };

  return (
    <>
      {/* Floating Toggle Button with active indicator */}
      <button
        onClick={() => setIsOpen(true)}
        title="Open Studio Editor Pro & Customization Settings"
        className={`fixed bottom-6 left-6 z-40 px-4 py-2.5 rounded-full font-mono text-xs font-bold transition-all duration-300 flex items-center gap-2 group cursor-pointer backdrop-blur-md click-bounce ${
          isCustomizeMode
            ? 'bg-amber-400 text-black border-2 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-pulse'
            : 'bg-[#121212]/95 border border-gold text-gold shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:scale-105 hover:bg-gold hover:text-black'
        }`}
      >
        <Settings size={14} className="group-hover:rotate-90 transition-transform duration-500" />
        <span>Studio Settings</span>
        {isCustomizeMode && (
          <span className="px-1.5 py-0.5 rounded-full bg-black text-amber-300 text-[9px] uppercase tracking-wider">
            Drag ON
          </span>
        )}
      </button>

      {/* Editor Modal */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#121316] border border-gold/40 rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(212,175,55,0.25)] flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                  <Sliders size={16} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white leading-tight">
                    Studio Customizer
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Layout & Visual Engine
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* ═══ MASTER DRAG & CUSTOMIZE TOGGLE ═══ */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-gold/10 to-transparent border border-gold/40 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Move size={16} className="text-amber-300" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Drag & Reorder / সাজানোর মোড
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleCustomize}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    isCustomizeMode ? 'bg-amber-400' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isCustomizeMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                এটি চালু থাকলে আপনি মাউস দিয়ে টেনে ভিডিও এবং গ্রাফিক্স কার্ড যেকোনো দিকে সরাতে ও নতুনভাবে সাজিয়ে নিতে পারবেন।
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                    isCustomizeMode
                      ? 'bg-amber-400 text-black font-bold'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isCustomizeMode ? '● Drag Mode: ACTIVE (টেনে সাজানো সচল)' : '○ Drag Mode: OFF'}
                </span>
                {onResetAllLayouts && (
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-zinc-300 text-[10px] font-mono transition-colors cursor-pointer ml-auto"
                  >
                    <RotateCcw size={11} />
                    <span>Reset All / রিসেট</span>
                  </button>
                )}
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-gold font-bold">
                <Palette size={14} />
                <span>Color Harmony & Palette</span>
              </div>
              <div className="space-y-1.5">
                {themes.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setActiveTheme(t.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      activeTheme === t.id
                        ? 'border-gold bg-gold/10 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-semibold text-white">{t.name}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: t.color }}
                      />
                      {activeTheme === t.id && <Check size={14} className="text-gold" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Particle Speed Slider */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300 font-medium">Ambient Particle Speed</span>
                <span className="text-gold font-bold">{particleSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.5"
                step="0.1"
                value={particleSpeed}
                onChange={(e) => setParticleSpeed(parseFloat(e.target.value))}
                className="w-full accent-gold cursor-pointer"
              />
            </div>

            {/* Save Notice */}
            {savedMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono text-center">
                {savedMsg}
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-gold text-black font-bold text-xs font-mono uppercase tracking-wider hover:bg-[#FFDF00] transition-colors cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            >
              Done & Save
            </button>
          </div>
        </div>
      )}
    </>
  );
};
