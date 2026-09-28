import React, { useState, useRef } from 'react';
import { SOFTWARE_TOOLS } from '../data/portfolioData';
import { ArrowRight, Orbit } from 'lucide-react';

interface AboutMeProps {
  lang: 'EN' | 'BN';
}

export const AboutMe: React.FC<AboutMeProps> = ({ lang }) => {
  const [katanaActive, setKatanaActive] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterCard = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const handleMouseLeaveCard = () => {
    leaveTimerRef.current = setTimeout(() => {
      setKatanaActive(false);
    }, 400);
  };

  const orbitRadius = katanaActive ? 180 : 140;

  return (
    <section
      id="about"
      className="relative z-10 py-20 sm:py-28 md:py-32 bg-transparent border-b border-glass-border overflow-visible"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/[0.02] blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        <div
          id="about-card"
          onMouseEnter={handleMouseEnterCard}
          onMouseLeave={handleMouseLeaveCard}
          className={`relative rounded-3xl border border-glass-border bg-gradient-to-b from-[#181920]/95 via-[#13141a]/95 to-[#0e0f14]/95 backdrop-blur-2xl p-6 sm:p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700 ease-out flex flex-col items-center group overflow-hidden ${
            katanaActive ? 'border-gold/60 shadow-[0_0_60px_rgba(212,175,55,0.25)]' : ''
          }`}
        >
          {/* Moving border light beam traveling continuously around the 4 sides of the box */}
          <div
            className="absolute inset-[-120%] pointer-events-none animate-rect-beam-slow"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(212,175,55,0.2) 300deg, #d4af37 335deg, #ffffff 350deg, #d4af37 358deg, transparent 360deg)',
            }}
          />

          {/* Fluid ambient glows */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute w-[300px] h-[300px] rounded-full bg-gold/10 blur-[80px] -top-20 -left-20 animate-liquid-flow" />
            <div className="absolute w-[300px] h-[300px] rounded-full bg-[#FFDF00]/10 blur-[80px] -bottom-20 -right-20 animate-liquid-flow-reverse" />
          </div>

          {/* Top Tools Toggle Button */}
          <div className="absolute -top-[20px] left-8 sm:left-12 bg-[#121212] border border-glass-border rounded-full px-4 py-1 flex items-center z-10">
            <button
              onClick={() => setKatanaActive(!katanaActive)}
              className={`text-[11px] font-mono tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                katanaActive
                  ? 'text-gold font-bold drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>{katanaActive ? '✦ Software Stack Active' : '✦ Hover / Tap for Software Stack'}</span>
            </button>
          </div>

          <div
            className={`relative z-10 flex flex-col items-center w-full transition-all duration-700 ease-out ${
              katanaActive ? 'justify-center py-6 min-h-[480px]' : 'lg:flex-row gap-10 lg:gap-14'
            }`}
          >
            {/* Left: Avatar with Orbit */}
            <div
              className={`flex flex-col items-center transition-all duration-700 ease-out ${
                katanaActive ? 'w-full py-4' : 'flex-shrink-0'
              }`}
            >
              <div
                onMouseEnter={() => setKatanaActive(true)}
                onTouchStart={() => setKatanaActive((prev) => !prev)}
                onClick={() => setKatanaActive((prev) => !prev)}
                title="Click or hover to toggle software showcase"
                className={`relative flex items-center justify-center cursor-pointer select-none group transition-all duration-700 ease-out ${
                  katanaActive
                    ? 'w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] md:w-[460px] md:h-[460px]'
                    : 'w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[340px] md:h-[340px]'
                }`}
              >
                {/* Glow backdrop */}
                <div
                  className={`absolute rounded-full transition-all duration-700 pointer-events-none ${
                    katanaActive
                      ? 'w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] bg-gradient-to-tr from-gold via-amber-500 to-[#FFDF00] opacity-80 blur-3xl scale-110'
                      : 'w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] md:w-[240px] md:h-[240px] bg-gold/20 opacity-30 blur-md scale-95'
                  }`}
                />

                {/* Central circular container with exact unedited original photo */}
                <div
                  className={`relative rounded-full border-2 overflow-hidden bg-[#181920] flex items-center justify-center transition-all duration-700 ease-out z-20 will-change-transform shadow-[0_10px_35px_rgba(0,0,0,0.6)] ${
                    katanaActive
                      ? 'w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] md:w-[290px] md:h-[290px] border-[#FFDF00] shadow-[0_0_60px_rgba(255,223,0,0.85),0_0_100px_rgba(212,175,55,0.4)] scale-105'
                      : 'w-[190px] h-[190px] sm:w-[230px] sm:h-[230px] md:w-[250px] md:h-[250px] border-gold/60 shadow-[0_0_25px_rgba(212,175,55,0.25)]'
                  }`}
                >
                  {/* Sakibul Hasan Rahat - Exact Original Photo (No modification, pristine) */}
                  <img
                    src="/images/rahat_original.jpg"
                    alt="MD Sakibul Hasan Rahat"
                    className="w-full h-full object-cover object-top rounded-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Orbiting Software Icons */}
                <div
                  className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-700 ease-out ${
                    katanaActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                  }`}
                >
                  <div
                    style={{ width: `${orbitRadius * 2}px`, height: `${orbitRadius * 2}px` }}
                    className="absolute rounded-full border border-gold/30 shadow-[0_0_30px_rgba(212,175,55,0.2)] pointer-events-none"
                  />

                  <div className="w-full h-full absolute flex items-center justify-center animate-orbit">
                    {SOFTWARE_TOOLS.map((tool) => {
                      const rad = (tool.angle * Math.PI) / 180;
                      const x = Math.round(orbitRadius * Math.cos(rad));
                      const y = Math.round(orbitRadius * Math.sin(rad));

                      return (
                        <div
                          key={tool.name}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                          }}
                          className="pointer-events-auto"
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setActiveTooltip(tool.desc);
                          }}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <div
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border flex items-center justify-center shadow-lg cursor-pointer transition-transform duration-200 hover:scale-125"
                            style={{
                              borderColor: `${tool.stroke}80`,
                              backgroundColor: tool.fill,
                              boxShadow: `0 4px 15px ${tool.stroke}50`,
                            }}
                          >
                            <div className="w-full h-full flex items-center justify-center animate-orbit-icon p-1">
                              {tool.isCustom && tool.imgSrc ? (
                                <img
                                  src={tool.imgSrc}
                                  alt={tool.name}
                                  className="w-full h-full object-contain rounded-xl"
                                />
                              ) : (
                                <span
                                  className="font-mono font-black text-xs"
                                  style={{ color: tool.stroke }}
                                >
                                  {tool.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tooltip display */}
              <div className="mt-3 flex flex-col items-center gap-1 z-20 h-6">
                {activeTooltip ? (
                  <span className="text-[11px] font-mono text-gold-glow animate-fade-in tracking-wide">
                    ✦ {activeTooltip}
                  </span>
                ) : (
                  <span className="text-[11px] text-zinc-400 font-mono tracking-wider">
                    {katanaActive
                      ? 'Hover rotating icons to inspect software tools'
                      : 'Hover or tap photo to inspect software ecosystem'}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Bio and Stats */}
            {!katanaActive && (
              <div className="relative z-10 flex-grow space-y-6 text-left">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-glow font-mono block">
                    {lang === 'EN' ? 'THE CREATIVE STORY' : 'আমার পরিচয়'}
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight text-white">
                    {lang === 'EN' ? "Hello, I'm Rahat." : 'আমি রাহাত।'}
                  </h2>
                </div>

                <div className="space-y-4 text-zinc-300 leading-relaxed text-sm sm:text-base font-sans">
                  <p>
                    {lang === 'EN'
                      ? 'I specialize in creating premium cinematic visuals for brands that dare to stand out. With deep experience in commercial directing and cutting-edge post-production, I bridge the gap between artistic storytelling and algorithmic audience retention.'
                      : 'আমি ব্র্যান্ডগুলোর জন্য তৈরি করি প্রিমিয়াম সিনেমাটিক ভিজ্যুয়াল। কমার্শিয়াল ডিরেকশন ও পোস্ট-প্রোডাকশনের মাধ্যমে ক্লাসিক আর্ট ও সোশ্যাল মিডিয়া রিটেনশনের মাঝে সেতুবন্ধন গড়ি।'}
                  </p>
                  <p>
                    {lang === 'EN'
                      ? 'Beyond standard editing, I engineer full creative pipelines—combining cinema-grade visual pacing in After Effects & Premiere Pro with generative AI tools like FlowAI, Gemini, and ChatGPT to craft high-velocity, scroll-stopping digital media.'
                      : 'শুধু সাধারণ ভিডিও এডিটিং নয়, বরং আফটার ইফেক্টস ও প্রিমিয়ার প্রোর সাথে FlowAI, Gemini এবং ChatGPT এর মত এআই টুলস ব্যবহার করে আকর্ষণীয় ডিজিটাল কনটেন্ট বানাই।'}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-glass-border">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-colors">
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-gold block">
                      4+
                    </span>
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest block mt-0.5">
                      {lang === 'EN' ? 'Months Exp' : 'মাসের অভিজ্ঞতা'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-colors">
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-gold block">
                      15+
                    </span>
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest block mt-0.5">
                      {lang === 'EN' ? 'Videos Edited' : 'ভিডিও এডিটিং'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-colors">
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-gold block">
                      20+
                    </span>
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest block mt-0.5">
                      {lang === 'EN' ? 'Audio & AI Flows' : 'অডিও ও এআই ফ্লো'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-colors">
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-gold block">
                      98%
                    </span>
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest block mt-0.5">
                      {lang === 'EN' ? 'Retention Rate' : 'রিটেনশন রেট'}
                    </span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <a
                    href="#projects"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold/15 hover:bg-gold text-gold hover:text-black font-semibold text-xs font-mono tracking-wider uppercase border border-gold/40 hover:border-gold shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 click-bounce"
                  >
                    <span>{lang === 'EN' ? 'Explore Projects' : 'প্রজেক্ট দেখুন'}</span>
                    <ArrowRight size={14} />
                  </a>

                  <button
                    onClick={() => setKatanaActive(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium text-xs font-mono border border-white/10 hover:border-gold/40 transition-all cursor-pointer click-bounce"
                  >
                    <Orbit size={14} className="text-gold" />
                    <span>{lang === 'EN' ? 'Software Orbit' : 'সফটওয়্যার স্ট্যাক'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
