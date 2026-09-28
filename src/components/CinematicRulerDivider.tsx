import React from 'react';

interface CinematicRulerDividerProps {
  label?: string;
  subLabel?: string;
}

export const CinematicRulerDivider: React.FC<CinematicRulerDividerProps> = ({
  label = 'CREATIVE TRANSITION • PRODUCTION TO GRAPHIC SUITE',
  subLabel = '35MM CALIBRATION SCALE • 24 FPS TIMELINE',
}) => {
  // Generate 81 precision ruler ticks for a film/studio timeline ruler look
  const ticks = Array.from({ length: 81 }, (_, i) => {
    const isMajor = i % 10 === 0;
    const isMedium = i % 5 === 0 && !isMajor;
    return { id: i, isMajor, isMedium };
  });

  return (
    <div className="relative py-12 md:py-16 bg-gradient-to-b from-[#0a0a0d] via-[#0d0e14] to-[#0a0b10] overflow-hidden select-none border-y border-white/[0.06]">
      {/* Subtle ambient golden lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-8 bg-gold/[0.06] blur-2xl pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center">
        {/* Top subtle timecode badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-gold/40" />
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
            <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.25em] text-gold uppercase font-bold">
              {label}
            </span>
          </div>
          <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-gold/40" />
        </div>

        {/* ═══ THE CINEMATIC STUDIO RULER / SCALE ═══ */}
        <div className="w-full relative px-2 sm:px-6 py-3 rounded-2xl bg-[#11131a]/80 border border-gold/25 shadow-[0_8px_30px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-md">
          {/* Top ruler edge with metallic golden gradient */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gold/80 to-transparent shadow-[0_0_8px_rgba(212,175,55,0.5)]" />

          {/* Precision Ruler Hash Marks */}
          <div className="flex items-start justify-between w-full pt-1.5 pb-2 px-1">
            {ticks.map((tick) => {
              if (tick.isMajor) {
                return (
                  <div key={tick.id} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-[1.5px] h-4.5 sm:h-5 bg-gradient-to-b from-gold via-amber-300 to-gold/40 shadow-[0_0_4px_rgba(212,175,55,0.6)]" />
                    <span className="text-[7px] sm:text-[8px] font-mono text-gold/80 font-bold hidden sm:inline-block">
                      {String(tick.id * 10).padStart(3, '0')}
                    </span>
                  </div>
                );
              }
              if (tick.isMedium) {
                return (
                  <div key={tick.id} className="flex flex-col items-center flex-1">
                    <div className="w-[1px] h-3 sm:h-3.5 bg-amber-400/50" />
                  </div>
                );
              }
              return (
                <div key={tick.id} className="flex flex-col items-center flex-1">
                  <div className="w-[1px] h-1.5 sm:h-2 bg-white/20" />
                </div>
              );
            })}
          </div>

          {/* Central Precision Diamond Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
            <div className="w-3.5 h-3.5 rotate-45 bg-gradient-to-br from-amber-200 via-gold to-yellow-600 border border-black shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
            <div className="w-[1.5px] h-5 bg-gold/90 shadow-[0_0_6px_rgba(212,175,55,0.9)]" />
          </div>

          {/* Bottom baseline */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Sub-label */}
        <span className="text-[9px] font-mono tracking-[0.2em] text-zinc-500 uppercase mt-2.5">
          {subLabel}
        </span>
      </div>
    </div>
  );
};
