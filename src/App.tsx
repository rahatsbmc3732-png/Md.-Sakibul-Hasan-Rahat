import React, { useState, useEffect } from 'react';
import { ParticleCanvas } from './components/ParticleCanvas';
import { CursorManager } from './components/CursorManager';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SelectedProjects } from './components/SelectedProjects';
import { CinematicRulerDivider } from './components/CinematicRulerDivider';
import { GraphicDesignShowcase } from './components/GraphicDesignShowcase';
import { ContactSection } from './components/ContactSection';
import { StudioEditorPro } from './components/StudioEditorPro';
import { MasterSiteEditorModal } from './components/MasterSiteEditorModal';
import { Footer } from './components/Footer';
import {
  fetchSiteDataFromServer,
  recoverAndSyncIndexedDBMedia,
} from './utils/apiSync';
import {
  Move,
  Check,
  Eye,
  ShieldCheck,
  Lock,
  Unlock,
  X,
  Camera,
  Video,
  Upload,
  Sparkles,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<'EN' | 'BN'>('EN');
  const [particleSpeed, setParticleSpeed] = useState<number>(1.0);
  const [activeTheme, setActiveTheme] = useState<string>('award-dark');
  const [isCustomizeMode, setIsCustomizeMode] = useState<boolean>(false);
  const [portfolioChapter, setPortfolioChapter] = useState<'video' | 'design'>('video');

  // ═════════════════════════════════════════════════════════════════════════
  // SECURE OWNER MODE vs AUDIENCE MODE (সাকিবুল হাসান রাহাতের সিকিউর অ্যাক্সেস)
  // সাধারণ দর্শক বা অডিয়েন্সের জন্য সম্পূর্ণ লকড ভিউ (কোনো এডিট/ডিলিট অপশন থাকবে না)।
  // ওনার সাকিবুল হাসান রাহাত পিন (1234) বা গোপন লিঙ্ক দিয়ে আনলক করে এডিট করতে পারবেন।
  // ═════════════════════════════════════════════════════════════════════════
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.toLowerCase();
        const search = window.location.search.toLowerCase();
        if (hash === '#owner' || hash === '#admin' || search.includes('owner=true') || search.includes('admin=rahat')) {
          localStorage.setItem('rahat_owner_auth', 'true');
          sessionStorage.removeItem('rahat_session_locked');
          return true;
        }
        const sessionLocked = sessionStorage.getItem('rahat_session_locked') === 'true';
        if (sessionLocked) {
          return false;
        }
        // Remembered owner authentication on this specific device/browser
        return localStorage.getItem('rahat_owner_auth') === 'true';
      }
    } catch {}
    return false;
  });

  const [viewMode, setViewMode] = useState<'audience' | 'owner'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.toLowerCase();
        const search = window.location.search.toLowerCase();
        if (hash === '#owner' || hash === '#admin' || search.includes('owner=true') || search.includes('admin=rahat')) {
          return 'owner';
        }
        const sessionLocked = sessionStorage.getItem('rahat_session_locked') === 'true';
        if (sessionLocked) return 'audience';
        const isAuth = localStorage.getItem('rahat_owner_auth') === 'true';
        const saved = localStorage.getItem('rahat_view_mode');
        if (isAuth && saved === 'owner') return 'owner';
        if (isAuth && !saved) return 'owner';
        return 'audience';
      }
    } catch {}
    return 'audience';
  });

  const [isOwnerLoginModalOpen, setIsOwnerLoginModalOpen] = useState(false);
  const [isMasterEditorOpen, setIsMasterEditorOpen] = useState(false);
  const [ownerPasscode, setOwnerPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Desktop View Mode auto-scaling for mobile devices & iframes narrower than 1200px
  // মোবাইলে যাতে ডেস্কটপ মোডের মতো হুবহু সব লেআউট ও ভিডিও দেখা যায়
  const [scaleRatio, setScaleRatio] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1200) {
      return window.innerWidth / 1200;
    }
    return 1;
  });

  useEffect(() => {
    const computeScale = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width < 1200) {
          setScaleRatio(width / 1200);
        } else {
          setScaleRatio(1);
        }
      }
    };
    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, []);

  // Initial Server Fetch & IndexedDB Media Recovery
  useEffect(() => {
    fetchSiteDataFromServer().then(async (serverData) => {
      if (serverData) {
        window.dispatchEvent(new CustomEvent('rahat:data-synced-from-server', { detail: serverData }));
      }
      try {
        const recovered = await recoverAndSyncIndexedDBMedia();
        if (Object.keys(recovered).length > 0) {
          window.dispatchEvent(new CustomEvent('rahat:media-recovered-from-db', { detail: recovered }));
        }
      } catch (err) {
        console.warn('IndexedDB media recovery error:', err);
      }
    });
  }, []);

  // Shortcut key listener (Ctrl + Shift + O) or URL hash change
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + O or Alt + O toggles/opens owner portal
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'o') || (e.altKey && e.key.toLowerCase() === 'o')) {
        e.preventDefault();
        if (isOwnerAuthenticated) {
          setViewMode((prev) => (prev === 'owner' ? 'audience' : 'owner'));
        } else {
          setIsOwnerLoginModalOpen(true);
        }
      }
    };

    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#owner' || hash === '#admin') {
        setIsOwnerAuthenticated(true);
        setViewMode('owner');
        try {
          sessionStorage.removeItem('rahat_session_locked');
          localStorage.setItem('rahat_owner_auth', 'true');
          localStorage.setItem('rahat_view_mode', 'owner');
        } catch {}
      }
    };

    const handleOpenStudio = () => setIsMasterEditorOpen(true);
    window.addEventListener('rahat:open-studio-editor', handleOpenStudio);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('rahat:open-studio-editor', handleOpenStudio);
    };
  }, [isOwnerAuthenticated]);

  const handleUnlockOwner = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pin = ownerPasscode.trim();
    if (pin === '1234' || pin === 'rahat' || pin === 'admin' || pin === 'sakib') {
      setIsOwnerAuthenticated(true);
      setViewMode('owner');
      try {
        sessionStorage.removeItem('rahat_session_locked');
        localStorage.setItem('rahat_owner_auth', 'true');
        localStorage.setItem('rahat_view_mode', 'owner');
      } catch {}
      setIsOwnerLoginModalOpen(false);
      setOwnerPasscode('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogoutOwner = () => {
    // Lock owner controls for audience/public view
    setIsOwnerAuthenticated(false);
    setViewMode('audience');
    setIsCustomizeMode(false);
    try {
      sessionStorage.setItem('rahat_session_locked', 'true');
      localStorage.setItem('rahat_view_mode', 'audience');
      localStorage.removeItem('rahat_owner_auth');
    } catch {}
  };

  const handleToggleAudiencePreview = () => {
    const next = viewMode === 'owner' ? 'audience' : 'owner';
    setViewMode(next);
    try {
      localStorage.setItem('rahat_view_mode', next);
    } catch {}
    if (next === 'audience') {
      setIsCustomizeMode(false);
    }
  };

  const triggerChangePhoto = () => {
    window.dispatchEvent(new CustomEvent('rahat:open-photo-modal'));
  };

  const triggerUploadVideo = () => {
    setPortfolioChapter('video');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('rahat:open-upload-video-modal'));
    }, 100);
  };

  const triggerUploadGraphic = () => {
    setPortfolioChapter('design');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('rahat:open-upload-graphic-modal'));
    }, 100);
  };

  const handleResetAllLayouts = () => {
    localStorage.removeItem('rahat_video_saas_anim_v1');
    localStorage.removeItem('rahat_video_order_anim_v3');
    localStorage.removeItem('rahat_video_order_pod_v3');
    localStorage.removeItem('rahat_video_order_ai_v3');
    localStorage.removeItem('rahat_video_order_reels_v3');
    localStorage.removeItem('rahat_portfolio_graphic_designs_v2');
    window.location.reload();
  };

  // Determine if owner controls should be visible:
  // ONLY if owner is authenticated AND viewMode is 'owner'
  const isOwnerActive = isOwnerAuthenticated && viewMode === 'owner';

  const isScaled = scaleRatio < 1;

  return (
    <div
      style={
        isScaled
          ? ({
              width: '1200px',
              minWidth: '1200px',
              zoom: scaleRatio,
            } as React.CSSProperties)
          : undefined
      }
      className={`relative min-h-screen bg-[#0a0a0a] text-[#e5e5e5] ${
        isScaled ? 'w-[1200px] min-w-[1200px]' : 'w-full'
      } overflow-x-hidden selection:bg-gold selection:text-black theme-${activeTheme}`}
    >
      {/* Interactive Golden Ambient Particle Canvas (Subtle refined micro-sparkles) */}
      <ParticleCanvas speedMultiplier={particleSpeed} />

      {/* Interactive Luxury Gold Cursor Glow (Subtle & minimal) & Pointer Manager */}
      <CursorManager />

      {/* Top Navbar */}
      <Navbar
        lang={lang}
        setLang={setLang}
        activeChapter={portfolioChapter}
        onSelectChapter={setPortfolioChapter}
        viewMode={viewMode}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          TOP OWNER CONTROL BAR (শুধুমাত্র ওনারের সামনে আসবে, দর্শকদের সামনে কখনোই নয়)
          সহজে প্রোফাইল ছবি বদলানো, নতুন ভিডিও ও গ্রাফিক্স আপলোডের বাটন
          ═══════════════════════════════════════════════════════════════════════ */}
      {isOwnerActive && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-4xl p-2 rounded-2xl bg-[#11131c]/95 border border-amber-400/50 shadow-[0_10px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(251,191,36,0.2)] backdrop-blur-2xl flex flex-wrap items-center justify-between gap-2 animate-fade-in select-none">
          {/* Left: Owner Active Badge */}
          <div className="flex items-center gap-2 pl-2">
            <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-xs shadow-md">
              <ShieldCheck size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-amber-300 leading-tight">
                {lang === 'EN' ? 'Owner Admin Mode' : 'ওনার মোড চালু আছে'}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 leading-none">
                MD Sakibul Hasan Rahat
              </span>
            </div>
          </div>

          {/* Center: Direct Quick Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* 1. Change Photo Button */}
            <button
              type="button"
              onClick={triggerChangePhoto}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-black text-amber-200 border border-white/15 text-xs font-mono font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title={lang === 'EN' ? 'Change Profile Photo' : 'প্রোফাইল ছবি পরিবর্তন করুন'}
            >
              <Camera size={13} />
              <span>{lang === 'EN' ? 'Change Photo' : 'ছবি পরিবর্তন'}</span>
            </button>

            {/* 2. Upload Video Button */}
            <button
              type="button"
              onClick={triggerUploadVideo}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-cyan-400 hover:text-black text-cyan-200 border border-white/15 text-xs font-mono font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title={lang === 'EN' ? 'Upload New Video to Portfolio' : 'নতুন ভিডিও আপলোড করুন'}
            >
              <Video size={13} />
              <span>{lang === 'EN' ? '+ Upload Video' : '+ ভিডিও আপলোড'}</span>
            </button>

            {/* 3. Upload Graphic Button */}
            <button
              type="button"
              onClick={triggerUploadGraphic}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-400 hover:text-black text-rose-200 border border-white/15 text-xs font-mono font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
              title={lang === 'EN' ? 'Upload Graphic Design' : 'নতুন গ্রাফিক্স ডিজাইন আপলোড'}
            >
              <Sparkles size={13} />
              <span>{lang === 'EN' ? '+ Upload Graphic' : '+ গ্রাফিক্স আপলোড'}</span>
            </button>

            {/* 4. Complete Website Customizer Button */}
            <button
              type="button"
              onClick={() => setIsMasterEditorOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-black border border-amber-300 text-xs font-mono font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.35)] click-bounce"
              title={lang === 'EN' ? 'Open Complete Site Settings & Customizer' : 'সম্পূর্ণ ওয়েবসাইট সেটিংস ও কাস্টমাইজার'}
            >
              <SlidersHorizontal size={13} />
              <span>{lang === 'EN' ? 'Site Customizer' : 'সম্পূর্ণ এডিটর ⚙️'}</span>
            </button>
          </div>

          {/* Right: Preview as Audience & Lock for Public */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleAudiencePreview}
              className="px-2.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/40 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1"
              title={lang === 'EN' ? 'Preview what visitors see without admin buttons' : 'দর্শকরা ওয়েবসাইটটি ঠিক কেমন দেখবে তা দেখুন'}
            >
              <Eye size={13} />
              <span>{lang === 'EN' ? 'Audience View' : 'অডিয়েন্স ভিউ'}</span>
            </button>

            <button
              type="button"
              onClick={handleLogoutOwner}
              className="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1"
              title={lang === 'EN' ? 'Lock site for visitors when published' : 'পাবলিশ করার পর দর্শকদের জন্য লক করুন'}
            >
              <Lock size={12} />
              <span>{lang === 'EN' ? 'Lock for Public' : 'লক করুন'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          AUDIENCE PREVIEW / OWNER RE-ENTRY FLOATING PILL
          দর্শকরা যখন ওয়েবসাইটে থাকবে তখন সহজে ওনার মোড চালু করতে পারবেন
          ═══════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'audience' && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={() => {
              if (isOwnerAuthenticated) {
                setViewMode('owner');
              } else {
                setIsOwnerLoginModalOpen(true);
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-mono font-bold bg-[#12141e]/95 hover:bg-amber-400 hover:text-black text-amber-300 border border-amber-400/50 shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_15px_rgba(251,191,36,0.25)] backdrop-blur-md transition-all cursor-pointer group click-bounce"
            title={lang === 'EN' ? 'Click to open Owner Edit Mode' : 'ওনার এডিট মোড চালু করতে ক্লিক করুন'}
          >
            <ShieldCheck size={14} className="text-amber-400 group-hover:text-black transition-colors" />
            <span>{lang === 'EN' ? 'Owner Edit Mode' : 'ওনার এডিট মোড 🔐'}</span>
          </button>
        </div>
      )}

      {/* Top Sticky Bar when Customize & Drag Mode is ON (Only in Owner View) */}
      {isOwnerActive && isCustomizeMode && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-amber-400 text-black font-mono text-xs font-bold shadow-[0_10px_35px_rgba(251,191,36,0.6)] flex items-center gap-3 backdrop-blur-md animate-bounce border-2 border-white/60">
          <div className="flex items-center gap-1.5">
            <Move size={14} className="animate-spin" />
            <span>
              {lang === 'EN'
                ? '🎯 Drag & Customize Mode Active — Grab video or graphic cards to reorder'
                : '🎯 কাস্টমাইজ মোড চালু রয়েছে — মাউস দিয়ে টেনে ভিডিও ও গ্রাফিক্স সাজিয়ে নিন'}
            </span>
          </div>
          <button
            onClick={() => setIsCustomizeMode(false)}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black text-amber-300 hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <Check size={12} />
            <span>{lang === 'EN' ? 'Done' : 'সম্পন্ন'}</span>
          </button>
        </div>
      )}

      {/* Main Content Sections */}
      <main className="relative z-10">
        {/* 1. Hero with Big Display Typography MD SAKIBUL HASAN RAHAT */}
        <Hero lang={lang} isOwner={isOwnerActive} />

        {/* 2. Portfolio Chapter (ভিডিও প্রজেক্ট অথবা গ্রাফিক্স ডিজাইন - ক্লিকে তাৎক্ষণিক পরিবর্তন) */}
        {portfolioChapter === 'video' ? (
          <SelectedProjects
            lang={lang}
            isCustomizeMode={isOwnerActive ? isCustomizeMode : false}
            setIsCustomizeMode={setIsCustomizeMode}
            activeChapter={portfolioChapter}
            setActiveChapter={setPortfolioChapter}
            viewMode={isOwnerActive ? 'owner' : 'audience'}
          />
        ) : (
          <GraphicDesignShowcase
            lang={lang}
            isCustomizeMode={isOwnerActive ? isCustomizeMode : false}
            setIsCustomizeMode={setIsCustomizeMode}
            activeChapter={portfolioChapter}
            setActiveChapter={setPortfolioChapter}
            viewMode={isOwnerActive ? 'owner' : 'audience'}
          />
        )}

        {/* 8. Direct Contact & Collaboration Section */}
        <ContactSection lang={lang} />
      </main>

      {/* Floating Studio Editor Pro & Master Customization Engine (Only visible in Owner View) */}
      {isOwnerActive && (
        <StudioEditorPro
          particleSpeed={particleSpeed}
          setParticleSpeed={setParticleSpeed}
          activeTheme={activeTheme}
          setActiveTheme={setActiveTheme}
          isCustomizeMode={isCustomizeMode}
          setIsCustomizeMode={setIsCustomizeMode}
          onResetAllLayouts={handleResetAllLayouts}
        />
      )}

      {/* Master Site Customizer Modal (সম্পূর্ণ ওয়েবসাইট এডিটর) */}
      <MasterSiteEditorModal
        isOpen={isMasterEditorOpen}
        onClose={() => setIsMasterEditorOpen(false)}
        lang={lang}
        onOpenPhotoModal={triggerChangePhoto}
        onLockOwner={handleLogoutOwner}
      />

      {/* Footer with Discreet Owner Access Trigger */}
      <Footer
        lang={lang}
        isOwner={isOwnerActive}
        onOpenOwnerLogin={() => setIsOwnerLoginModalOpen(true)}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          DISCREET OWNER ACCESS MODAL (সাকিবুল হাসান রাহাতের গোপন ওনার পোর্টাল)
          সহজে ১ ক্লিকে ওনার মোড আনলক করার ব্যবস্থা
          ═══════════════════════════════════════════════════════════════════════ */}
      {isOwnerLoginModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setIsOwnerLoginModalOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-[#11131c] border border-amber-400/50 shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(251,191,36,0.25)] p-5 sm:p-6 flex flex-col gap-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow">
                  <Lock size={16} />
                </div>
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-white">
                    {lang === 'EN' ? 'Owner Access Portal' : 'ওনার ভিউ আনলক'}
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-400">
                    MD Sakibul Hasan Rahat
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOwnerLoginModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {lang === 'EN'
                ? 'Unlock full editing controls to change profile photo, replace videos, upload new works, and customize graphic designs.'
                : 'প্রোফাইল ছবি পরিবর্তন, ভিডিও আপলোড/বদলানো এবং গ্রাফিক্স ডিজাইন পরিবর্তনের জন্য ওনার মোড আনলক করুন।'}
            </p>

            {/* Form */}
            <form onSubmit={handleUnlockOwner} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-300 mb-1">
                  {lang === 'EN' ? 'Passcode (Optional, default 1234)' : 'পাসকোড (ঐচ্ছিক, ডিফল্ট ১২৩৪)'}
                </label>
                <input
                  type="password"
                  value={ownerPasscode}
                  onChange={(e) => {
                    setOwnerPasscode(e.target.value);
                    setLoginError(false);
                  }}
                  placeholder="1234"
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-mono outline-none"
                />
                {loginError && (
                  <p className="text-[10px] text-red-400 mt-1 font-mono">
                    {lang === 'EN' ? 'Invalid passcode. Default is 1234.' : 'ভুল পাসকোড। ডিফল্ট ১২৩৪ দিন।'}
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsOwnerLoginModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  {lang === 'EN' ? 'Cancel' : 'বাতিল'}
                </button>

                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(251,191,36,0.35)] flex items-center justify-center gap-1.5 cursor-pointer click-bounce"
                >
                  <Unlock size={14} />
                  <span>{lang === 'EN' ? 'Unlock Owner Mode' : 'ওনার মোড আনলক করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
