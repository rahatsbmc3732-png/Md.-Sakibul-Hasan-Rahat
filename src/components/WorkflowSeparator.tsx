import React from 'react';

export const WorkflowSeparator: React.FC = () => {
  return (
    <div
      id="workflow-transition-separator"
      className="relative w-full overflow-hidden py-4 sm:py-6 bg-gradient-to-b from-transparent via-[#0d0e12]/80 to-[#0a0a0c] select-none pointer-events-none z-20 flex flex-col items-center justify-center"
      aria-hidden="true"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-4xl h-8 bg-gold/[0.03] blur-xl rounded-full pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-center">
        <svg
          viewBox="0 0 1200 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-10 sm:h-12 md:h-14 overflow-visible opacity-90"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="wfGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
              <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="wfGradRight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#D4AF37" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="centerDiamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF275" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#997A15" />
            </linearGradient>
          </defs>

          {/* Left waveform / audio sync lines */}
          <path d="M0 32 L460 32" stroke="url(#wfGradLeft)" strokeWidth="1.5" />
          <path d="M220 32 L260 22 L280 42 L300 18 L320 46 L340 24 L360 40 L380 26 L400 38 L420 28 L440 34 L460 32" stroke="#D4AF37" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
          
          {/* Central Timecode Diamond & Film Reel node */}
          <g transform="translate(600, 32)">
            <circle cx="0" cy="0" r="16" fill="#0A0A0C" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="10" fill="#141416" stroke="#D4AF37" strokeWidth="1.5" />
            <polygon points="0,-6 6,0 0,6 -6,0" fill="url(#centerDiamondGrad)" />
          </g>

          {/* Right waveform */}
          <path d="M740 32 L1200 32" stroke="url(#wfGradRight)" strokeWidth="1.5" />
          <path d="M740 32 L760 26 L780 40 L800 24 L820 44 L840 20 L860 42 L880 22 L900 38 L920 28 L940 34 L980 32" stroke="#D4AF37" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
        </svg>
      </div>
    </div>
  );
};
