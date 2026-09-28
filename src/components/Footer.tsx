import React from 'react';
import { ArrowUp, Lock, ShieldCheck } from 'lucide-react';

interface FooterProps {
  lang: 'EN' | 'BN';
  isOwner?: boolean;
  onOpenOwnerLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, isOwner, onOpenOwnerLogin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-6 px-4 sm:px-8 bg-charcoal border-t border-glass-border relative overflow-hidden select-none flex flex-col sm:flex-row justify-between items-center gap-4">
      {/* Copyright */}
      <div className="text-[11px] font-mono text-zinc-500 text-center sm:text-left">
        © {new Date().getFullYear()} MD Sakibul Hasan Rahat. All rights reserved.
      </div>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        title="Back to Top"
        className="p-2.5 rounded-full bg-white/5 hover:bg-gold hover:text-black text-zinc-300 transition-all duration-300 border border-white/10 hover:border-gold cursor-pointer click-bounce"
      >
        <ArrowUp size={16} />
      </button>

      {/* Discreet Owner Portal Trigger (Unobtrusive & invisible to regular audience) */}
      <div className="flex items-center">
        {onOpenOwnerLogin && (
          <button
            type="button"
            onClick={onOpenOwnerLogin}
            className="text-[10px] font-mono text-zinc-600/80 hover:text-amber-400/90 transition-colors flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded hover:bg-white/5"
            title={lang === 'EN' ? 'Owner Access Portal' : 'ওনার ভিউ পোর্টাল'}
          >
            {isOwner ? (
              <>
                <ShieldCheck size={11} className="text-amber-400" />
                <span className="text-amber-400/80">Owner Active</span>
              </>
            ) : (
              <>
                <Lock size={10} className="opacity-60 hover:opacity-100" />
                <span className="opacity-0 hover:opacity-100 transition-opacity">Owner</span>
              </>
            )}
          </button>
        )}
      </div>
    </footer>
  );
};
