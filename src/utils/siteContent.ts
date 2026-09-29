import { saveSiteDataToServer } from './apiSync';

export interface SiteContent {
  nameFirst: string;
  nameLast: string;
  nameFirstBn?: string;
  nameLastBn?: string;
  titleEn: string;
  titleBn: string;
  bioEn: string;
  bioBn: string;
  featuredVideoTitle: string;
  featuredVideoUrl?: string;
  headlineAnim: string;
  headlinePodcast: string;
  headlineAi: string;
  headlineReels: string;
  headlineGraphic: string;
  graphicSubEn: string;
  graphicSubBn: string;
  phone: string;
  whatsapp: string;
  email: string;
  telegram: string;
  location: string;
  calendlyUrl: string;
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  nameFirst: 'MD SAKIBUL HASAN',
  nameLast: 'RAHAT',
  nameFirstBn: 'সাকিব আল হাসান',
  nameLastBn: 'রাহাত',
  titleEn: 'Video Editor & Motion Designer',
  titleBn: 'ভিডিও এডিটর ও মোশন ডিজাইনার',
  bioEn: 'Crafting high-retention video edits, kinetic typography, and motion design that elevate brands.',
  bioBn: 'উচ্চমানের ভিডিও এডিটিং, কাইনেটিক টাইপোগ্রাফি ও মোশন ডিজাইনের মাধ্যমে ব্র্যান্ডের মান বৃদ্ধি।',
  featuredVideoTitle: 'SaaS Animation: Product Workflow & UI Motion',
  headlineAnim: '01. সাস ও মোশন এনিমেশন ভিডিও (Animation & Motion)',
  headlinePodcast: '02. পডকাস্ট ও লং-ফর্ম ভিডিও স্টোরিটেলিং (Podcast & Long-Form)',
  headlineAi: '03. এআই ভিজ্যুয়াল ও সিনেমাটিক কনসেপ্ট ভিডিও (AI Generated Video)',
  headlineReels: '04. হাই-কনভার্টিং রিলস, টিকটক ও শর্টস (Reels & Shorts)',
  headlineGraphic: 'গ্রাফিক্স ডিজাইন পোর্টফোলিও (Graphic Design)',
  graphicSubEn: 'High-conversion thumbnails, promotional posters, and branding.',
  graphicSubBn: 'হাই-কনভার্টিং থাম্বনেইল, সোশ্যাল পোস্টার ও ব্র্যান্ডিং।',
  phone: '+880 1792 031124',
  whatsapp: '+880 1792 031124',
  email: 'rahatsbmc3732@gmail.com',
  telegram: 'rahat_editor',
  location: 'Dhaka, Bangladesh',
  calendlyUrl: 'https://calendly.com',
};

const STORAGE_KEY = 'rahat_master_site_content_v1';

if (typeof window !== 'undefined') {
  window.addEventListener('rahat:data-synced-from-server', (e: Event) => {
    const custom = e as CustomEvent<any>;
    if (custom.detail && custom.detail.siteContent && typeof custom.detail.siteContent === 'object') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(custom.detail.siteContent));
        window.dispatchEvent(new CustomEvent('rahat:site-content-updated', { detail: custom.detail.siteContent }));
      } catch {}
    }
  });
}

export const getSiteContent = (): SiteContent => {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SITE_CONTENT, ...JSON.parse(saved) };
      }
    }
  } catch {}
  return DEFAULT_SITE_CONTENT;
};

export const saveSiteContent = (content: Partial<SiteContent>): SiteContent => {
  const current = getSiteContent();
  const updated = { ...current, ...content };
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('rahat:site-content-updated', { detail: updated }));
    }
  } catch {}
  saveSiteDataToServer({ siteContent: updated });
  return updated;
};

export const resetSiteContent = (): SiteContent => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('rahat:site-content-updated', { detail: DEFAULT_SITE_CONTENT }));
    }
  } catch {}
  saveSiteDataToServer({ siteContent: DEFAULT_SITE_CONTENT });
  return DEFAULT_SITE_CONTENT;
};
