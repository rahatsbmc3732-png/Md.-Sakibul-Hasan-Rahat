export interface Project {
  id: string;
  title: string;
  titleBn?: string;
  description: string;
  descriptionBn?: string;
  videoId: string;
  url: string;
  category: 'Animation & Motion' | 'Podcast & Long-Form' | 'Reels & Shorts' | 'AI Generated Video';
  tags: string[];
  aspectRatio: '16:9' | '9:16';
  thumbnailUrl: string;
  duration: string;
  platform?: 'vimeo' | 'youtube' | 'file';
  featured?: boolean;
  isUserUploaded?: boolean;
  localVideoUrl?: string;
}

// ═════════════════════════════════════════════════════════════════════════
// 1. সাস এনিমেশন ভিডিও (Animation 1 / Featured Master Motion)
// ═════════════════════════════════════════════════════════════════════════
export const SAAS_ANIMATION_PROJECT: Project = {
  id: 'anim-1',
  title: 'SaaS Animation: Product Workflow & UI Motion',
  titleBn: 'সাস অ্যানিমেশন: প্রোডাক্ট ওয়ার্কফ্লো ও ইউআই মোশন',
  description: 'Dynamic SaaS product walkthrough, search kinetic reveal, UI micro-interactions, and high-impact visual motion by MD Sakibul Hasan Rahat.',
  descriptionBn: 'সাস প্রোডাক্ট ওয়ার্কফ্লো, ডায়নামিক সার্চ রিভিল, ইউআই মাইক্রো-ইন্টারঅ্যাকশন ও হাই-ইমপ্যাক্ট মোশন এনিমেশন।',
  videoId: '1229887460',
  url: 'https://vimeo.com/1229887460?fl=ip&fe=ec',
  category: 'Animation & Motion',
  tags: ['SaaS Animation', 'Motion Design', 'Kinetic UI'],
  aspectRatio: '16:9',
  thumbnailUrl: 'https://i.vimeocdn.com/video/2204652856-7d9cf3e0188770ea7b5abafe5c50800153dd6b0ad9da4a0f567a685830a0348a-d_640.jpg',
  duration: '0:05',
  platform: 'vimeo',
  featured: true
};

// ═════════════════════════════════════════════════════════════════════════
// 2. মোশন ডিজাইন ভিডিও তালিকা (Animation & Motion Design Tray - 3 Standard Cards)
// ═════════════════════════════════════════════════════════════════════════
export const ANIMATION_PROJECTS: Project[] = [
  SAAS_ANIMATION_PROJECT,
  {
    id: 'anim-2',
    title: 'Commercial Brand Promo: Dynamic Speed Ramp Cut',
    titleBn: 'কমার্শিয়াল ব্র্যান্ড প্রোমো: ডায়নামিক স্পিড র‍্যাম্প কাট',
    description: 'High-energy commercial animation with rhythmic audio-visual synchronization and sharp keyframed motion.',
    descriptionBn: 'উচ্চ শক্তিসম্পন্ন কমার্শিয়াল এনিমেশন, রিদমিক অডিও-ভিজ্যুয়াল সিঙ্ক এবং শার্প মোশন গ্রাফিক্স।',
    videoId: '1229885859',
    url: 'https://vimeo.com/1229885859?fl=ip&fe=ec',
    category: 'Animation & Motion',
    tags: ['Commercial', 'Speed Ramp', 'Motion'],
    aspectRatio: '16:9',
    thumbnailUrl: 'https://i.vimeocdn.com/video/2204650777-63be6e47485c24f8f953b475efd76c9dfb76c32994f734db1b1c91df4931943a-d_640.jpg',
    duration: '0:05',
    platform: 'vimeo'
  },
  {
    id: 'anim-3',
    title: 'Kinetic Typography & Vector Micro-Motion Reveal',
    titleBn: 'কাইনেটিক টাইপোগ্রাফি ও ভেক্টর মাইক্রো-মোশন রিভিল',
    description: 'Crisp logo reveal, subtle motion micro-interactions, and high-impact vector graphics styling.',
    descriptionBn: 'লোগো রিভিল, সাবটেল মোশন মাইক্রো-ইন্টারঅ্যাকশন ও হাই-ইমপ্যাক্ট ভেক্টর গ্রাফিক্স স্টাইলিং।',
    videoId: '1229885858',
    url: 'https://vimeo.com/1229885858?fl=ip&fe=ec',
    category: 'Animation & Motion',
    tags: ['Micro-Motion', 'Choreography', 'VFX'],
    aspectRatio: '16:9',
    thumbnailUrl: 'https://i.vimeocdn.com/video/2204650766-b1f8560f373977641ecd23e79c7dbe659be9e5c0f4a8ff36a13bc87b042ef506-d_640.jpg',
    duration: '0:03',
    platform: 'vimeo'
  }
];

// ═════════════════════════════════════════════════════════════════════════
// 2. পডকাস্ট ভিডিও (Podcast & Narrative Long-Form Tray)
// ═════════════════════════════════════════════════════════════════════════
export const PODCAST_PROJECTS: Project[] = [
  {
    id: 'pod-1',
    title: 'Visual Storytelling & Narrative Podcast Master Cut',
    titleBn: 'ভিজ্যুয়াল স্টোরিটেলিং ও ন্যারেটিভ পডকাস্ট মাস্টার কাট',
    description: 'Mastered audio, multi-angle pacing, dynamic B-roll insertions, and continuous viewer retention structure.',
    descriptionBn: 'মাস্টার অডিও, মাল্টি-অ্যাঙ্গেল পেসিং, ডায়নামিক বি-রোল ইনসার্ট ও উচ্চ দর্শক রিটেনশন স্ট্রাকচার।',
    videoId: '1229886307',
    url: 'https://vimeo.com/1229886307?fl=ip&fe=ec',
    category: 'Podcast & Long-Form',
    tags: ['Podcast Edit', 'Storytelling', 'Audio Master'],
    aspectRatio: '16:9',
    thumbnailUrl: 'https://i.vimeocdn.com/video/2204651521-197ff28f3f2dda86b75cb443d698cd56c4bd5219724c739c28d1327762728863-d_640.jpg',
    duration: '1:27',
    platform: 'vimeo',
    featured: true
  },
  {
    id: 'pod-2',
    title: 'Engaging Studio Interview & Dialogue Flow Mastery',
    titleBn: 'স্টুডিও ইন্টারভিউ ও ডায়লগ ফ্লো মাস্টারি',
    description: 'Precision cut dialogue, background noise reduction, color grading, and audience engagement retention edit.',
    descriptionBn: 'নির্ভুল ডায়লগ কাটিং, ব্যাকগ্রাউন্ড নয়েজ রিডাকশন, কালার গ্রেডিং ও অডিয়েন্স এনগেজমেন্ট এডিট।',
    videoId: '1229892284',
    url: 'https://vimeo.com/1229892284?fl=ip&fe=ec',
    category: 'Podcast & Long-Form',
    tags: ['Interview', 'Dialogue Flow', 'Color Grade'],
    aspectRatio: '16:9',
    thumbnailUrl: 'https://i.vimeocdn.com/video/2204658936-fa1c2419e68f232355c795d30543c42380b5d9e1ab74f4faee6010f32d8f5bfb-d_640.jpg',
    duration: '1:16',
    platform: 'vimeo'
  }
];

// ═════════════════════════════════════════════════════════════════════════
// 3. রিলস ভিডিও (Reels & Shorts Showcase Tray - 9:16 Vertical)
// ═════════════════════════════════════════════════════════════════════════
export const REELS_PROJECTS: Project[] = [
  {
    id: 'reel-1',
    title: 'High-Converting Viral Hook & Kinetic 9:16 Reel',
    titleBn: 'হাই-কনভার্টিং ভাইরাল হুক ও কাইনেটিক ৯:১৬ রিল',
    description: 'Optimized 9:16 vertical short crafted for maximum 3-second hook retention, kinetic captions, and punchy zooms.',
    descriptionBn: '৩-সেকেন্ড হুক রিটেনশন, কাইনেটিক ক্যাপশন এবং পাঞ্চি জুমসহ অপ্টিমাইজড ৯:১৬ ভার্টিক্যাল শর্ট।',
    videoId: '1229435636',
    url: 'https://vimeo.com/1229435636?fl=ip&fe=ec',
    category: 'Reels & Shorts',
    tags: ['9:16 Vertical', 'Viral Hook', 'Kinetic Reel'],
    aspectRatio: '9:16',
    thumbnailUrl: 'https://i.vimeocdn.com/video/2204092967-759591a467f530387191d3a29abb2d1223c127c00bcca37f1488078c4774e0c0-d_640.jpg',
    duration: '0:32',
    platform: 'vimeo',
    featured: true
  },
  {
    id: 'reel-2',
    title: 'Fast-Paced Micro-Cuts: Dynamic SFX & Loop Short',
    titleBn: 'ফাস্ট-পেসড মাইক্রো-কাটস: ডায়নামিক এসএফএক্স লুপ শর্ট',
    description: 'Quick micro-cuts, dynamic SFX audio cues, and seamless loop design for maximum viral replay value.',
    descriptionBn: 'দ্রুত মাইক্রো-কাট, ডায়নামিক সাউন্ড এফেক্টস এবং সিমলেস লুপ ডিজাইন।',
    videoId: '1229891865',
    url: 'https://vimeo.com/1229891865?fl=ip&fe=ec',
    category: 'Reels & Shorts',
    tags: ['Reels', 'Fast-Pace', 'SFX Cue'],
    aspectRatio: '9:16',
    thumbnailUrl: 'https://i.vimeocdn.com/video/2204658559-8fd775c74b6aec8d5eec9579dbc375305eb233a231095976d0874b5feb0172f1-d_640.jpg',
    duration: '0:15',
    platform: 'vimeo'
  },
  {
    id: 'reel-3',
    title: 'Punchy Visual Teaser: Mobile Watch-Time Booster',
    titleBn: 'পাঞ্চি ভিজ্যুয়াল টিজার: মোবাইল ওয়াচ-টাইম বুস্টার',
    description: 'Ultra-condensed visual teaser engineered to trigger curiosity, shares, and high mobile watch time.',
    descriptionBn: 'মোবাইল ওয়াচ টাইম বৃদ্ধি ও কৌতুহল সৃষ্টির জন্য আল্ট্রা-কনডেন্সড ভিজ্যুয়াল টিজার।',
    videoId: '1229892420',
    url: 'https://vimeo.com/1229892420?fl=ip&fe=ec',
    category: 'Reels & Shorts',
    tags: ['Shorts', 'Teaser', 'High Watchtime'],
    aspectRatio: '9:16',
    thumbnailUrl: 'https://i.vimeocdn.com/video/2204658994-515f69118efee3bad9d950e427d1dee1d8d2ea26b0bb936f5768bcbdc595d73e-d_640.jpg',
    duration: '0:07',
    platform: 'vimeo'
  },
  {
    id: 'reel-4',
    title: 'Kinetic Motion Typography & Narrative Story Reel',
    titleBn: 'কাইনেটিক মোশন টাইপোগ্রাফি ও ন্যারেটিভ স্টোরি রিল',
    description: 'Engaging motion typography, stylized sound design, and smooth transitions tailored for Instagram & TikTok.',
    descriptionBn: 'আকর্ষণীয় মোশন টাইপোগ্রাফি, স্টাইলাইজড সাউন্ড ডিজাইন এবং মসৃণ ট্রানজিশন।',
    videoId: '1229892469',
    url: 'https://vimeo.com/1229892469?fl=ip&fe=ec',
    category: 'Reels & Shorts',
    tags: ['TikTok', 'Instagram', 'Typography'],
    aspectRatio: '9:16',
    thumbnailUrl: 'https://i.vimeocdn.com/video/2204659056-6cf0e62e5b4252996ae63f95aba59b88be00d8852044990ef3949f4d14ea5a5b-d_640.jpg',
    duration: '0:22',
    platform: 'vimeo'
  }
];

// ═════════════════════════════════════════════════════════════════════════
// 4. এআই ভিডিও (AI Generated & Futuristic Visuals Tray)
// ═════════════════════════════════════════════════════════════════════════
export const AI_PROJECTS: Project[] = [
  {
    id: 'ai-1',
    title: 'Generative AI Worldbuilding: Sci-Fi Visual Synthesis',
    titleBn: 'জেনারেটিভ এআই ওয়ার্ল্ডবিল্ডিং: সাই-ফাই ভিজ্যুয়াল সিন্থেসিস',
    description: 'Photorealistic AI generated scenes, cinematic pacing, and stylized visual storytelling exploring future frontiers.',
    descriptionBn: 'ফটোরিয়ালিস্টিক এআই ভিজ্যুয়াল, সিনেমাটিক পেসিং ও ভবিষ্যৎ মহাকাশ এক্সপ্লোরেশন স্টোরিটেলিং।',
    videoId: '1229886655',
    url: 'https://vimeo.com/1229886655?fl=ip&fe=ec',
    category: 'AI Generated Video',
    tags: ['Generative AI', 'Worldbuilding', 'Sci-Fi'],
    aspectRatio: '16:9',
    thumbnailUrl: 'https://i.vimeocdn.com/video/2204652061-cd51589c3309f10ea6724a62b58b880940e874e7e9c928f0e8d92496714fc664-d_640.jpg',
    duration: '0:49',
    platform: 'vimeo',
    featured: true
  },
  {
    id: 'ai-2',
    title: 'Cybernetic Concept: Futuristic Aesthetic & Soundscape',
    titleBn: 'সাইবারনেটিক কনসেপ্ট: ফিউচারিস্টিক নান্দনিকতা ও সাউন্ডস্কেপ',
    description: 'High-concept AI imagery fused with professional motion graphics, color depth, and atmosphere sound design.',
    descriptionBn: 'হাই-কনসেপ্ট এআই ভিজ্যুয়াল, প্রফেশনাল মোশন গ্রাফিক্স ও অ্যাটমোস্ফিয়ার সাউন্ড ডিজাইন।',
    videoId: '1229886882',
    url: 'https://vimeo.com/1229886882?fl=ip&fe=ec',
    category: 'AI Generated Video',
    tags: ['Cybernetic', 'Future Aesthetic', 'GenAI'],
    aspectRatio: '16:9',
    thumbnailUrl: 'https://i.vimeocdn.com/video/2204652277-a1c6e54d60e5ee2b57474796c0f9948da6cea63c9980a12a758dde61535bfc6a-d_640.jpg',
    duration: '0:20',
    platform: 'vimeo'
  },
  {
    id: 'ai-3',
    title: 'AI Narrative Cinema: Synthetic Voice & Visual Story',
    titleBn: 'এআই ন্যারেটিভ সিনেমা: সিন্থেটিক ভয়েস ও ভিজ্যুয়াল স্টোরি',
    description: 'Full-length AI visual narrative demonstrating prompt choreography, synthetic voice synthesis, and cinematic edit pacing.',
    descriptionBn: 'এআই ভিজ্যুয়াল ন্যারেটিভ, প্রম্পট কোরিওগ্রাফি, সিন্থেটিক ভয়েস এবং সিনেমাটিক এডিট পেসিং।',
    videoId: '1229886881',
    url: 'https://vimeo.com/1229886881?fl=ip&fe=ec',
    category: 'AI Generated Video',
    tags: ['AI Narrative', 'Cinematic', 'Visual FX'],
    aspectRatio: '16:9',
    thumbnailUrl: 'https://i.vimeocdn.com/video/2204652384-e9581b7b30f280b770972bf9ffd41783968480f70375397dfd4359aaf768a35f-d_640.jpg',
    duration: '1:01',
    platform: 'vimeo'
  }
];

// All 12 current videos combined in order
export const PROJECTS_DATA: Project[] = [
  ...ANIMATION_PROJECTS,
  ...PODCAST_PROJECTS,
  ...REELS_PROJECTS,
  ...AI_PROJECTS
];

export const FEATURED_TOP_PROJECT: Project = ANIMATION_PROJECTS[0];

export interface JourneyMilestone {
  category: string;
  role: string;
  subtitle: string;
  description: string;
  skills: string[];
  metrics: string[];
}

export const JOURNEY_MILESTONES: JourneyMilestone[] = [
  {
    category: 'PREMIER MILESTONE',
    role: 'Elite Video Editor & Narrative Visualizer',
    subtitle: 'High-Retention Narrative & Commercial Systems',
    description:
      'Architecting dynamic motion sequences, cinematic color grading, and retention-engineered pacing for commercial brands, YouTube creators, and global marketing funnels.',
    skills: ['Premiere Pro', 'After Effects', 'Sound Design', 'DaVinci Resolve', 'Audition'],
    metrics: ['100+ Master Edits', '98% Client Satisfaction', 'Average 85% Watch Retention']
  },
  {
    category: 'CREATIVE MASTERY',
    role: 'Kinetic Motion Designer & 2D/3D Specialist',
    subtitle: 'Micro-Animations, Typography & Visual Polish',
    description:
      'Choreographing kinetic typography, custom 2D vector animations, screen mockups, and dynamic lower-thirds that elevate brand identity and maximize visual engagement.',
    skills: ['After Effects', 'Kinetic Typography', 'Lottie / Vector', 'Photoshop', 'Illustrator'],
    metrics: ['Pixel-Perfect Animation', 'Smooth 60 FPS Renders', 'Custom Brand Toolkits']
  },
  {
    category: 'INNOVATION & FUTURE',
    role: 'Generative AI & Ad Conversion Strategist',
    subtitle: 'Next-Gen Visual Production Pipelines',
    description:
      'Integrating cutting-edge generative AI workflows (FlowAI, Midjourney, Runway, Gemini) to produce photorealistic assets, rapid viral conceptualization, and high-CTR advertising assets.',
    skills: ['Midjourney / GenAI', 'Runway / Pika', 'Prompt Choreography', 'Ad Funnels', 'Viral Strategy'],
    metrics: ['3x Accelerated Delivery', 'Viral Hook Architecture', 'High Ad ROAS']
  }
];

export interface SoftwareTool {
  name: string;
  stroke: string;
  fill: string;
  angle: number;
  desc: string;
  isCustom?: boolean;
  imgSrc?: string;
}

export const SOFTWARE_TOOLS: SoftwareTool[] = [
  {
    name: 'Pr',
    stroke: '#9999FF',
    fill: '#00005B',
    angle: 0,
    desc: 'Premiere Pro - Industry Standard Video Assembly, Timeline & Master Cuts'
  },
  {
    name: 'Ae',
    stroke: '#D291FF',
    fill: '#1E0038',
    angle: 60,
    desc: 'After Effects - Cinematic Motion Graphics, Kinetic Typography & VFX'
  },
  {
    name: 'Gemini',
    stroke: '#4E88FF',
    fill: '#0B1528',
    angle: 120,
    desc: 'Google Gemini - Advanced Creative Ideation & Video Script Structuring',
    isCustom: true,
    imgSrc: '/images/gemini.png'
  },
  {
    name: 'ChatGPT',
    stroke: '#10A37F',
    fill: '#062B22',
    angle: 180,
    desc: 'ChatGPT - High CTR Hook Formulation & Viral Audience Psychology',
    isCustom: true,
    imgSrc: '/images/chatgpt.png'
  },
  {
    name: 'FlowAI',
    stroke: '#F43F5E',
    fill: '#2B0B14',
    angle: 240,
    desc: 'FlowAI - Next-Gen Generative AI Asset Synthesis & Frame Choreography',
    isCustom: true,
    imgSrc: '/images/flowai.png'
  },
  {
    name: 'Ps',
    stroke: '#31A8FF',
    fill: '#001E36',
    angle: 300,
    desc: 'Photoshop - Master Thumbnail Architecture & Photorealistic Matte Painting'
  }
];

export interface JourneyItem {
  category: string;
  icon: string;
  role: string;
  subtitle: string;
  description: string;
  skills: string[];
  side: 'left' | 'right';
}

export const JOURNEY_DATA: JourneyItem[] = [
  {
    category: 'PHASE 01: FOUNDATIONS & ROOTS',
    icon: '🎬',
    role: 'Visual Editor & Creative Craftsman',
    subtitle: 'Precision Timeline Architecture (4+ Months Core)',
    description:
      'Initiated journey with deep focus on story pacing, timeline discipline, and frame-by-frame rhythm. Edited over 15+ comprehensive projects spanning commercials, podcasts, and shorts.',
    skills: ['Premiere Pro', 'After Effects', 'Pacing Architecture', 'Sound Design'],
    side: 'left'
  },
  {
    category: 'PHASE 02: KINETIC MASTERY',
    icon: '⚡',
    role: 'Motion Designer & Micro-Transitionist',
    subtitle: 'Kinetic Typography & Brand Motion Polish',
    description:
      'Elevated visual appeal by combining smooth keyframe dynamics, kinetic lower-thirds, vector animations, and speed-ramped transitions that captivate modern audiences.',
    skills: ['Motion Graphics', 'Kinetic Typography', 'VFX Micro-Cuts', 'Color Grading'],
    side: 'right'
  },
  {
    category: 'PHASE 03: NEXT-GEN AI & VIRALITY',
    icon: '🚀',
    role: 'AI Video Strategist & High-CTR Architect',
    subtitle: 'Modern Algorithmic Growth & Generative AI',
    description:
      'Spearheading the convergence of human editorial taste with cutting-edge AI pipelines (Gemini, FlowAI, Midjourney, ChatGPT) to deliver scroll-stopping visuals with high audience retention.',
    skills: ['Generative AI', 'Viral Hook Engineering', 'FlowAI & Gemini', 'Ad Optimization'],
    side: 'left'
  }
];

export interface SocialLink {
  name: string;
  url: string;
  imgSrc: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Facebook',
    url: 'https://facebook.com',
    imgSrc: '/images/icon_facebook.png'
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com',
    imgSrc: '/images/icon_instagram.png'
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com',
    imgSrc: '/images/icon_linkedin.png'
  },
  {
    name: 'X (Twitter)',
    url: 'https://x.com',
    imgSrc: '/images/icon_x.png'
  },
  {
    name: 'Behance',
    url: 'https://behance.net',
    imgSrc: '/images/icon_behance.png'
  },
  {
    name: 'Pinterest',
    url: 'https://pinterest.com',
    imgSrc: '/images/icon_pinterest.png'
  }
];

