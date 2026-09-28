import React, { useState, useEffect } from 'react';
import { SOCIAL_LINKS } from '../data/portfolioData';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { getSiteContent, SiteContent } from '../utils/siteContent';

interface ContactSectionProps {
  lang: 'EN' | 'BN';
}

export const ContactSection: React.FC<ContactSectionProps> = ({ lang }) => {
  const [siteData, setSiteData] = useState<SiteContent>(getSiteContent());

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteContent>;
      if (customEvent.detail) {
        setSiteData(customEvent.detail);
      } else {
        setSiteData(getSiteContent());
      }
    };
    window.addEventListener('rahat:site-content-updated', handleUpdate);
    return () => window.removeEventListener('rahat:site-content-updated', handleUpdate);
  }, []);

  const cleanWaNumber = (siteData.whatsapp || '+8801792031124').replace(/[^0-9]/g, '');
  const cleanPhone = siteData.phone || '+880 1792 031124';
  const cleanEmail = siteData.email || 'rahatsbmc3732@gmail.com';
  return (
    <section
      id="contact"
      className="py-24 md:py-32 bg-transparent relative overflow-hidden border-t border-glass-border select-none"
    >
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[380px] aspect-square rounded-full bg-gold/[0.02] blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[380px] aspect-square rounded-full bg-orange-600/[0.02] blur-[90px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Heading - Smart, Minimalist & Ultra-Sleek */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
            <span className="text-[11px] font-mono font-semibold tracking-[0.2em] text-gold uppercase">
              {lang === 'EN' ? "LET'S TALK" : 'যোগাযোগ'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
            {lang === 'EN' ? 'Get in Touch & Collaborate' : 'একসাথে কাজ শুরু করি'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-2 max-w-md mx-auto">
            {lang === 'EN'
              ? 'Have an upcoming project or idea? Reach out directly via message or call.'
              : 'নতুন কোনো প্রজেক্ট বা পরিকল্পনা আছে? সরাসরি মেসেজ বা কলে যোগাযোগ করতে পারেন।'}
          </p>
        </div>

        {/* Primary Contact Cards - 4 Minimized Medium-Compact Elegant Boxes with Moving Border Light */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-5xl mx-auto mb-12">
          {/* 1. Chat With Me (WhatsApp Box - Minimized & Compact) */}
          <div className="relative rounded-xl p-[1.5px] overflow-hidden group shadow-lg">
            <div
              className="absolute inset-[-120%] pointer-events-none animate-rect-beam"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(16,185,129,0.2) 300deg, #10B981 335deg, #ffffff 350deg, #10B981 358deg, transparent 360deg)',
              }}
            />
            <div className="relative z-10 w-full h-full p-4 sm:p-4.5 rounded-[calc(0.75rem-1.5px)] bg-[#12141c]/95 border border-white/10 backdrop-blur-xl flex flex-col justify-between items-center text-center">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center p-2 mb-2 group-hover:scale-110 shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all">
                  <img
                    src="/images/icon_whatsapp.png"
                    alt="WhatsApp"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[9px] uppercase font-bold tracking-[0.18em] text-emerald-400 font-mono block mb-0.5">
                  WhatsApp Chat
                </span>
                <h3 className="font-serif text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {lang === 'EN' ? 'Chat with Me' : 'চ্যাট উইথ মি'}
                </h3>
                <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                  {lang === 'EN' ? 'Instant messaging' : 'সরাসরি মেসেজ দিন'}
                </p>
              </div>

              <a
                href={`https://wa.me/${cleanWaNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-full mt-3 py-1.5 sm:py-2 px-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-[0_3px_12px_rgba(16,185,129,0.35)] transition-all click-bounce group/btn cursor-pointer"
                title={lang === 'EN' ? 'Chat on WhatsApp' : 'হোয়াটসঅ্যাপে চ্যাট করুন'}
              >
                <MessageCircle size={13} className="fill-current text-white shrink-0" />
                <span className="font-semibold tracking-wide text-[11px] sm:text-xs">
                  {cleanPhone}
                </span>
                <span className="text-xs group-hover/btn:translate-x-0.5 transition-transform">↗</span>
              </a>
            </div>
          </div>

          {/* 2. Direct Call (Phone Box - Minimized & Compact) */}
          <div className="relative rounded-xl p-[1.5px] overflow-hidden group shadow-lg">
            <div
              className="absolute inset-[-120%] pointer-events-none animate-rect-beam"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(212,175,55,0.2) 300deg, #d4af37 335deg, #ffffff 350deg, #d4af37 358deg, transparent 360deg)',
              }}
            />
            <div className="relative z-10 w-full h-full p-4 sm:p-4.5 rounded-[calc(0.75rem-1.5px)] bg-[#12141c]/95 border border-white/10 backdrop-blur-xl flex flex-col justify-between items-center text-center">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gold/15 border border-gold/40 flex items-center justify-center p-2 mb-2 group-hover:scale-110 shadow-[0_0_12px_rgba(212,175,55,0.25)] transition-all text-gold">
                  <Phone size={17} />
                </div>
                <span className="text-[9px] uppercase font-bold tracking-[0.18em] text-gold font-mono block mb-0.5">
                  Direct Call
                </span>
                <h3 className="font-serif text-base font-bold text-white group-hover:text-gold transition-colors">
                  {lang === 'EN' ? 'Direct Phone Call' : 'সরাসরি কল দিন'}
                </h3>
                <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                  {lang === 'EN' ? 'Connect to dialer' : 'সরাসরি সংযোগ'}
                </p>
              </div>

              <a
                href={`tel:${cleanPhone.replace(/\s+/g, '')}`}
                className="w-full mt-3 py-1.5 sm:py-2 px-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs flex items-center justify-center gap-1.5 shadow-[0_3px_12px_rgba(212,175,55,0.35)] transition-all click-bounce group/btn cursor-pointer"
                title={lang === 'EN' ? 'Call Now' : 'সরাসরি কল করুন'}
              >
                <Phone size={13} className="fill-black shrink-0" />
                <span className="font-bold tracking-wide text-[11px] sm:text-xs">
                  {cleanPhone}
                </span>
                <span className="text-xs group-hover/btn:translate-x-0.5 transition-transform">↗</span>
              </a>
            </div>
          </div>

          {/* 3. Email Inquiries (Compact Email Box) */}
          <div className="relative rounded-xl p-[1.5px] overflow-hidden group shadow-lg">
            <div
              className="absolute inset-[-120%] pointer-events-none animate-rect-beam"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(14,165,233,0.2) 300deg, #0ea5e9 335deg, #ffffff 350deg, #0ea5e9 358deg, transparent 360deg)',
              }}
            />
            <div className="relative z-10 w-full h-full p-4 sm:p-4.5 rounded-[calc(0.75rem-1.5px)] bg-[#12141c]/95 border border-white/10 backdrop-blur-xl flex flex-col justify-between items-center text-center">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-sky-500/15 border border-sky-500/40 flex items-center justify-center p-2 mb-2 group-hover:scale-110 shadow-[0_0_12px_rgba(14,165,233,0.25)] transition-all text-sky-400">
                  <Mail size={17} />
                </div>
                <span className="text-[9px] uppercase font-bold tracking-[0.18em] text-sky-400 font-mono block mb-0.5">
                  Email
                </span>
                <h3 className="font-serif text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                  {lang === 'EN' ? 'Email Inquiries' : 'ইমেইল করুন'}
                </h3>
                <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                  {lang === 'EN' ? 'Project proposals' : 'প্রজেক্ট প্রস্তাবনা'}
                </p>
              </div>

              <a
                href={`mailto:${cleanEmail}`}
                className="w-full mt-3 py-1.5 sm:py-2 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-gold/50 font-medium text-xs flex items-center justify-center gap-1.5 shadow transition-all click-bounce group/btn cursor-pointer"
                title={lang === 'EN' ? 'Send Email' : 'ইমেইল পাঠান'}
              >
                <Mail size={13} className="shrink-0" />
                <span className="font-semibold tracking-wide text-[11px] sm:text-xs truncate max-w-[170px]">
                  {cleanEmail}
                </span>
                <span className="text-xs group-hover/btn:translate-x-0.5 transition-transform">↗</span>
              </a>
            </div>
          </div>

          {/* 4. Studio Location (Compact Location Box) */}
          <div className="relative rounded-xl p-[1.5px] overflow-hidden group shadow-lg">
            <div
              className="absolute inset-[-120%] pointer-events-none animate-rect-beam"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(99,102,241,0.2) 300deg, #6366f1 335deg, #ffffff 350deg, #6366f1 358deg, transparent 360deg)',
              }}
            />
            <div className="relative z-10 w-full h-full p-4 sm:p-4.5 rounded-[calc(0.75rem-1.5px)] bg-[#12141c]/95 border border-white/10 backdrop-blur-xl flex flex-col justify-between items-center text-center">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center p-2 mb-2 group-hover:scale-110 shadow-[0_0_12px_rgba(99,102,241,0.25)] transition-all text-indigo-400">
                  <MapPin size={17} />
                </div>
                <span className="text-[9px] uppercase font-bold tracking-[0.18em] text-indigo-400 font-mono block mb-0.5">
                  Studio Location
                </span>
                <h3 className="font-serif text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {siteData.location || (lang === 'EN' ? 'Dhaka, Bangladesh' : 'ঢাকা, বাংলাদেশ')}
                </h3>
                <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                  {lang === 'EN' ? 'Global availability' : 'দেশ-বিদেশের কাজ'}
                </p>
              </div>

              <div className="w-full mt-3 py-1.5 sm:py-2 px-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 font-medium text-[11px] sm:text-xs flex items-center justify-center gap-1.5 text-center">
                <MapPin size={12} className="text-gold shrink-0" />
                <span className="truncate">{siteData.location || 'Dhaka, Bangladesh'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Showcase */}
        <div className="text-center pt-8 border-t border-glass-border">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block mb-6">
            {lang === 'EN' ? 'CONNECT ACROSS CHANNELS' : 'সোশ্যাল মিডিয়া নেটওয়ার্ক'}
          </span>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                title={social.name}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl p-2.5 bg-black/60 border border-white/15 hover:border-gold flex items-center justify-center transition-all duration-300 hover:scale-115 hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] group"
              >
                <img
                  src={social.imgSrc}
                  alt={social.name}
                  className="w-full h-full object-contain p-0.5 group-hover:scale-110 transition-transform"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
