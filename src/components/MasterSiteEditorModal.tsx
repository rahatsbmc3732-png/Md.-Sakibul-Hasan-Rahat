import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  RotateCcw,
  Sliders,
  User,
  Film,
  Palette,
  Phone,
  Shield,
  Save,
  Camera,
  Video,
  Upload,
  Sparkles,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  SiteContent,
  getSiteContent,
  saveSiteContent,
  resetSiteContent,
  DEFAULT_SITE_CONTENT,
} from '../utils/siteContent';

interface MasterSiteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'EN' | 'BN';
  onOpenPhotoModal: () => void;
  onLockOwner: () => void;
}

export const MasterSiteEditorModal: React.FC<MasterSiteEditorModalProps> = ({
  isOpen,
  onClose,
  lang,
  onOpenPhotoModal,
  onLockOwner,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'videos' | 'design' | 'contact' | 'publish'>('profile');
  const [formData, setFormData] = useState<SiteContent>(getSiteContent());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(getSiteContent());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof SiteContent, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveSiteContent(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    if (confirm(lang === 'EN' ? 'Reset all texts and settings to original defaults?' : 'সমস্ত টেক্সট ও সেটিংস কি মূল ডিফল্টে ফিরিয়ে নিতে চান?')) {
      const def = resetSiteContent();
      setFormData(def);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] rounded-3xl bg-[#11131c] border border-amber-400/50 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(251,191,36,0.2)] flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-bold shadow-[0_0_20px_rgba(251,191,36,0.4)]">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{lang === 'EN' ? 'Master Website Customizer' : 'সম্পূর্ণ ওয়েবসাইট সেটিংস ও এডিটর'}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono">
                  Owner Only
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                {lang === 'EN'
                  ? 'Edit all titles, descriptions, headings, phone, email, and content on your website.'
                  : 'আপনার ওয়েবসাইটের নাম, পদবি, সমস্ত ভিডিওর হেডলাইন, ফোন, ইমেইল ও লেখা এডিট করুন।'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-2 sm:px-6 bg-black/60 border-b border-white/10 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User size={14} />
            <span>{lang === 'EN' ? '1. Profile & Hero' : '১. প্রোফাইল ও পরিচিতি'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'videos'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film size={14} />
            <span>{lang === 'EN' ? '2. Video Headlines' : '২. ভিডিওর হেডলাইনসমূহ'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'design'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette size={14} />
            <span>{lang === 'EN' ? '3. Graphic Design' : '৩. গ্রাফিক্স ডিজাইন'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Phone size={14} />
            <span>{lang === 'EN' ? '4. Contact Info' : '৪. যোগাযোগ ও সোশ্যাল'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('publish')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'publish'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield size={14} />
            <span>{lang === 'EN' ? '5. Publish & Security' : '৫. পাবলিশ ও নিরাপত্তা'}</span>
          </button>
        </div>

        {/* Tab Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* ═════════ TAB 1: PROFILE & HERO ═════════ */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <Camera size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-amber-300">
                      {lang === 'EN' ? 'Profile Picture' : 'প্রোফাইল ছবি পরিবর্তন'}
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      {lang === 'EN' ? 'Upload new photo from PC/phone or enter image URL' : 'কম্পিউটার/মোবাইল থেকে সরাসরি ছবি আপলোড করুন'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setTimeout(onOpenPhotoModal, 200);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-bold transition-all shadow cursor-pointer click-bounce"
                >
                  {lang === 'EN' ? 'Open Photo Uploader' : 'ছবি পরিবর্তন উইন্ডো'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-amber-300 mb-1">
                    {lang === 'EN' ? 'Hero First Name (Top Row - EN)' : 'নামের প্রথম অংশ (ইংরেজি)'}
                  </label>
                  <input
                    type="text"
                    value={formData.nameFirst}
                    onChange={(e) => handleChange('nameFirst', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-mono outline-none"
                    placeholder="MD SAKIBUL HASAN"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-amber-300 mb-1">
                    {lang === 'EN' ? 'Hero Big Name (Main Display - EN)' : 'মূল বড় নাম (ইংরেজি)'}
                  </label>
                  <input
                    type="text"
                    value={formData.nameLast}
                    onChange={(e) => handleChange('nameLast', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-mono outline-none"
                    placeholder="RAHAT"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-amber-300 mb-1">
                    {lang === 'EN' ? 'Bengali Name (Top Row - BN)' : 'নামের প্রথম অংশ (বাংলা)'}
                  </label>
                  <input
                    type="text"
                    value={formData.nameFirstBn || ''}
                    onChange={(e) => handleChange('nameFirstBn', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-sans outline-none"
                    placeholder="সাকিব আল হাসান"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-amber-300 mb-1">
                    {lang === 'EN' ? 'Bengali Big Name (Main Display - BN)' : 'মূল বড় নাম (বাংলা)'}
                  </label>
                  <input
                    type="text"
                    value={formData.nameLastBn || ''}
                    onChange={(e) => handleChange('nameLastBn', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-sans outline-none"
                    placeholder="রাহাত"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-amber-300 mb-1">
                    {lang === 'EN' ? 'Professional Title (English)' : 'পেশাগত পদবি (ইংরেজি)'}
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => handleChange('titleEn', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-sans outline-none"
                    placeholder="Video Editor & Motion Designer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-amber-300 mb-1">
                    {lang === 'EN' ? 'Professional Title (Bengali)' : 'পেশাগত পদবি (বাংলা)'}
                  </label>
                  <input
                    type="text"
                    value={formData.titleBn}
                    onChange={(e) => handleChange('titleBn', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-sans outline-none"
                    placeholder="ভিডিও এডিটর ও মোশন ডিজাইনার"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-300 mb-1">
                  {lang === 'EN' ? 'Hero Bio / Tagline' : 'পরিচিতি বিবরণ / বায়ো'}
                </label>
                <textarea
                  rows={2}
                  value={formData.bioEn}
                  onChange={(e) => handleChange('bioEn', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-sans outline-none"
                  placeholder="Crafting high-retention video edits..."
                />
              </div>
            </div>
          )}

          {/* ═════════ TAB 2: VIDEOS & HEADLINES ═════════ */}
          {activeTab === 'videos' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-sans text-cyan-200">
                {lang === 'EN'
                  ? 'All headlines below appear on the video trays. You can customize them freely.'
                  : 'নিচের শিরোনামগুলো ভিডিওর প্রতিটি ট্রে-র উপরে প্রদর্শিত হয়। আপনি ইচ্ছামতো পরিবর্তন করতে পারবেন।'}
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-300 mb-1">
                  {lang === 'EN' ? '⭐ Featured Master Video Title (Top Single Big Box)' : '⭐ ফিচার্ড মাস্টার ভিডিওর শিরোনাম (প্রথম একক বড় বক্স)'}
                </label>
                <input
                  type="text"
                  value={formData.featuredVideoTitle}
                  onChange={(e) => handleChange('featuredVideoTitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-amber-400/40 focus:border-amber-400 text-white text-xs font-sans outline-none"
                  placeholder="SaaS Animation: Product Workflow & UI Motion"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-300 mb-1">
                  {lang === 'EN' ? 'Tray 1: Animation & Motion Design Headline' : 'ট্রে ১: এনিমেশন ও মোশন ডিজাইন হেডলাইন'}
                </label>
                <input
                  type="text"
                  value={formData.headlineAnim}
                  onChange={(e) => handleChange('headlineAnim', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-sans outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-300 mb-1">
                  {lang === 'EN' ? 'Tray 2: Podcast & Long-Form Video Headline' : 'ট্রে ২: পডকাস্ট ও লং-ফর্ম ভিডিও হেডলাইন'}
                </label>
                <input
                  type="text"
                  value={formData.headlinePodcast}
                  onChange={(e) => handleChange('headlinePodcast', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-sans outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-300 mb-1">
                  {lang === 'EN' ? 'Tray 3: AI Generated & Visual Concept Headline' : 'ট্রে ৩: এআই ভিজ্যুয়াল ও কনসেপ্ট ভিডিও হেডলাইন'}
                </label>
                <input
                  type="text"
                  value={formData.headlineAi}
                  onChange={(e) => handleChange('headlineAi', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-sans outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-300 mb-1">
                  {lang === 'EN' ? 'Tray 4: Reels & TikTok Shorts Headline' : 'ট্রে ৪: রিলস, টিকটক ও শর্টস হেডলাইন'}
                </label>
                <input
                  type="text"
                  value={formData.headlineReels}
                  onChange={(e) => handleChange('headlineReels', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-sans outline-none"
                />
              </div>
            </div>
          )}

          {/* ═════════ TAB 3: GRAPHIC DESIGN ═════════ */}
          {activeTab === 'design' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-mono text-amber-300 mb-1">
                  {lang === 'EN' ? 'Graphic Design Section Title' : 'গ্রাফিক্স ডিজাইন সেকশনের শিরোনাম'}
                </label>
                <input
                  type="text"
                  value={formData.headlineGraphic}
                  onChange={(e) => handleChange('headlineGraphic', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-sans outline-none"
                  placeholder="গ্রাফিক্স ডিজাইন পোর্টফোলিও"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-300 mb-1">
                  {lang === 'EN' ? 'Graphic Design Description (English)' : 'গ্রাফিক্স ডিজাইন বিবরণ (ইংরেজি)'}
                </label>
                <input
                  type="text"
                  value={formData.graphicSubEn}
                  onChange={(e) => handleChange('graphicSubEn', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-sans outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-300 mb-1">
                  {lang === 'EN' ? 'Graphic Design Description (Bengali)' : 'গ্রাফিক্স ডিজাইন বিবরণ (বাংলা)'}
                </label>
                <input
                  type="text"
                  value={formData.graphicSubBn}
                  onChange={(e) => handleChange('graphicSubBn', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-sans outline-none"
                />
              </div>
            </div>
          )}

          {/* ═════════ TAB 4: CONTACT INFO ═════════ */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-amber-300 mb-1">
                    {lang === 'EN' ? 'Phone Number' : 'সরাসরি মোবাইল নম্বর'}
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-mono outline-none"
                    placeholder="+880 1792 031124"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-amber-300 mb-1">
                    {lang === 'EN' ? 'WhatsApp Number' : 'হোয়াটসঅ্যাপ নম্বর'}
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-mono outline-none"
                    placeholder="+880 1792 031124"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-amber-300 mb-1">
                    {lang === 'EN' ? 'Email Address' : 'অফিশিয়াল ইমেইল'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-mono outline-none"
                    placeholder="rahatsbmc3732@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-amber-300 mb-1">
                    {lang === 'EN' ? 'Location (City, Country)' : 'ঠিকানা / লোকেশন'}
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-sans outline-none"
                    placeholder="Dhaka, Bangladesh"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-amber-300 mb-1">
                    {lang === 'EN' ? 'Telegram Handle' : 'টেলিগ্রাম আইডি'}
                  </label>
                  <input
                    type="text"
                    value={formData.telegram}
                    onChange={(e) => handleChange('telegram', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-mono outline-none"
                    placeholder="rahat_editor"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-amber-300 mb-1">
                    {lang === 'EN' ? 'Calendly / Meeting Link' : 'ক্যালেন্ডলি বুকিং লিংক'}
                  </label>
                  <input
                    type="url"
                    value={formData.calendlyUrl}
                    onChange={(e) => handleChange('calendlyUrl', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-xs font-mono outline-none"
                    placeholder="https://calendly.com/..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═════════ TAB 5: PUBLISH & SECURITY ═════════ */}
          {activeTab === 'publish' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-black to-amber-500/5 border border-amber-400/40">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-bold shrink-0 shadow">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm sm:text-base font-bold text-white">
                      {lang === 'EN' ? 'Owner Privacy & Visitor Protection' : 'ওনার প্রাইভেসী ও দর্শক সুরক্ষা'}
                    </h4>
                    <p className="text-xs text-zinc-300 font-sans mt-1 leading-relaxed">
                      {lang === 'EN'
                        ? 'When you publish your site, visitors and clients will NEVER see any editing buttons, upload buttons, or "Audience / Owner" mode switchers. Only you can access them with your secret passcode or shortcut (Ctrl + Shift + O).'
                        : 'আপনার ওয়েবসাইটটি পাবলিশ করার পর সাধারণ দর্শক বা ক্লায়েন্টরা কোনো এডিটিং বা আপলোড বাটন দেখতে পাবে না। শুধুমাত্র আপনি সিক্রেট পাসকোড (১২৩৪) বা শর্টকাটের মাধ্যমে এটি আনলক করতে পারবেন।'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-mono text-zinc-400">
                    <span>{lang === 'EN' ? 'Default Unlock PIN:' : 'ডিফল্ট আনলক পিন:'} </span>
                    <strong className="text-amber-300 font-bold">1234</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLockOwner();
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-mono text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer click-bounce"
                  >
                    <Lock size={13} />
                    <span>{lang === 'EN' ? 'Lock for Public (Audience Mode)' : 'দর্শকদের জন্য এখনই লক করুন'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save & Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 bg-[#11131c]">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-mono text-xs transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>{lang === 'EN' ? 'Reset to Defaults' : 'ডিফল্টে রিসেট'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs transition-colors cursor-pointer"
              >
                {lang === 'EN' ? 'Cancel' : 'বাতিল'}
              </button>

              <button
                type="submit"
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer shadow-lg click-bounce ${
                  savedSuccess
                    ? 'bg-emerald-400 text-black shadow-emerald-400/40'
                    : 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/40'
                }`}
              >
                {savedSuccess ? <Check size={14} /> : <Save size={14} />}
                <span>
                  {savedSuccess
                    ? (lang === 'EN' ? 'Saved Successfully!' : 'সফলভাবে সংরক্ষিত!')
                    : (lang === 'EN' ? 'Save & Apply All' : 'সব সংরক্ষণ ও প্রয়োগ করুন')}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
