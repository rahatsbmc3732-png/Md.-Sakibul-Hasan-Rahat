import React, { useState, useEffect } from 'react';
import { Share2, Check } from 'lucide-react';

interface NavbarProps {
  lang: 'EN' | 'BN';
  setLang: (l: 'EN' | 'BN') => void;
  activeChapter?: 'video' | 'design';
  onSelectChapter?: (chapter: 'video' | 'design') => void;
  viewMode?: 'audience' | 'owner';
  setViewMode?: (mode: 'audience' | 'owner') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  activeChapter,
  onSelectChapter,
  viewMode = 'audience',
  setViewMode,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const portfolioUrl = 'https://sakibulhasanrahat.vercel.app';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(portfolioUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const scrollPos = window.scrollY + window.innerHeight / 3;
      const sections = ['home', 'featured-video', 'projects', 'graphic-design', 'contact'];
      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sec);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: lang === 'EN' ? 'Home' : 'হোম', href: '#home', id: 'home' },
    { name: lang === 'EN' ? 'Featured' : 'ফিচার্ড', href: '#featured-video', id: 'featured-video' },
    { name: lang === 'EN' ? 'Videos' : 'ভিডিও', href: '#projects', id: 'projects' },
    { name: lang === 'EN' ? 'Graphics' : 'গ্রাফিক্স', href: '#graphic-design', id: 'graphic-design' },
    { name: lang === 'EN' ? 'Contact' : 'যোগাযোগ', href: '#contact', id: 'contact' },
  ];

  return (
    <>
      <div
        className={`absolute top-4 sm:top-6 inset-x-0 z-50 px-4 sm:px-8 transition-all duration-300 ${
          scrolled ? 'opacity-0 pointer-events-none -translate-y-6' : 'opacity-100'
        }`}
      >
        <header className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex items-center justify-between">
          {/* Zone 1: Navigation Links - Clean desktop links always visible */}
          <nav className="flex items-center gap-6 lg:gap-8">
            <div className="flex items-center gap-5 lg:gap-7">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => {
                    if (link.id === 'projects') onSelectChapter?.('video');
                    if (link.id === 'graphic-design') onSelectChapter?.('design');
                  }}
                  className={`text-[13px] font-bold tracking-wide transition-all duration-200 click-bounce ${
                    activeSection === link.id
                      ? 'text-white font-extrabold drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)] scale-105'
                      : 'text-zinc-300 hover:text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </nav>

          {/* Zone 3: Actions - Language toggle & Share link */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Share / Copy Portfolio Link */}
            <button
              onClick={handleCopyLink}
              className="px-2 py-1 text-[11px] font-mono text-zinc-300 hover:text-gold transition-colors duration-200 flex items-center gap-1.5 cursor-pointer click-bounce drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              title="Copy portfolio link: sakibulhasanrahat.vercel.app"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {lang === 'EN' ? 'Link Copied!' : 'কপি হয়েছে!'}
                  </span>
                </>
              ) : (
                <>
                  <Share2 size={12} />
                  <span className="inline text-[10px]">sakibulhasanrahat</span>
                </>
              )}
            </button>

            {/* Language Switch */}
            <button
              onClick={() => setLang(lang === 'EN' ? 'BN' : 'EN')}
              className="px-2 py-1 text-[11px] font-mono font-bold text-zinc-300 hover:text-gold transition-colors cursor-pointer drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              title="Toggle Language / ভাষা পরিবর্তন"
            >
              {lang === 'EN' ? 'বাং' : 'EN'}
            </button>
          </div>
        </header>
      </div>
    </>
  );
};
