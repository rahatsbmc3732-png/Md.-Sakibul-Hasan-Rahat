import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Link2, RotateCcw, Check, X, Sparkles, Image as ImageIcon, Edit3 } from 'lucide-react';
import { getSiteContent, saveSiteContent, SiteContent } from '../utils/siteContent';
import { uploadMediaFileToServer, uploadBase64ImageToServer, saveSiteDataToServer } from '../utils/apiSync';

interface HeroProps {
  lang: 'EN' | 'BN';
  isOwner?: boolean;
}

const DEFAULT_PHOTO = '/images/rahat_original.jpg';
const STORAGE_KEY_PHOTO = 'rahat_custom_profile_image';

export const Hero: React.FC<HeroProps> = ({ lang, isOwner = false }) => {
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

  const [profileImg, setProfileImg] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PHOTO);
      return saved || DEFAULT_PHOTO;
    } catch {
      return DEFAULT_PHOTO;
    }
  });

  // Custom subtitle state (Editable by owner)
  const [customSubtitle, setCustomSubtitle] = useState<string>(() => {
    try {
      return localStorage.getItem('rahat_custom_subtitle') || '';
    } catch {
      return '';
    }
  });
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [tempSubtitle, setTempSubtitle] = useState('');

  const handleSaveSubtitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = tempSubtitle.trim();
    setCustomSubtitle(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem('rahat_custom_subtitle', trimmed);
      } else {
        localStorage.removeItem('rahat_custom_subtitle');
      }
    } catch {}
    saveSiteDataToServer({ customSubtitle: trimmed });
    setIsEditingSubtitle(false);
  };

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [tempPreview, setTempPreview] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPhotoModalOpen) {
        setIsPhotoModalOpen(false);
      }
    };
    if (isPhotoModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isPhotoModalOpen]);

  const handleOpenModal = () => {
    setTempPreview(profileImg);
    setInputUrl('');
    setSaveSuccess(false);
    setIsPhotoModalOpen(true);
  };

  const selectedPhotoFileRef = useRef<File | null>(null);

  // Listen for owner bar trigger and server sync
  useEffect(() => {
    const handleTrigger = () => {
      handleOpenModal();
    };
    const handlePhotoUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setProfileImg(customEvent.detail);
      }
    };
    const handleServerSync = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      if (customEvent.detail) {
        if (customEvent.detail.profileImage) {
          setProfileImg(customEvent.detail.profileImage);
          try { localStorage.setItem(STORAGE_KEY_PHOTO, customEvent.detail.profileImage); } catch {}
        }
        if (customEvent.detail.customSubtitle) {
          setCustomSubtitle(customEvent.detail.customSubtitle);
          try { localStorage.setItem('rahat_custom_subtitle', customEvent.detail.customSubtitle); } catch {}
        }
      }
    };
    window.addEventListener('rahat:open-photo-modal', handleTrigger);
    window.addEventListener('rahat:profile-photo-updated', handlePhotoUpdated);
    window.addEventListener('rahat:data-synced-from-server', handleServerSync);
    return () => {
      window.removeEventListener('rahat:open-photo-modal', handleTrigger);
      window.removeEventListener('rahat:profile-photo-updated', handlePhotoUpdated);
      window.removeEventListener('rahat:data-synced-from-server', handleServerSync);
    };
  }, [profileImg]);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(lang === 'EN' ? 'Please select a valid image file (JPG, PNG, WebP).' : 'দয়া করে একটি সঠিক ছবি ফাইল নির্বাচন করুন (JPG, PNG, WebP)।');
      return;
    }
    selectedPhotoFileRef.current = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setTempPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!inputUrl.trim()) return;
    selectedPhotoFileRef.current = null;
    setTempPreview(inputUrl.trim());
  };

  const handleSavePhoto = async () => {
    if (!tempPreview) return;
    setSaveSuccess(true);
    let finalUrl = tempPreview;

    try {
      // 1. Upload to server for permanent hosting across refreshes & audience access
      if (selectedPhotoFileRef.current) {
        const serverUrl = await uploadMediaFileToServer(selectedPhotoFileRef.current, selectedPhotoFileRef.current.name);
        if (serverUrl) finalUrl = serverUrl;
      } else if (tempPreview.startsWith('data:')) {
        const serverUrl = await uploadBase64ImageToServer(tempPreview, 'profile_photo');
        if (serverUrl) finalUrl = serverUrl;
      }

      // 2. Persist locally and to server site data
      localStorage.setItem(STORAGE_KEY_PHOTO, finalUrl);
      setProfileImg(finalUrl);
      await saveSiteDataToServer({ profileImage: finalUrl });
      window.dispatchEvent(new CustomEvent('rahat:profile-photo-updated', { detail: finalUrl }));

      setTimeout(() => {
        setSaveSuccess(false);
        setIsPhotoModalOpen(false);
      }, 700);
    } catch {
      localStorage.setItem(STORAGE_KEY_PHOTO, tempPreview);
      setProfileImg(tempPreview);
      setIsPhotoModalOpen(false);
    }
  };

  const handleResetToOriginal = async () => {
    try {
      localStorage.removeItem(STORAGE_KEY_PHOTO);
      await saveSiteDataToServer({ profileImage: DEFAULT_PHOTO });
    } catch {}
    setProfileImg(DEFAULT_PHOTO);
    setTempPreview(DEFAULT_PHOTO);
    setIsPhotoModalOpen(false);
  };

  const isCustomImage = profileImg !== DEFAULT_PHOTO;

  return (
    <section
      id="home"
      className="relative min-h-[95vh] lg:min-h-screen w-full flex flex-col justify-between items-center overflow-hidden pt-20 sm:pt-24 pb-8 select-none"
    >
      {/* Background ambient lighting matching omaersabbir.vercel.app */}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 md:left-auto md:right-[20%] md:translate-x-0 w-[260px] sm:w-[380px] md:w-[480px] aspect-square rounded-full bg-orange-600/50 blur-[50px] sm:blur-[70px] md:blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-amber-600/10 via-[#d4af37]/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-12 left-10 w-72 h-72 rounded-full bg-cyan-500/[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85vw] max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-gold/35 to-transparent blur-[0.5px] pointer-events-none z-0" />
      <div className="absolute inset-x-0 bottom-0 h-44 sm:h-52 md:h-48 bg-gradient-to-t from-charcoal via-charcoal/85 to-transparent pointer-events-none z-30" />

      {/* Cinematic Camera Viewfinder Corner Overlays */}
      <div className="absolute inset-4 sm:inset-6 md:inset-8 pointer-events-none z-15">
        <div className="absolute top-10 sm:top-14 left-0 w-3.5 sm:w-5 h-3.5 sm:w-5 border-t-2 border-l-2 border-gold/40" />
        <div className="absolute top-10 sm:top-14 right-0 w-3.5 sm:w-5 h-3.5 sm:w-5 border-t-2 border-r-2 border-gold/40" />
        <div className="absolute bottom-24 sm:bottom-20 left-0 w-3.5 sm:w-5 h-3.5 sm:w-5 border-b-2 border-l-2 border-gold/40" />
        <div className="absolute bottom-24 sm:bottom-20 right-0 w-3.5 sm:w-5 h-3.5 sm:w-5 border-b-2 border-r-2 border-gold/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold/20 text-sm font-mono select-none">+</div>
      </div>

      {/* Main Big Display Typography Name + Circular Profile Photo on the Right */}
      <div className="absolute inset-0 flex flex-col items-center justify-center -translate-y-2 sm:-translate-y-4 md:-translate-y-6 select-none z-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="w-full flex flex-col justify-center items-center relative">
          {/* Subtle Golden Glow behind */}
          <div className="absolute w-[320px] sm:w-[540px] md:w-[760px] h-[180px] sm:h-[260px] rounded-full bg-gold/15 blur-[90px] sm:blur-[130px] pointer-events-none -z-10" />

          {/* Master Hero Content: Name Block on Left, Medium Circular Profile Photo on Right */}
          <div
            id="hero-name-block"
            className="flex flex-row items-center justify-center gap-8 sm:gap-10 md:gap-12 lg:gap-16 w-full filter drop-shadow-[0_10px_35px_rgba(0,0,0,0.98)] drop-shadow-[0_0_50px_rgba(212,175,55,0.25)]"
          >
            {/* Left Typography Side: MD SAKIBUL HASAN RAHAT / সাকিব আল হাসান রাহাত */}
            <div className="flex flex-col items-start text-left">
              <div
                id="hero-name-md-sakibul-hasan"
                className="font-sans font-black tracking-[0.03em] sm:tracking-[0.04em] leading-[1.0] text-[28px] sm:text-[34px] md:text-[38px] lg:text-[42px] xl:text-[46px] whitespace-nowrap bg-gradient-to-b from-white via-white/95 to-slate-200 bg-clip-text text-transparent flex items-center gap-2"
              >
                <span>
                  {lang === 'BN'
                    ? (siteData.nameFirstBn || 'সাকিব আল হাসান')
                    : (siteData.nameFirst || 'MD SAKIBUL HASAN')}
                </span>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      const newName = prompt(
                        lang === 'EN' ? 'Edit First Name:' : 'নামের প্রথম অংশ পরিবর্তন করুন:',
                        lang === 'BN' ? (siteData.nameFirstBn || 'সাকিব আল হাসান') : (siteData.nameFirst || 'MD SAKIBUL HASAN')
                      );
                      if (newName && newName.trim()) {
                        if (lang === 'BN') saveSiteContent({ nameFirstBn: newName.trim() });
                        else saveSiteContent({ nameFirst: newName.trim() });
                      }
                    }}
                    className="p-1 rounded-full hover:bg-white/10 text-amber-300 hover:text-white transition-colors cursor-pointer"
                    title={lang === 'EN' ? 'Edit name' : 'নাম পরিবর্তন করুন'}
                  >
                    <Edit3 size={13} />
                  </button>
                )}
              </div>
              <div
                id="hero-name-rahat"
                className="font-sans font-black tracking-[-0.02em] leading-[0.85] text-[76px] sm:text-[88px] md:text-[96px] lg:text-[104px] xl:text-[116px] whitespace-nowrap bg-gradient-to-b from-white via-slate-100 to-slate-300 bg-clip-text text-transparent mt-0.5 sm:mt-1 flex items-center gap-2"
              >
                <span>
                  {lang === 'BN'
                    ? (siteData.nameLastBn || 'রাহাত')
                    : (siteData.nameLast || 'RAHAT')}
                </span>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      const newLast = prompt(
                        lang === 'EN' ? 'Edit Big Display Name:' : 'মূল বড় নাম পরিবর্তন করুন:',
                        lang === 'BN' ? (siteData.nameLastBn || 'রাহাত') : (siteData.nameLast || 'RAHAT')
                      );
                      if (newLast && newLast.trim()) {
                        if (lang === 'BN') saveSiteContent({ nameLastBn: newLast.trim() });
                        else saveSiteContent({ nameLast: newLast.trim() });
                      }
                    }}
                    className="p-1 rounded-full hover:bg-white/10 text-amber-300 hover:text-white transition-colors cursor-pointer"
                    title={lang === 'EN' ? 'Edit display name' : 'বড় নাম পরিবর্তন করুন'}
                  >
                    <Edit3 size={15} />
                  </button>
                )}
              </div>
              {/* Standard Medium Subtitle: VIDEO EDITOR & MOTION DESIGNER (Editable by Owner) */}
              <div className="mt-3 sm:mt-4 flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 border border-white/15 backdrop-blur-md shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                {isEditingSubtitle ? (
                  <form onSubmit={handleSaveSubtitle} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempSubtitle}
                      onChange={(e) => setTempSubtitle(e.target.value)}
                      placeholder={lang === 'EN' ? (siteData.titleEn || 'Video Editor & Motion Designer') : (siteData.titleBn || 'ভিডিও এডিটর ও মোশন ডিজাইনার')}
                      className="px-2 py-0.5 rounded bg-black/90 border border-amber-400 text-white text-xs font-sans outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="p-1 rounded bg-amber-400 text-black hover:bg-amber-300 cursor-pointer"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingSubtitle(false)}
                      className="p-1 rounded bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="text-sm sm:text-base md:text-lg font-sans font-semibold text-zinc-100 tracking-wide">
                      {customSubtitle || (lang === 'EN' ? (siteData.titleEn || 'Video Editor & Motion Designer') : (siteData.titleBn || 'ভিডিও এডিটর ও মোশন ডিজাইনার'))}
                    </span>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => {
                          setTempSubtitle(customSubtitle || (lang === 'EN' ? (siteData.titleEn || 'Video Editor & Motion Designer') : (siteData.titleBn || 'ভিডিও এডিটর ও মোশন ডিজাইনার')));
                          setIsEditingSubtitle(true);
                        }}
                        className="p-1 rounded-full hover:bg-white/10 text-amber-300 hover:text-white transition-colors cursor-pointer ml-1"
                        title={lang === 'EN' ? 'Edit professional title' : 'টাইটেল এডিট করুন'}
                      >
                        <Edit3 size={13} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Side: Exact Circular Orbit Profile Design from https://naeim-protfolio.vercel.app/ */}
            <div className="flex flex-col items-center gap-2 shrink-0 pointer-events-auto">
              <div className="relative shrink-0 flex items-center justify-center p-6 sm:p-8 md:p-10 select-none">
                {/* Multi-tone ambient background spinning aura (Naeim signature) */}
                <div
                  aria-hidden="true"
                  className="absolute inset-[-10%] rounded-full bg-gradient-to-tr from-amber-500/30 via-rose-500/25 to-cyan-500/30 blur-3xl animate-glow-spin pointer-events-none scale-110"
                />

                {/* Orbiting circular ring with creative tool badges (Pr, Ae, Ps, Ai, ∞, Sparkles) */}
                <div className="relative w-64 h-64 sm:w-76 sm:h-76 md:w-84 md:h-84 lg:w-[350px] lg:h-[350px] rounded-full border-2 border-amber-500/50 dark:border-amber-400/40 shadow-[0_0_35px_rgba(245,158,11,0.4)] animate-orbit pointer-events-auto">
                  {/* 1. Adobe Premiere Pro (Top) */}
                  <div className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2" title="Adobe Premiere Pro">
                    <div className="animate-counter-spin">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-[#00005b] text-[#9999ff] border-2 border-[#9999ff] shadow-xl shadow-purple-950/80 hover:scale-125 transition-transform cursor-pointer">
                        <span className="font-black text-xs sm:text-sm leading-none text-[#9999ff] drop-shadow">Pr</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Adobe After Effects (Top-Right) */}
                  <div className="absolute top-[25%] right-[-15px] sm:right-[-18px] translate-x-1 -translate-y-1/2" title="Adobe After Effects">
                    <div className="animate-counter-spin">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-[#00005b] text-[#d291ff] border-2 border-[#d291ff] shadow-xl shadow-purple-950/80 hover:scale-125 transition-transform cursor-pointer">
                        <span className="font-black text-xs sm:text-sm leading-none text-[#d291ff] drop-shadow">Ae</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Adobe Photoshop (Bottom-Right) */}
                  <div className="absolute top-[75%] right-[-15px] sm:right-[-18px] translate-x-1 -translate-y-1/2" title="Adobe Photoshop">
                    <div className="animate-counter-spin">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-[#001e36] text-[#31a8ff] border-2 border-[#31a8ff] shadow-xl shadow-blue-950/80 hover:scale-125 transition-transform cursor-pointer">
                        <span className="font-black text-xs sm:text-sm leading-none text-[#31a8ff] drop-shadow">Ps</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Adobe Illustrator (Bottom) */}
                  <div className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2" title="Adobe Illustrator">
                    <div className="animate-counter-spin">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-[#330000] text-[#ff9a00] border-2 border-[#ff9a00] shadow-xl shadow-amber-950/80 hover:scale-125 transition-transform cursor-pointer">
                        <span className="font-black text-xs sm:text-sm leading-none text-[#ff9a00] drop-shadow">Ai</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. Meta / Video Ads (Bottom-Left) */}
                  <div className="absolute top-[75%] left-[-15px] sm:left-[-18px] -translate-x-1 -translate-y-1/2" title="Social Reels & Ads">
                    <div className="animate-counter-spin">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-[#002f6c] text-[#0081fb] border-2 border-[#0081fb] shadow-xl shadow-blue-950/80 hover:scale-125 transition-transform cursor-pointer">
                        <span className="font-black text-sm sm:text-base leading-none text-[#0081fb] drop-shadow">∞</span>
                      </div>
                    </div>
                  </div>

                  {/* 6. Motion & Visual Effects (Top-Left) */}
                  <div className="absolute top-[25%] left-[-15px] sm:left-[-18px] -translate-x-1 -translate-y-1/2" title="Motion Design & Visual Storytelling">
                    <div className="animate-counter-spin">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-[#0f172a] text-[#38bdf8] border-2 border-[#38bdf8] shadow-xl shadow-cyan-950/80 hover:scale-125 transition-transform cursor-pointer">
                        <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#38bdf8] drop-shadow" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Round Profile Avatar Frame (Exact Naeim Round Style, Enriched and Enlarged) */}
                <div
                  onClick={isOwner ? handleOpenModal : undefined}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-68 lg:h-68 rounded-full p-1.5 bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 shadow-2xl z-10 ${
                    isOwner ? 'cursor-pointer group' : ''
                  }`}
                  title={isOwner ? (lang === 'EN' ? 'Click to change profile photo' : 'ছবি পরিবর্তন করতে ক্লিক করুন') : undefined}
                >
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-amber-200/60 bg-slate-950 relative">
                    <img
                      src={profileImg}
                      alt="MD Sakibul Hasan Rahat"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                    />

                    {/* Interactive hover overlay - ONLY VISIBLE TO OWNER */}
                    {isOwner && (
                      <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1.5 backdrop-blur-[2px] p-2 text-center pointer-events-none sm:pointer-events-auto">
                        <div className="w-9 h-9 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                          <Camera size={18} />
                        </div>
                        <span className="text-xs font-mono font-bold text-white tracking-wide drop-shadow">
                          {lang === 'EN' ? 'Change Photo' : 'ছবি পরিবর্তন'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Owner Camera Quick Trigger Badge on Avatar Top-Right */}
                  {isOwner && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal();
                      }}
                      className="absolute top-1 right-1 w-9 h-9 rounded-full bg-amber-400 text-black border-2 border-white shadow-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform z-30 animate-pulse"
                      title={lang === 'EN' ? 'Click to change profile picture' : 'ছবি পরিবর্তন করতে ক্লিক করুন'}
                    >
                      <Camera size={16} />
                    </div>
                  )}

                  {/* Status badge at bottom of circle (Naeim Style) */}
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg flex items-center gap-1.5 whitespace-nowrap border border-white/40 z-20">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-200 animate-ping" />
                    <span>{lang === 'EN' ? 'Open to Work' : 'কাজের জন্য প্রস্তুত'}</span>
                  </div>
                </div>
              </div>

              {/* Prominent button underneath to easily change photo - ONLY VISIBLE TO OWNER */}
              {isOwner && (
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 hover:from-amber-400 hover:to-amber-300 text-amber-200 hover:text-black border-2 border-amber-400/60 hover:border-amber-300 font-mono text-xs font-bold transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] cursor-pointer group/btn click-bounce"
                >
                  <Camera size={14} className="text-amber-300 group-hover/btn:text-black transition-colors" />
                  <span>{lang === 'EN' ? '📷 Change Profile Photo' : '📷 প্রোফাইল ছবি পরিবর্তন করুন'}</span>
                  {isCustomImage && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" title="Custom Photo Active" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════
          PHOTO CHANGE MODAL DIALOG (ছবি চেঞ্জ করে অন্য ছবি বসানোর সহজ সিস্টেম)
          ═════════════════════════════════════════════════════════════════════════ */}
      {isPhotoModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#11131a] border border-gold/40 shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(212,175,55,0.25)] p-5 sm:p-6 flex flex-col gap-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shadow-md">
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-white">
                    {lang === 'EN' ? 'Change Profile Photo' : 'প্রোফাইল ছবি পরিবর্তন করুন'}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] font-mono text-zinc-400">
                    {lang === 'EN' ? 'Upload a photo from your computer or paste image link' : 'আপনার কম্পিউটার থেকে ছবি দিন অথবা লিংক দিন'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Circular Preview Container */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#d4af37] via-amber-200 to-[#996515] shadow-[0_10px_25px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.3)]">
                <div className="p-1 rounded-full bg-[#0a0a0a]">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-black relative">
                    <img
                      src={tempPreview || profileImg}
                      alt="Profile preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 mt-2">
                {lang === 'EN' ? 'Preview: Circular Profile Frame' : 'প্রিভিউ: গোলাকার প্রোফাইল লুক'}
              </span>
            </div>

            {/* Upload Method Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/60 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('file')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'file'
                    ? 'bg-gold text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Upload size={13} />
                <span>{lang === 'EN' ? 'From Computer/Phone' : 'ফাইল থেকে আপলোড'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-gold text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Link2 size={13} />
                <span>{lang === 'EN' ? 'Image Web URL' : 'ছবির লিংক'}</span>
              </button>
            </div>

            {/* Tab 1: File Upload */}
            {activeTab === 'file' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gold/40 hover:border-gold rounded-xl p-4 bg-gold/[0.03] hover:bg-gold/[0.07] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold">
                    <ImageIcon size={20} />
                  </div>
                  <p className="text-xs font-serif font-bold text-white">
                    {lang === 'EN' ? 'Click here to choose photo file' : 'কম্পিউটার/ফোন থেকে ছবি বেছে নিতে এখানে ক্লিক করুন'}
                  </p>
                  <span className="text-[10px] font-mono text-zinc-400">
                    JPG, PNG, WebP (High Resolution)
                  </span>
                </div>
              </div>
            ) : (
              /* Tab 2: URL Input */
              <div className="space-y-2">
                <label className="block text-[11px] font-mono text-zinc-300">
                  {lang === 'EN' ? 'Paste Image URL' : 'অনলাইন ছবির সরাসরি লিংক দিন'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/20 focus:border-gold text-white text-xs font-mono outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold cursor-pointer"
                  >
                    {lang === 'EN' ? 'Preview' : 'দেখুন'}
                  </button>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
              <button
                type="button"
                onClick={handleResetToOriginal}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                title={lang === 'EN' ? 'Revert to original unedited photo' : 'মূল ছবিতে ফিরে যান'}
              >
                <RotateCcw size={12} />
                <span>{lang === 'EN' ? 'Reset to Original' : 'আসল ছবি ফেরত নিন'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-mono text-xs transition-colors cursor-pointer"
                >
                  {lang === 'EN' ? 'Cancel' : 'বাতিল'}
                </button>

                <button
                  type="button"
                  onClick={handleSavePhoto}
                  className="px-4 py-2 rounded-xl bg-gold hover:bg-amber-400 text-black font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center gap-1.5 cursor-pointer click-bounce"
                >
                  {saveSuccess ? (
                    <>
                      <Check size={14} />
                      <span>{lang === 'EN' ? 'Saved!' : 'সংরক্ষিত!'}</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{lang === 'EN' ? 'Save & Apply' : 'ছবি সেভ করুন'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gradient Bottom Scrim */}
      <div className="absolute inset-x-0 bottom-0 h-44 sm:h-52 md:h-48 bg-gradient-to-t from-charcoal via-charcoal/85 to-transparent pointer-events-none z-30" />
    </section>
  );
};
