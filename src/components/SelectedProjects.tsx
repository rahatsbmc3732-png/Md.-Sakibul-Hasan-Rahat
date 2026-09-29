import React, { useState, useEffect, useRef } from 'react';
import {
  Project,
  SAAS_ANIMATION_PROJECT,
  ANIMATION_PROJECTS as INITIAL_ANIMATION,
  PODCAST_PROJECTS as INITIAL_PODCAST,
  REELS_PROJECTS as INITIAL_REELS,
  AI_PROJECTS as INITIAL_AI,
} from '../data/portfolioData';
import {
  Play,
  X,
  ExternalLink,
  Film,
  Sparkles,
  Mic,
  Smartphone,
  Cpu,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  RotateCcw,
  Move,
  Check,
  Upload,
  Video,
  Plus,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  AlertTriangle,
  SlidersHorizontal,
  Layers,
  Palette,
  Settings,
  Edit3,
  Link2 as LinkIcon,
} from 'lucide-react';
import {
  saveVideoToIndexedDB,
  getVideoFromIndexedDB,
  deleteVideoFromIndexedDB,
  captureVideoThumbnail,
} from '../utils/videoStorage';
import {
  uploadMediaFileToServer,
  uploadBase64ImageToServer,
  saveSiteDataToServer,
  fetchSiteDataFromServer,
  recoverAndSyncIndexedDBMedia,
  ServerSiteData,
} from '../utils/apiSync';

interface SelectedProjectsProps {
  lang: 'EN' | 'BN';
  isCustomizeMode?: boolean;
  setIsCustomizeMode?: (v: boolean) => void;
  activeChapter?: 'video' | 'design';
  setActiveChapter?: (ch: 'video' | 'design') => void;
  viewMode?: 'audience' | 'owner';
}

// ═════════════════════════════════════════════════════════════════════════
// CORNER VIDEO PLAY LOGO (এক কর্নারে মার্জিত ডার্ক/কালো গ্লাস প্লে লোগো)
// ═════════════════════════════════════════════════════════════════════════
export const StandardCornerPlayIcon: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'sm' }) => {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-black/85 hover:bg-black border border-white/20 hover:border-white/40 shadow-[0_4px_14px_rgba(0,0,0,0.75)] backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-white/50 ${
        size === 'md' ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-7 h-7 sm:w-7.5 sm:h-7.5'
      }`}
      aria-label="Play video"
    >
      <Play
        size={size === 'md' ? 12 : 10}
        className="translate-x-0.5 fill-zinc-200 text-zinc-200 group-hover:fill-white group-hover:text-white transition-colors"
      />
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════
// WATER DROP PLAY ICON (ওয়াটার সিস্টেম লিকুইড গ্লাস ড্রপ ডিজাইন)
// ═════════════════════════════════════════════════════════════════════════
export const WaterDropPlayIcon: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const cfg = {
    sm: {
      wrapper: 'w-10 h-10',
      iconSize: 13,
      aura: '-inset-2',
      specular: 'w-2.5 h-1 top-1 left-2',
    },
    md: {
      wrapper: 'w-12 h-12 sm:w-13 sm:h-13',
      iconSize: 16,
      aura: '-inset-2.5',
      specular: 'w-3 h-1.5 top-1.5 left-2.5',
    },
    lg: {
      wrapper: 'w-16 h-16 sm:w-20 sm:h-20',
      iconSize: 24,
      aura: '-inset-3.5',
      specular: 'w-4 h-2 top-2 left-3',
    },
  }[size];

  return (
    <div className="relative flex items-center justify-center">
      {/* Aquatic Fluid Droplet Ambient Ripple */}
      <div
        className={`absolute ${cfg.aura} rounded-full bg-gradient-to-r from-cyan-400/40 via-sky-300/30 to-teal-300/40 blur-lg opacity-75 group-hover:opacity-100 group-hover:scale-135 transition-all duration-700 ease-out`}
      />
      {/* Secondary expanding water wave */}
      <div
        className={`absolute ${cfg.aura} rounded-full border border-cyan-300/50 opacity-0 group-hover:opacity-100 group-hover:scale-120 transition-all duration-700 ease-out pointer-events-none`}
      />

      {/* Main Glass Water Droplet Orb */}
      <div
        className={`relative ${cfg.wrapper} rounded-full bg-gradient-to-br from-cyan-300/45 via-sky-400/30 to-teal-500/40 backdrop-blur-xl border-2 border-white/70 shadow-[0_8px_30px_rgba(6,182,212,0.45),inset_0_2px_6px_rgba(255,255,255,0.7),inset_0_-2px_6px_rgba(8,145,178,0.4)] flex items-center justify-center transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_36px_rgba(6,182,212,0.7),inset_0_2px_8px_rgba(255,255,255,0.9)]`}
      >
        {/* Curved specular liquid highlight reflection */}
        <div
          className={`absolute ${cfg.specular} rounded-full bg-white/85 blur-[0.4px] rotate-[-30deg] pointer-events-none`}
        />
        <div className="absolute bottom-1 right-2 w-2 h-1 rounded-full bg-cyan-100/60 blur-[0.4px] pointer-events-none" />

        {/* Clean, luminous white play glyph */}
        <Play
          size={cfg.iconSize}
          className="translate-x-0.5 fill-white text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.95)] transition-transform duration-300 group-hover:scale-115"
        />
      </div>
    </div>
  );
};

export interface DeleteTarget {
  id: string;
  title: string;
  tray: 'saas' | 'anim' | 'podcast' | 'ai' | 'reels';
  thumbnailUrl?: string;
  project?: Project;
  originalIndex?: number;
  deletedAt?: string;
}

// ═════════════════════════════════════════════════════════════════════════
// VIMEO PRIVACY TOKENS & EMBED URL RESOLVER
// (Fixes Vimeo unlisted privacy embed error so all videos play instantly)
// ═════════════════════════════════════════════════════════════════════════
export const VIMEO_HASHES: Record<string, string> = {
  '1229887460': 'f2c962d794', // 01. Saas Animation Video (Featured Master Reel)
  '1229885859': '385982f17b', // 02. Speed Ramp & Commercial Animation Cut
  '1229885858': '20dfe9f7a6', // 03. Micro-Motion & Vector Choreography
  '1229886307': 'a42731e3c0', // Visual Storytelling & Narrative Podcast Edit
  '1229892284': 'f9ea98d46a', // Engaging Interview & Dialogue Flow
  '1229435636': '4c4985ff6c', // High-Converting Viral Hook & Kinetic Reel
  '1229891865': 'edcb6d984e', // Fast-Paced Micro-Engagement Short
  '1229892420': 'b5d5f31387', // Punchy Visual Teaser & Quick Impact
  '1229892469': '5fe64b73f4', // Kinetic Typography & Story Reel
  '1229886655': '3f3abb9292', // Generative AI Visual Synthesis & Worldbuilding
  '1229886882': 'd791d31650', // Cybernetic Concept & Future Aesthetic Edit
  '1229886881': 'e7d3d71f91', // AI Narrative Cinema & Visual Experiment
};

export const getVimeoEmbedUrl = (videoId: string, customUrl?: string) => {
  let hash = VIMEO_HASHES[videoId] || '';
  if (!hash && customUrl) {
    const hashMatch = customUrl.match(/[?&]h=([a-zA-Z0-9]+)/) || customUrl.match(/vimeo\.com\/\d+\/([a-zA-Z0-9]+)/);
    if (hashMatch) hash = hashMatch[1];
  }
  const hashParam = hash ? `&h=${hash}` : '';
  return `https://player.vimeo.com/video/${videoId}?autoplay=1&badge=0&autopause=0&player_id=0&app_id=58479${hashParam}`;
};

const STORAGE_KEY_SAAS = 'rahat_video_saas_anim_v5';
const STORAGE_KEY_ANIM = 'rahat_video_order_anim_v5';
const STORAGE_KEY_POD = 'rahat_video_order_pod_v5';
const STORAGE_KEY_AI = 'rahat_video_order_ai_v5';
const STORAGE_KEY_REELS = 'rahat_video_order_reels_v5';
const STORAGE_KEY_HEADLINES = 'rahat_custom_tray_headlines_v5';
const STORAGE_KEY_TRASH = 'rahat_video_recycle_bin_v5';
const STORAGE_KEY_PERMANENTLY_DELETED = 'rahat_video_permanently_deleted_v5';

interface CustomHeadlines {
  saas?: string;
  anim?: string;
  podcast?: string;
  ai?: string;
  reels?: string;
}

export const SelectedProjects: React.FC<SelectedProjectsProps> = ({
  lang,
  isCustomizeMode: propCustomizeMode,
  setIsCustomizeMode: propSetCustomizeMode,
  activeChapter: propChapter,
  setActiveChapter: propSetChapter,
  viewMode = 'audience',
}) => {
  const isOwner = viewMode === 'owner';
  const [internalCustomizeMode, setInternalCustomizeMode] = useState(false);
  const isCustomizeMode = isOwner ? (propCustomizeMode !== undefined ? propCustomizeMode : internalCustomizeMode) : false;
  const setIsCustomizeMode = propSetCustomizeMode || setInternalCustomizeMode;

  const [internalChapter, setInternalChapter] = useState<'video' | 'design'>('video');
  const effectiveChapter = propChapter !== undefined ? propChapter : internalChapter;
  const setActiveChapter = propSetChapter || setInternalChapter;

  type VideoTrayType = 'saas' | 'anim' | 'podcast' | 'ai' | 'reels';

  const [activeTray, setActiveTray] = useState<'all' | 'anim' | 'podcast' | 'ai' | 'reels'>('all');
  const [activeVideo, setActiveVideo] = useState<Project | null>(null);

  // Drag & Reorder State (Supports cross-tray dragging between Motion, Podcast, AI, and Reels)
  const [draggedItem, setDraggedItem] = useState<{ tray: VideoTrayType; index: number; project?: Project } | null>(null);
  const [dragOverTray, setDragOverTray] = useState<VideoTrayType | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [reorderNotification, setReorderNotification] = useState<string | null>(null);

  // In-App Reliable Deletion System (100% works in iFrames, no window.confirm blocks)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [lastDeletedItem, setLastDeletedItem] = useState<DeleteTarget | null>(null);
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState<boolean>(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState<boolean>(false);
  const [showRestoredBanner, setShowRestoredBanner] = useState<boolean>(false);

  // Permanently deleted IDs state
  const [permanentlyDeletedIds, setPermanentlyDeletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PERMANENTLY_DELETED);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Trash history state (Recycle Bin)
  const [trashItems, setTrashItems] = useState<DeleteTarget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRASH) || localStorage.getItem('rahat_video_trash_history_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Video Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadSourceType, setUploadSourceType] = useState<'file' | 'url'>('file');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadVideoUrl, setUploadVideoUrl] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'anim' | 'podcast' | 'ai' | 'reels'>('anim');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadDuration, setUploadDuration] = useState('0:30');
  const [uploadTags, setUploadTags] = useState('Motion, Commercial');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // SaaS Master Reel Customization Modal State (User can replace/change this video anytime)
  const [isChangeSaasModalOpen, setIsChangeSaasModalOpen] = useState(false);
  const [saasSourceType, setSaasSourceType] = useState<'file' | 'url'>('file');
  const [saasUploadFile, setSaasUploadFile] = useState<File | null>(null);
  const [saasVideoUrl, setSaasVideoUrl] = useState('');
  const [saasTitle, setSaasTitle] = useState('');
  const [saasDescription, setSaasDescription] = useState('');
  const [saasDuration, setSaasDuration] = useState('0:05');
  const [saasPreviewUrl, setSaasPreviewUrl] = useState<string | null>(null);
  const [saasThumbPreview, setSaasThumbPreview] = useState<string | null>(null);
  const [isProcessingSaas, setIsProcessingSaas] = useState(false);
  const [saasUpdateSuccess, setSaasUpdateSuccess] = useState(false);
  const saasVideoInputRef = useRef<HTMLInputElement>(null);
  const saasThumbInputRef = useRef<HTMLInputElement>(null);
  const saasDirectFileInputRef = useRef<HTMLInputElement>(null);

  // Universal Video Change / Edit Modal State (Owner can replace ANY video file or link, thumbnail, title)
  const [editingVideoItem, setEditingVideoItem] = useState<{
    project: Project;
    tray: 'saas' | 'anim' | 'podcast' | 'ai' | 'reels';
  } | null>(null);
  const [editVideoSourceType, setEditVideoSourceType] = useState<'file' | 'url'>('url');
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editVideoTitle, setEditVideoTitle] = useState('');
  const [editVideoTitleBn, setEditVideoTitleBn] = useState('');
  const [editVideoDescription, setEditVideoDescription] = useState('');
  const [editVideoDuration, setEditVideoDuration] = useState('0:30');
  const [editVideoPreviewUrl, setEditVideoPreviewUrl] = useState<string | null>(null);
  const [editVideoThumbPreview, setEditVideoThumbPreview] = useState<string | null>(null);
  const [isProcessingEditVideo, setIsProcessingEditVideo] = useState(false);
  const [editVideoSuccess, setEditVideoSuccess] = useState(false);
  const editVideoFileInputRef = useRef<HTMLInputElement>(null);
  const editVideoThumbInputRef = useRef<HTMLInputElement>(null);

  // 0. SaaS Animation Video
  const [saasProject, setSaasProject] = useState<Project | null>(() => {
    try {
      const permDeleted = localStorage.getItem(STORAGE_KEY_PERMANENTLY_DELETED);
      const permSet = permDeleted ? new Set(JSON.parse(permDeleted)) : new Set();
      const trashSaved = localStorage.getItem(STORAGE_KEY_TRASH) || localStorage.getItem('rahat_video_trash_history_v2');
      const trashList: DeleteTarget[] = trashSaved ? JSON.parse(trashSaved) : [];
      if (trashList.some((t) => t.id === 'saas-anim-featured' || t.id === 'anim-1' || t.tray === 'saas') || permSet.has('saas-anim-featured') || permSet.has('anim-1')) {
        return null;
      }
      const saved = localStorage.getItem(STORAGE_KEY_SAAS) || localStorage.getItem('rahat_video_saas_anim_v2');
      if (saved === 'deleted') return null;
      if (saved) {
        const parsed: Project = JSON.parse(saved);
        if (parsed.url && parsed.url.startsWith('blob:') && !parsed.isUserUploaded) {
          return SAAS_ANIMATION_PROJECT;
        }
        return parsed;
      }
    } catch {}
    return SAAS_ANIMATION_PROJECT;
  });

  // 1. Animation Projects State (No auto-resurrection bug: user's deletions stay deleted!)
  const [animProjects, setAnimProjects] = useState<Project[]>(() => {
    try {
      const permDeleted = localStorage.getItem(STORAGE_KEY_PERMANENTLY_DELETED);
      const permSet = permDeleted ? new Set(JSON.parse(permDeleted)) : new Set();
      const trashSaved = localStorage.getItem(STORAGE_KEY_TRASH) || localStorage.getItem('rahat_video_trash_history_v2');
      const trashList: DeleteTarget[] = trashSaved ? JSON.parse(trashSaved) : [];
      const trashSet = new Set(trashList.map((t) => t.id));

      const saved = localStorage.getItem(STORAGE_KEY_ANIM) || localStorage.getItem('rahat_video_order_anim_v4');
      if (saved) {
        const parsed: Project[] = JSON.parse(saved);
        return parsed.filter((p) => !trashSet.has(p.id) && !permSet.has(p.id));
      }
      return INITIAL_ANIMATION.filter((p) => !trashSet.has(p.id) && !permSet.has(p.id));
    } catch {}
    return INITIAL_ANIMATION;
  });

  // 2. Podcast Projects State
  const [podcastProjects, setPodcastProjects] = useState<Project[]>(() => {
    try {
      const permDeleted = localStorage.getItem(STORAGE_KEY_PERMANENTLY_DELETED);
      const permSet = permDeleted ? new Set(JSON.parse(permDeleted)) : new Set();
      const trashSaved = localStorage.getItem(STORAGE_KEY_TRASH) || localStorage.getItem('rahat_video_trash_history_v2');
      const trashList: DeleteTarget[] = trashSaved ? JSON.parse(trashSaved) : [];
      const trashSet = new Set(trashList.map((t) => t.id));

      const saved = localStorage.getItem(STORAGE_KEY_POD) || localStorage.getItem('rahat_video_order_pod_v4');
      if (saved) {
        const parsed: Project[] = JSON.parse(saved);
        return parsed.filter((p) => !trashSet.has(p.id) && !permSet.has(p.id));
      }
      return INITIAL_PODCAST.filter((p) => !trashSet.has(p.id) && !permSet.has(p.id));
    } catch {}
    return INITIAL_PODCAST;
  });

  // 3. AI Projects State
  const [aiProjects, setAiProjects] = useState<Project[]>(() => {
    try {
      const permDeleted = localStorage.getItem(STORAGE_KEY_PERMANENTLY_DELETED);
      const permSet = permDeleted ? new Set(JSON.parse(permDeleted)) : new Set();
      const trashSaved = localStorage.getItem(STORAGE_KEY_TRASH) || localStorage.getItem('rahat_video_trash_history_v2');
      const trashList: DeleteTarget[] = trashSaved ? JSON.parse(trashSaved) : [];
      const trashSet = new Set(trashList.map((t) => t.id));

      const saved = localStorage.getItem(STORAGE_KEY_AI) || localStorage.getItem('rahat_video_order_ai_v4');
      if (saved) {
        const parsed: Project[] = JSON.parse(saved);
        return parsed.filter((p) => !trashSet.has(p.id) && !permSet.has(p.id));
      }
      return INITIAL_AI.filter((p) => !trashSet.has(p.id) && !permSet.has(p.id));
    } catch {}
    return INITIAL_AI;
  });

  // 4. Reels Projects State (Last tray)
  const [reelsProjects, setReelsProjects] = useState<Project[]>(() => {
    try {
      const permDeleted = localStorage.getItem(STORAGE_KEY_PERMANENTLY_DELETED);
      const permSet = permDeleted ? new Set(JSON.parse(permDeleted)) : new Set();
      const trashSaved = localStorage.getItem(STORAGE_KEY_TRASH) || localStorage.getItem('rahat_video_trash_history_v2');
      const trashList: DeleteTarget[] = trashSaved ? JSON.parse(trashSaved) : [];
      const trashSet = new Set(trashList.map((t) => t.id));

      const saved = localStorage.getItem(STORAGE_KEY_REELS) || localStorage.getItem('rahat_video_order_reels_v4');
      if (saved) {
        const parsed: Project[] = JSON.parse(saved);
        return parsed.filter((p) => !trashSet.has(p.id) && !permSet.has(p.id));
      }
      return INITIAL_REELS.filter((p) => !trashSet.has(p.id) && !permSet.has(p.id));
    } catch {}
    return INITIAL_REELS;
  });

  // Custom Tray Headlines & Text Customization State
  const [customHeadlines, setCustomHeadlines] = useState<CustomHeadlines>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HEADLINES) || localStorage.getItem('rahat_custom_tray_headlines_v3');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HEADLINES, JSON.stringify(customHeadlines));
    } catch {}
  }, [customHeadlines]);

  const getHeadline = (key: 'saas' | 'anim' | 'podcast' | 'ai' | 'reels') => {
    if (customHeadlines[key]) return customHeadlines[key]!;
    if (key === 'saas') return lang === 'EN' ? 'SaaS Animation' : 'সাস অ্যানিমেশন';
    if (key === 'anim') return lang === 'EN' ? 'Animation & Motion Design' : 'এনিমেশন ও মোশন ডিজাইন';
    if (key === 'podcast') return lang === 'EN' ? 'Podcast Videos' : 'পডকাস্ট ভিডিও';
    if (key === 'ai') return lang === 'EN' ? 'AI Cinematic Videos' : 'এআই ভিডিও';
    if (key === 'reels') return lang === 'EN' ? 'Social Reels & Shorts' : 'রিলস ও শর্টস';
    return '';
  };

  const getSaasTitle = () => {
    if (saasProject?.title && saasProject.title !== '01. Saas Animation Video') {
      if (lang === 'BN' && saasProject.titleBn) return saasProject.titleBn;
      return saasProject.title;
    }
    return lang === 'EN' ? 'SaaS Animation' : 'সাস অ্যানিমেশন';
  };

  // Text Edit Modal State (Allows Owner to customize any video title or tray headline)
  const [textEditModal, setTextEditModal] = useState<{
    isOpen: boolean;
    type: 'video' | 'headline';
    id: string;
    tray?: 'saas' | 'anim' | 'podcast' | 'ai' | 'reels';
    currentText: string;
    titleLabel: string;
  }>({
    isOpen: false,
    type: 'video',
    id: '',
    currentText: '',
    titleLabel: '',
  });
  const [textEditValue, setTextEditValue] = useState('');

  const openTextEditModal = (config: {
    type: 'video' | 'headline';
    id: string;
    tray?: 'saas' | 'anim' | 'podcast' | 'ai' | 'reels';
    currentText: string;
    titleLabel: string;
  }) => {
    setTextEditModal({
      isOpen: true,
      type: config.type,
      id: config.id,
      tray: config.tray,
      currentText: config.currentText,
      titleLabel: config.titleLabel,
    });
    setTextEditValue(config.currentText);
  };

  const handleSaveCustomText = () => {
    const trimmed = textEditValue.trim();
    if (!trimmed) return;

    if (textEditModal.type === 'headline') {
      const key = textEditModal.id as 'saas' | 'anim' | 'podcast' | 'ai' | 'reels';
      setCustomHeadlines((prev) => ({
        ...prev,
        [key]: trimmed,
      }));
      setReorderNotification(lang === 'EN' ? 'Headline updated!' : 'হেডলাইন আপডেট হয়েছে!');
    } else if (textEditModal.type === 'video') {
      if (textEditModal.tray === 'saas' || textEditModal.id === 'anim-1' || textEditModal.id === (saasProject?.id || '')) {
        setSaasProject((prev) => (prev ? { ...prev, title: trimmed } : null));
      }
      if (textEditModal.tray === 'anim' || textEditModal.id.startsWith('anim-')) {
        setAnimProjects((prev) => prev.map((p) => (p.id === textEditModal.id ? { ...p, title: trimmed } : p)));
      }
      if (textEditModal.tray === 'podcast' || textEditModal.id.startsWith('pod-')) {
        setPodcastProjects((prev) => prev.map((p) => (p.id === textEditModal.id ? { ...p, title: trimmed } : p)));
      }
      if (textEditModal.tray === 'ai' || textEditModal.id.startsWith('ai-')) {
        setAiProjects((prev) => prev.map((p) => (p.id === textEditModal.id ? { ...p, title: trimmed } : p)));
      }
      if (textEditModal.tray === 'reels' || textEditModal.id.startsWith('reel-')) {
        setReelsProjects((prev) => prev.map((p) => (p.id === textEditModal.id ? { ...p, title: trimmed } : p)));
      }
      setReorderNotification(lang === 'EN' ? 'Title updated!' : 'শিরোনাম আপডেট হয়েছে!');
    }

    setTextEditModal((prev) => ({ ...prev, isOpen: false }));
    setTimeout(() => setReorderNotification(null), 3000);
  };

  const isHydratedRef = useRef(false);

  // Central Server Hydration & IndexedDB Media Recovery Effect
  useEffect(() => {
    let isCancelled = false;

    const initData = async () => {
      try {
        // 1. Fetch persistent site data from server backend (shared across all visitors & refreshes)
        const serverData = await fetchSiteDataFromServer();
        if (serverData && !isCancelled) {
          if (serverData.saasProject !== undefined) {
            setSaasProject(serverData.saasProject);
            try {
              localStorage.setItem(STORAGE_KEY_SAAS, JSON.stringify(serverData.saasProject));
            } catch {}
          }
          if (serverData.animProjects && Array.isArray(serverData.animProjects) && serverData.animProjects.length > 0) {
            setAnimProjects(serverData.animProjects);
            try {
              localStorage.setItem(STORAGE_KEY_ANIM, JSON.stringify(serverData.animProjects));
            } catch {}
          }
          if (serverData.podcastProjects && Array.isArray(serverData.podcastProjects) && serverData.podcastProjects.length > 0) {
            setPodcastProjects(serverData.podcastProjects);
            try {
              localStorage.setItem(STORAGE_KEY_POD, JSON.stringify(serverData.podcastProjects));
            } catch {}
          }
          if (serverData.aiProjects && Array.isArray(serverData.aiProjects) && serverData.aiProjects.length > 0) {
            setAiProjects(serverData.aiProjects);
            try {
              localStorage.setItem(STORAGE_KEY_AI, JSON.stringify(serverData.aiProjects));
            } catch {}
          }
          if (serverData.reelsProjects && Array.isArray(serverData.reelsProjects) && serverData.reelsProjects.length > 0) {
            setReelsProjects(serverData.reelsProjects);
            try {
              localStorage.setItem(STORAGE_KEY_REELS, JSON.stringify(serverData.reelsProjects));
            } catch {}
          }
          if (serverData.customHeadlines && typeof serverData.customHeadlines === 'object') {
            setCustomHeadlines(serverData.customHeadlines);
            try {
              localStorage.setItem(STORAGE_KEY_HEADLINES, JSON.stringify(serverData.customHeadlines));
            } catch {}
          }
          if (serverData.trashItems && Array.isArray(serverData.trashItems)) {
            setTrashItems(serverData.trashItems);
            try {
              localStorage.setItem(STORAGE_KEY_TRASH, JSON.stringify(serverData.trashItems));
            } catch {}
          }
          if (serverData.permanentlyDeletedIds && Array.isArray(serverData.permanentlyDeletedIds)) {
            setPermanentlyDeletedIds(serverData.permanentlyDeletedIds);
            try {
              localStorage.setItem(STORAGE_KEY_PERMANENTLY_DELETED, JSON.stringify(serverData.permanentlyDeletedIds));
            } catch {}
          }
        }

        // 2. Recover any media blobs from IndexedDB (e.g. videos uploaded by user that were lost on previous refresh)
        const recoveredMap = await recoverAndSyncIndexedDBMedia();
        if (Object.keys(recoveredMap).length > 0 && !isCancelled) {
          let updatedAny = false;

          for (const [recId, rec] of Object.entries(recoveredMap)) {
            // Restore Saas Master Reel if matched
            if (recId === 'saas-anim-featured' || saasProject?.id === recId || (saasProject && saasProject.url?.startsWith('blob:'))) {
              setSaasProject((prev) => {
                const base = prev || SAAS_ANIMATION_PROJECT;
                const next: Project = {
                  ...base,
                  url: rec.url,
                  localVideoUrl: rec.url,
                  thumbnailUrl: rec.thumbUrl || base.thumbnailUrl,
                  platform: 'file',
                  isUserUploaded: true,
                };
                try {
                  localStorage.setItem(STORAGE_KEY_SAAS, JSON.stringify(next));
                } catch {}
                return next;
              });
              updatedAny = true;
            }

            // Restore in animation projects
            setAnimProjects((prev) => {
              const idx = prev.findIndex((p) => p.id === recId || (p.isUserUploaded && p.url?.startsWith('blob:')));
              if (idx !== -1) {
                const next = [...prev];
                next[idx] = {
                  ...next[idx],
                  url: rec.url,
                  localVideoUrl: rec.url,
                  thumbnailUrl: rec.thumbUrl || next[idx].thumbnailUrl,
                  platform: 'file',
                  isUserUploaded: true,
                };
                try { localStorage.setItem(STORAGE_KEY_ANIM, JSON.stringify(next)); } catch {}
                updatedAny = true;
                return next;
              }
              return prev;
            });
          }

          if (updatedAny) {
            saveSiteDataToServer({});
          }
        } else if (!serverData) {
          // If server was completely empty, seed server with initial state
          saveSiteDataToServer({});
        }
      } catch (err) {
        console.warn('SelectedProjects hydration error:', err);
      } finally {
        if (!isCancelled) {
          isHydratedRef.current = true;
        }
      }
    };

    initData();

    const handleServerSync = (e: Event) => {
      const customEvent = e as CustomEvent<ServerSiteData>;
      const d = customEvent.detail;
      if (d) {
        if (d.saasProject !== undefined) setSaasProject(d.saasProject);
        if (d.animProjects) setAnimProjects(d.animProjects);
        if (d.podcastProjects) setPodcastProjects(d.podcastProjects);
        if (d.aiProjects) setAiProjects(d.aiProjects);
        if (d.reelsProjects) setReelsProjects(d.reelsProjects);
        if (d.customHeadlines) setCustomHeadlines(d.customHeadlines);
        if (d.trashItems) setTrashItems(d.trashItems);
        if (d.permanentlyDeletedIds) setPermanentlyDeletedIds(d.permanentlyDeletedIds);
      }
    };
    window.addEventListener('rahat:data-synced-from-server', handleServerSync);

    return () => {
      isCancelled = true;
      window.removeEventListener('rahat:data-synced-from-server', handleServerSync);
    };
  }, []);

  // Persist Saas Video
  useEffect(() => {
    try {
      if (saasProject === null) {
        localStorage.setItem(STORAGE_KEY_SAAS, 'deleted');
      } else {
        localStorage.setItem(STORAGE_KEY_SAAS, JSON.stringify(saasProject));
      }
    } catch {}
    if (isHydratedRef.current) {
      saveSiteDataToServer({ saasProject });
    }
  }, [saasProject]);

  // Persist order changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANIM, JSON.stringify(animProjects));
    } catch {}
    if (isHydratedRef.current) {
      saveSiteDataToServer({ animProjects });
    }
  }, [animProjects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_POD, JSON.stringify(podcastProjects));
    } catch {}
    if (isHydratedRef.current) {
      saveSiteDataToServer({ podcastProjects });
    }
  }, [podcastProjects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AI, JSON.stringify(aiProjects));
    } catch {}
    if (isHydratedRef.current) {
      saveSiteDataToServer({ aiProjects });
    }
  }, [aiProjects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REELS, JSON.stringify(reelsProjects));
    } catch {}
    if (isHydratedRef.current) {
      saveSiteDataToServer({ reelsProjects });
    }
  }, [reelsProjects]);

  // Modal ESC Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveVideo(null);
        setIsUploadModalOpen(false);
        setIsChangeSaasModalOpen(false);
        setDeleteTarget(null);
        setIsManageModalOpen(false);
        setIsTrashModalOpen(false);
        setTextEditModal((prev) => ({ ...prev, isOpen: false }));
      }
    };

    if (activeVideo || isUploadModalOpen || isChangeSaasModalOpen || editingVideoItem || deleteTarget || isManageModalOpen || isTrashModalOpen || textEditModal.isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activeVideo, isUploadModalOpen, isChangeSaasModalOpen, editingVideoItem, deleteTarget, isManageModalOpen, isTrashModalOpen]);

  // Listen for owner bar trigger
  useEffect(() => {
    const handleTrigger = () => {
      if (isOwner) {
        setIsUploadModalOpen(true);
      }
    };
    window.addEventListener('rahat:open-upload-video-modal', handleTrigger);
    return () => window.removeEventListener('rahat:open-upload-video-modal', handleTrigger);
  }, [isOwner]);

  // Universal Edit Video Open Helper
  const openEditVideoModal = (project: Project, tray: 'saas' | 'anim' | 'podcast' | 'ai' | 'reels') => {
    setEditingVideoItem({ project, tray });
    setEditVideoTitle(project.title);
    setEditVideoTitleBn(project.titleBn || project.title);
    setEditVideoDescription(project.description || '');
    setEditVideoDuration(project.duration || '0:30');
    setEditVideoUrl(project.url || '');
    setEditVideoPreviewUrl(project.url || null);
    setEditVideoThumbPreview(project.thumbnailUrl || null);
    setEditVideoSourceType(project.platform === 'file' ? 'file' : 'url');
    setEditVideoFile(null);
    setEditVideoSuccess(false);
  };

  const handleEditVideoFileSelect = (file: File) => {
    setEditVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setEditVideoPreviewUrl(objectUrl);
    if (!editVideoTitle) {
      setEditVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleEditVideoCustomThumbnail = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setEditVideoThumbPreview(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEditVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideoItem) return;

    setIsProcessingEditVideo(true);
    try {
      const { project, tray } = editingVideoItem;
      let finalUrl = editVideoUrl;
      let platform = project.platform;
      let isUserUploaded = project.isUserUploaded;

      if (editVideoSourceType === 'file' && editVideoFile) {
        try {
          const serverUrl = await uploadMediaFileToServer(editVideoFile, editVideoFile.name);
          if (serverUrl) {
            finalUrl = serverUrl;
          }
        } catch (err) {
          console.warn('Edit video server upload failed:', err);
        }
        try {
          await saveVideoToIndexedDB(project.id, editVideoFile, editVideoThumbPreview || undefined);
        } catch {}
        if (!finalUrl) finalUrl = URL.createObjectURL(editVideoFile);
        platform = 'file';
        isUserUploaded = true;
      }
      let finalThumb = editVideoThumbPreview;
      if (editVideoThumbPreview && editVideoThumbPreview.startsWith('data:')) {
        try {
          const thumbUrl = await uploadBase64ImageToServer(editVideoThumbPreview, `${project.id}_thumb`);
          if (thumbUrl) finalThumb = thumbUrl;
        } catch {}
      }

      const updatedProject: Project = {
        ...project,
        title: editVideoTitle.trim() || project.title,
        titleBn: editVideoTitleBn.trim() || editVideoTitle.trim() || project.title,
        description: editVideoDescription.trim() || project.description,
        descriptionBn: editVideoDescription.trim() || project.descriptionBn,
        duration: editVideoDuration.trim() || project.duration,
        url: finalUrl || project.url,
        thumbnailUrl: finalThumb || project.thumbnailUrl,
        platform,
        isUserUploaded,
        localVideoUrl: finalUrl || project.url,
      };

      if (tray === 'saas') {
        setSaasProject(updatedProject);
        try {
          localStorage.setItem(STORAGE_KEY_SAAS, JSON.stringify(updatedProject));
        } catch {}
      } else if (tray === 'anim') {
        setAnimProjects((prev) => {
          const next = prev.map((p) => (p.id === project.id ? updatedProject : p));
          try {
            localStorage.setItem(STORAGE_KEY_ANIM, JSON.stringify(next));
          } catch {}
          return next;
        });
      } else if (tray === 'podcast') {
        setPodcastProjects((prev) => {
          const next = prev.map((p) => (p.id === project.id ? updatedProject : p));
          try {
            localStorage.setItem(STORAGE_KEY_POD, JSON.stringify(next));
          } catch {}
          return next;
        });
      } else if (tray === 'ai') {
        setAiProjects((prev) => {
          const next = prev.map((p) => (p.id === project.id ? updatedProject : p));
          try {
            localStorage.setItem(STORAGE_KEY_AI, JSON.stringify(next));
          } catch {}
          return next;
        });
      } else if (tray === 'reels') {
        setReelsProjects((prev) => {
          const next = prev.map((p) => (p.id === project.id ? updatedProject : p));
          try {
            localStorage.setItem(STORAGE_KEY_REELS, JSON.stringify(next));
          } catch {}
          return next;
        });
      }

      await saveSiteDataToServer({
        saasProject: tray === 'saas' ? updatedProject : saasProject,
      });

      setEditVideoSuccess(true);
      setTimeout(() => {
        setIsProcessingEditVideo(false);
        setEditingVideoItem(null);
      }, 700);
    } catch {
      setIsProcessingEditVideo(false);
    }
  };

  // Scroll to Tray helper (Smooth scroll WITHOUT hiding other trays!)
  const handleScrollToTray = (trayId: 'all' | 'anim' | 'podcast' | 'ai' | 'reels') => {
    setActiveTray('all'); // Always ensure all trays stay 100% visible
    if (trayId !== 'all') {
      const el = document.getElementById(`tray-${trayId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Reset all video order & restore defaults for all trays
  const handleResetOrder = () => {
    setSaasProject(SAAS_ANIMATION_PROJECT);
    setAnimProjects(INITIAL_ANIMATION);
    setPodcastProjects(INITIAL_PODCAST);
    setAiProjects(INITIAL_AI);
    setReelsProjects(INITIAL_REELS);
    localStorage.removeItem(STORAGE_KEY_SAAS);
    localStorage.removeItem(STORAGE_KEY_ANIM);
    localStorage.removeItem(STORAGE_KEY_POD);
    localStorage.removeItem(STORAGE_KEY_AI);
    localStorage.removeItem(STORAGE_KEY_REELS);
    setReorderNotification(lang === 'EN' ? 'All trays restored with default videos!' : 'সবগুলো ট্রে মূল ভিডিওসহ ফিরিয়ে আনা হয়েছে!');
    setTimeout(() => setReorderNotification(null), 3000);
  };

  // Drag and drop handlers (Full Cross-Tray Drag-and-Drop between Motion, Podcast, AI, Reels)
  const handleDragStart = (tray: VideoTrayType, index: number, project: Project) => {
    setDraggedItem({ tray, index, project });
  };

  const handleDragOver = (e: React.DragEvent, tray: VideoTrayType, index?: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTray(tray);
    if (index !== undefined) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (targetTray: VideoTrayType, targetIndex: number) => {
    if (!draggedItem) {
      setDraggedItem(null);
      setDragOverIndex(null);
      setDragOverTray(null);
      return;
    }

    const { tray: sourceTray, index: sourceIndex, project: movingItem } = draggedItem;

    if (targetTray === 'saas') {
      // Promoted to Top Single Featured Video!
      if (sourceTray !== 'saas') {
        const prevSaas = saasProject || SAAS_ANIMATION_PROJECT;
        let movingProj = movingItem;
        if (!movingProj) {
          if (sourceTray === 'anim') movingProj = animProjects[sourceIndex];
          else if (sourceTray === 'podcast') movingProj = podcastProjects[sourceIndex];
          else if (sourceTray === 'ai') movingProj = aiProjects[sourceIndex];
          else if (sourceTray === 'reels') movingProj = reelsProjects[sourceIndex];
        }

        if (movingProj) {
          // Remove from source tray
          if (sourceTray === 'anim') setAnimProjects((prev) => prev.filter((_, i) => i !== sourceIndex));
          else if (sourceTray === 'podcast') setPodcastProjects((prev) => prev.filter((_, i) => i !== sourceIndex));
          else if (sourceTray === 'ai') setAiProjects((prev) => prev.filter((_, i) => i !== sourceIndex));
          else if (sourceTray === 'reels') setReelsProjects((prev) => prev.filter((_, i) => i !== sourceIndex));

          // Set as new top featured video
          const promoted: Project = { ...movingProj, featured: true };
          setSaasProject(promoted);
          try {
            localStorage.setItem(STORAGE_KEY_SAAS, JSON.stringify(promoted));
          } catch {}

          // Place previous saas video into source tray
          if (sourceTray === 'anim') setAnimProjects((prev) => [prevSaas, ...prev]);
          else if (sourceTray === 'podcast') setPodcastProjects((prev) => [prevSaas, ...prev]);
          else if (sourceTray === 'ai') setAiProjects((prev) => [prevSaas, ...prev]);
          else if (sourceTray === 'reels') setReelsProjects((prev) => [prevSaas, ...prev]);

          setReorderNotification(
            lang === 'EN'
              ? `"${promoted.title}" is now the Top Featured Video!`
              : `"${promoted.title}" সফলভাবে প্রথম সারির মূল ভিডিও হিসেবে যুক্ত হয়েছে!`
          );
        }
      }
    } else if (sourceTray === 'saas') {
      // Dragged top featured video into a lower tray
      const currentSaas = saasProject || SAAS_ANIMATION_PROJECT;
      let targetList: Project[] = [];
      if (targetTray === 'anim') targetList = animProjects;
      else if (targetTray === 'podcast') targetList = podcastProjects;
      else if (targetTray === 'ai') targetList = aiProjects;
      else if (targetTray === 'reels') targetList = reelsProjects;

      if (targetList.length > 0) {
        const swapIdx = Math.min(Math.max(0, targetIndex), targetList.length - 1);
        const newSaas = targetList[swapIdx];
        setSaasProject(newSaas);
        try {
          localStorage.setItem(STORAGE_KEY_SAAS, JSON.stringify(newSaas));
        } catch {}

        const updated = [...targetList];
        updated[swapIdx] = currentSaas;
        if (targetTray === 'anim') setAnimProjects(updated);
        else if (targetTray === 'podcast') setPodcastProjects(updated);
        else if (targetTray === 'ai') setAiProjects(updated);
        else if (targetTray === 'reels') setReelsProjects(updated);

        setReorderNotification(
          lang === 'EN'
            ? `"${newSaas.title}" swapped to Top Featured!`
            : `"${newSaas.title}" প্রথম সারির ভিডিও হিসেবে স্থানান্তর হয়েছে!`
        );
      }
    } else if (sourceTray === targetTray) {
      if (sourceIndex === targetIndex) {
        setDraggedItem(null);
        setDragOverIndex(null);
        setDragOverTray(null);
        return;
      }
      if (targetTray === 'anim') {
        const updated = [...animProjects];
        const [moved] = updated.splice(sourceIndex, 1);
        updated.splice(targetIndex, 0, moved);
        setAnimProjects(updated);
      } else if (targetTray === 'podcast') {
        const updated = [...podcastProjects];
        const [moved] = updated.splice(sourceIndex, 1);
        updated.splice(targetIndex, 0, moved);
        setPodcastProjects(updated);
      } else if (targetTray === 'ai') {
        const updated = [...aiProjects];
        const [moved] = updated.splice(sourceIndex, 1);
        updated.splice(targetIndex, 0, moved);
        setAiProjects(updated);
      } else if (targetTray === 'reels') {
        const updated = [...reelsProjects];
        const [moved] = updated.splice(sourceIndex, 1);
        updated.splice(targetIndex, 0, moved);
        setReelsProjects(updated);
      }

      setReorderNotification(
        lang === 'EN' ? 'Video repositioned successfully! Saved.' : 'ভিডিও পজিশন সফলভাবে পরিবর্তন ও সেভ হয়েছে।'
      );
    } else {
      // Cross-tray drop!
      let item: Project | undefined = movingItem;
      if (!item) {
        if (sourceTray === 'anim') item = animProjects[sourceIndex];
        else if (sourceTray === 'podcast') item = podcastProjects[sourceIndex];
        else if (sourceTray === 'ai') item = aiProjects[sourceIndex];
        else if (sourceTray === 'reels') item = reelsProjects[sourceIndex];
      }

      // Remove from source tray
      if (sourceTray === 'anim') setAnimProjects((prev) => prev.filter((_, i) => i !== sourceIndex));
      else if (sourceTray === 'podcast') setPodcastProjects((prev) => prev.filter((_, i) => i !== sourceIndex));
      else if (sourceTray === 'ai') setAiProjects((prev) => prev.filter((_, i) => i !== sourceIndex));
      else if (sourceTray === 'reels') setReelsProjects((prev) => prev.filter((_, i) => i !== sourceIndex));

      if (item) {
        const adjusted: Project = {
          ...item,
          category:
            targetTray === 'anim'
              ? 'Animation & Motion'
              : targetTray === 'podcast'
              ? 'Podcast & Long-Form'
              : targetTray === 'ai'
              ? 'AI Generated Video'
              : 'Reels & Shorts',
          aspectRatio: targetTray === 'reels' ? '9:16' : '16:9',
        };

        const insertInto = (list: Project[], setter: React.Dispatch<React.SetStateAction<Project[]>>) => {
          const next = [...list];
          const dest = Math.min(Math.max(0, targetIndex), next.length);
          next.splice(dest, 0, adjusted);
          setter(next);
        };

        if (targetTray === 'anim') insertInto(animProjects, setAnimProjects);
        else if (targetTray === 'podcast') insertInto(podcastProjects, setPodcastProjects);
        else if (targetTray === 'ai') insertInto(aiProjects, setAiProjects);
        else if (targetTray === 'reels') insertInto(reelsProjects, setReelsProjects);

        const trayTitle = {
          saas: lang === 'EN' ? 'Featured Master' : 'ফিচার্ড মাস্টার',
          anim: lang === 'EN' ? 'Animation & Motion' : 'এনিমেশন ও মোশন',
          podcast: lang === 'EN' ? 'Podcast' : 'পডকাস্ট',
          ai: lang === 'EN' ? 'AI Video' : 'এআই ভিডিও',
          reels: lang === 'EN' ? 'Viral Reels' : 'ভাইরাল রিলস',
        }[targetTray];

        setReorderNotification(
          lang === 'EN'
            ? `"${adjusted.title}" moved to ${trayTitle} tray!`
            : `"${adjusted.title}" ভিডিওটি টেনে ${trayTitle} ট্রেতে নেওয়া হয়েছে!`
        );
      }
    }

    setTimeout(() => setReorderNotification(null), 3500);
    setDraggedItem(null);
    setDragOverIndex(null);
    setDragOverTray(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
    setDragOverTray(null);
  };

  // Cross-Tray Move Setting Handler (Direct 1-click category move setting)
  const handleMoveToCategory = (
    sourceTray: VideoTrayType,
    sourceIndex: number,
    targetTray: VideoTrayType
  ) => {
    if (sourceTray === targetTray) return;
    let item: Project | null = null;
    if (sourceTray === 'saas') {
      item = saasProject || SAAS_ANIMATION_PROJECT;
    } else if (sourceTray === 'anim') {
      const list = [...animProjects];
      [item] = list.splice(sourceIndex, 1);
      setAnimProjects(list);
    } else if (sourceTray === 'podcast') {
      const list = [...podcastProjects];
      [item] = list.splice(sourceIndex, 1);
      setPodcastProjects(list);
    } else if (sourceTray === 'ai') {
      const list = [...aiProjects];
      [item] = list.splice(sourceIndex, 1);
      setAiProjects(list);
    } else if (sourceTray === 'reels') {
      const list = [...reelsProjects];
      [item] = list.splice(sourceIndex, 1);
      setReelsProjects(list);
    }

    if (!item) return;

    if (targetTray === 'saas') {
      const prevSaas = saasProject || SAAS_ANIMATION_PROJECT;
      const promoted = { ...item, featured: true };
      setSaasProject(promoted);
      try {
        localStorage.setItem(STORAGE_KEY_SAAS, JSON.stringify(promoted));
      } catch {}

      if (sourceTray === 'anim') setAnimProjects((prev) => [prevSaas, ...prev]);
      else if (sourceTray === 'podcast') setPodcastProjects((prev) => [prevSaas, ...prev]);
      else if (sourceTray === 'ai') setAiProjects((prev) => [prevSaas, ...prev]);
      else if (sourceTray === 'reels') setReelsProjects((prev) => [prevSaas, ...prev]);

      setReorderNotification(
        lang === 'EN'
          ? `"${promoted.title}" is now the Top Featured Video!`
          : `"${promoted.title}" সফলভাবে প্রথম সারির মূল ভিডিওতে যুক্ত হয়েছে!`
      );
      setTimeout(() => setReorderNotification(null), 3500);
      return;
    }

    const adjusted: Project = {
      ...item,
      category:
        targetTray === 'anim'
          ? 'Animation & Motion'
          : targetTray === 'podcast'
          ? 'Podcast & Long-Form'
          : targetTray === 'ai'
          ? 'AI Generated Video'
          : 'Reels & Shorts',
      aspectRatio: targetTray === 'reels' ? '9:16' : '16:9',
    };

    if (targetTray === 'anim') setAnimProjects((prev) => [adjusted, ...prev]);
    else if (targetTray === 'podcast') setPodcastProjects((prev) => [adjusted, ...prev]);
    else if (targetTray === 'ai') setAiProjects((prev) => [adjusted, ...prev]);
    else if (targetTray === 'reels') setReelsProjects((prev) => [adjusted, ...prev]);

    const trayTitle = {
      saas: lang === 'EN' ? 'Featured Master' : 'ফিচার্ড মাস্টার',
      anim: lang === 'EN' ? 'Animation & Motion' : 'এনিমーション ও মোশন',
      podcast: lang === 'EN' ? 'Podcast' : 'পডকাস্ট',
      ai: lang === 'EN' ? 'AI Video' : 'এআই ভিডিও',
      reels: lang === 'EN' ? 'Viral Reels' : 'ভাইরাল রিলস',
    }[targetTray];

    setReorderNotification(
      lang === 'EN'
        ? `"${adjusted.title}" moved to ${trayTitle} tray!`
        : `"${adjusted.title}" সফলভাবে ${trayTitle} ট্রেতে স্থানান্তর করা হয়েছে!`
    );
    setTimeout(() => setReorderNotification(null), 3500);

    // Smooth scroll to destination tray
    handleScrollToTray(targetTray);
  };

  // Move Card Directional (Left / Right within tray)
  const handleMoveCard = (
    tray: 'anim' | 'podcast' | 'ai' | 'reels',
    index: number,
    direction: 'left' | 'right',
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const targetIndex = direction === 'left' ? index - 1 : index + 1;

    const moveInTray = (list: Project[], setter: React.Dispatch<React.SetStateAction<Project[]>>) => {
      if (targetIndex < 0 || targetIndex >= list.length) return;
      const updated = [...list];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      setter(updated);
    };

    if (tray === 'anim') moveInTray(animProjects, setAnimProjects);
    else if (tray === 'podcast') moveInTray(podcastProjects, setPodcastProjects);
    else if (tray === 'ai') moveInTray(aiProjects, setAiProjects);
    else if (tray === 'reels') moveInTray(reelsProjects, setReelsProjects);

    setReorderNotification(
      lang === 'EN' ? 'Video order updated!' : 'ভিডিওর অবস্থান পরিবর্তন হয়েছে!'
    );
    setTimeout(() => setReorderNotification(null), 2500);
  };

  // Helper to find tray for any video ID
  const findTrayForId = (id: string): 'saas' | 'anim' | 'podcast' | 'ai' | 'reels' => {
    if (saasProject?.id === id) return 'saas';
    if (animProjects.some((p) => p.id === id)) return 'anim';
    if (podcastProjects.some((p) => p.id === id)) return 'podcast';
    if (aiProjects.some((p) => p.id === id)) return 'ai';
    return 'reels';
  };

  // In-App Reliable Deletion System (100% works in iFrames, avoids blocked window.confirm)
  const promptDeleteVideo = (
    tray: 'saas' | 'anim' | 'podcast' | 'ai' | 'reels',
    id: string,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    let foundProject: Project | null = null;
    let foundIndex = 0;

    if (tray === 'saas' && saasProject?.id === id) {
      foundProject = saasProject;
    } else if (tray === 'anim') {
      foundIndex = animProjects.findIndex((p) => p.id === id);
      foundProject = animProjects[foundIndex] || null;
    } else if (tray === 'podcast') {
      foundIndex = podcastProjects.findIndex((p) => p.id === id);
      foundProject = podcastProjects[foundIndex] || null;
    } else if (tray === 'ai') {
      foundIndex = aiProjects.findIndex((p) => p.id === id);
      foundProject = aiProjects[foundIndex] || null;
    } else if (tray === 'reels') {
      foundIndex = reelsProjects.findIndex((p) => p.id === id);
      foundProject = reelsProjects[foundIndex] || null;
    }

    if (!foundProject) {
      if (saasProject && saasProject.id === id) {
        tray = 'saas';
        foundProject = saasProject;
      } else {
        const inAnim = animProjects.find((p) => p.id === id);
        if (inAnim) { tray = 'anim'; foundProject = inAnim; }
        const inPod = podcastProjects.find((p) => p.id === id);
        if (inPod) { tray = 'podcast'; foundProject = inPod; }
        const inAi = aiProjects.find((p) => p.id === id);
        if (inAi) { tray = 'ai'; foundProject = inAi; }
        const inReels = reelsProjects.find((p) => p.id === id);
        if (inReels) { tray = 'reels'; foundProject = inReels; }
      }
    }

    if (foundProject) {
      setDeleteTarget({
        id,
        title: foundProject.title,
        tray,
        thumbnailUrl: foundProject.thumbnailUrl,
        project: foundProject,
        originalIndex: foundIndex,
      });
    }
  };

  // Confirm & Execute Deletion (Moves to Recycle Bin safely)
  const confirmExecuteDelete = async () => {
    if (!deleteTarget) return;

    const { id, tray } = deleteTarget;

    // Save for Undo
    setLastDeletedItem(deleteTarget);

    // Save to persistent Recycle Bin with timestamp
    const newTrashTarget: DeleteTarget = {
      ...deleteTarget,
      deletedAt: new Date().toLocaleDateString(lang === 'BN' ? 'bn-BD' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    const updatedTrash = [newTrashTarget, ...trashItems.filter((t) => t.id !== deleteTarget.id)];
    setTrashItems(updatedTrash);
    try {
      localStorage.setItem(STORAGE_KEY_TRASH, JSON.stringify(updatedTrash));
    } catch {}

    if (tray === 'saas') {
      setSaasProject(null);
      localStorage.setItem(STORAGE_KEY_SAAS, 'deleted');
    } else if (tray === 'anim') {
      setAnimProjects((prev) => prev.filter((p) => p.id !== id));
    } else if (tray === 'podcast') {
      setPodcastProjects((prev) => prev.filter((p) => p.id !== id));
    } else if (tray === 'ai') {
      setAiProjects((prev) => prev.filter((p) => p.id !== id));
    } else if (tray === 'reels') {
      setReelsProjects((prev) => prev.filter((p) => p.id !== id));
    }

    // Notice: Do NOT delete from IndexedDB yet so the user can restore it from Recycle Bin!
    // IndexedDB is only cleaned upon permanent deletion.

    // If modal player is currently playing this video, close it
    if (activeVideo?.id === id) {
      setActiveVideo(null);
    }

    setDeleteTarget(null);

    setReorderNotification(
      lang === 'EN'
        ? `"${deleteTarget.title}" moved to Recycle Bin!`
        : `"${deleteTarget.title}" রিসাইকেল বিনে পাঠানো হয়েছে। যেকোনো সময় ফিরিয়ে আনা যাবে।`
    );
    setTimeout(() => setReorderNotification(null), 3500);
  };

  // Restore Single Item from Trash
  const handleRestoreSingleTrashItem = (item: DeleteTarget) => {
    if (!item.project) return;
    const proj = item.project;

    if (item.tray === 'saas') {
      setSaasProject(proj);
      try {
        localStorage.setItem(STORAGE_KEY_SAAS, JSON.stringify(proj));
      } catch {}
    } else if (item.tray === 'anim') {
      setAnimProjects((prev) => (prev.some((p) => p.id === item.id) ? prev : [proj, ...prev]));
    } else if (item.tray === 'podcast') {
      setPodcastProjects((prev) => (prev.some((p) => p.id === item.id) ? prev : [proj, ...prev]));
    } else if (item.tray === 'ai') {
      setAiProjects((prev) => (prev.some((p) => p.id === item.id) ? prev : [proj, ...prev]));
    } else if (item.tray === 'reels') {
      setReelsProjects((prev) => (prev.some((p) => p.id === item.id) ? prev : [proj, ...prev]));
    }

    // Remove from permanently deleted list if present
    const updatedPerm = permanentlyDeletedIds.filter((pid) => pid !== item.id);
    setPermanentlyDeletedIds(updatedPerm);
    try {
      localStorage.setItem(STORAGE_KEY_PERMANENTLY_DELETED, JSON.stringify(updatedPerm));
    } catch {}

    // Remove from trash
    const updatedTrash = trashItems.filter((t) => t.id !== item.id);
    setTrashItems(updatedTrash);
    try {
      localStorage.setItem(STORAGE_KEY_TRASH, JSON.stringify(updatedTrash));
    } catch {}

    setReorderNotification(
      lang === 'EN'
        ? `"${item.title}" restored successfully!`
        : `"${item.title}" ভিডিওটি সফলভাবে পেজে ফিরিয়ে আনা হয়েছে!`
    );
    setTimeout(() => setReorderNotification(null), 3000);
  };

  // Permanently Delete Single Item from Trash (User requested: 완전히 সম্পূর্ণ ডিলিট)
  const handlePermanentlyDeleteTrashItem = async (id: string, title?: string) => {
    // 1. Remove from trash
    const updatedTrash = trashItems.filter((t) => t.id !== id);
    setTrashItems(updatedTrash);
    try {
      localStorage.setItem(STORAGE_KEY_TRASH, JSON.stringify(updatedTrash));
    } catch {}

    // 2. Add to permanently deleted IDs so it never re-appears
    const nextPerm = Array.from(new Set([...permanentlyDeletedIds, id]));
    setPermanentlyDeletedIds(nextPerm);
    try {
      localStorage.setItem(STORAGE_KEY_PERMANENTLY_DELETED, JSON.stringify(nextPerm));
    } catch {}

    // 3. Purge from IndexedDB storage
    await deleteVideoFromIndexedDB(id).catch(() => {});

    setReorderNotification(
      lang === 'EN'
        ? `"${title || 'Video'}" permanently deleted forever!`
        : `"${title || 'ভিডিওটি'}" চিরতরে সম্পূর্ণ ডিলিট করা হয়েছে!`
    );
    setTimeout(() => setReorderNotification(null), 3000);
  };

  // Empty All Trash Permanently
  const handleEmptyTrash = async () => {
    if (trashItems.length === 0) return;
    const allIds = trashItems.map((t) => t.id);
    const nextPerm = Array.from(new Set([...permanentlyDeletedIds, ...allIds]));
    setPermanentlyDeletedIds(nextPerm);
    try {
      localStorage.setItem(STORAGE_KEY_PERMANENTLY_DELETED, JSON.stringify(nextPerm));
    } catch {}

    for (const t of trashItems) {
      await deleteVideoFromIndexedDB(t.id).catch(() => {});
    }

    setTrashItems([]);
    try {
      localStorage.setItem(STORAGE_KEY_TRASH, JSON.stringify([]));
    } catch {}

    setReorderNotification(
      lang === 'EN'
        ? 'Recycle Bin completely emptied!'
        : 'রিসাইকেল বিনের সব ভিডিও সম্পূর্ণ চিরতরে মুছে ফেলা হয়েছে!'
    );
    setTimeout(() => setReorderNotification(null), 3000);
  };

  // Comprehensive Restoration of All Deleted Videos from Trash
  const handleRestoreAllDeleted = () => {
    trashItems.forEach((t) => {
      if (t.project) {
        if (t.tray === 'saas') {
          setSaasProject(t.project);
        } else if (t.tray === 'anim') {
          setAnimProjects((prev) => (prev.some((p) => p.id === t.id) ? prev : [t.project!, ...prev]));
        } else if (t.tray === 'podcast') {
          setPodcastProjects((prev) => (prev.some((p) => p.id === t.id) ? prev : [t.project!, ...prev]));
        } else if (t.tray === 'ai') {
          setAiProjects((prev) => (prev.some((p) => p.id === t.id) ? prev : [t.project!, ...prev]));
        } else if (t.tray === 'reels') {
          setReelsProjects((prev) => (prev.some((p) => p.id === t.id) ? prev : [t.project!, ...prev]));
        }
      }
    });

    setTrashItems([]);
    try {
      localStorage.setItem(STORAGE_KEY_TRASH, JSON.stringify([]));
    } catch {}

    setLastDeletedItem(null);
    setShowRestoredBanner(true);
    setReorderNotification(
      lang === 'EN'
        ? '✨ All deleted videos restored from Recycle Bin!'
        : '✨ রিসাইকেল বিনের সমস্ত ভিডিও সফলভাবে ফিরিয়ে আনা হয়েছে!'
    );
    setTimeout(() => setReorderNotification(null), 3500);
  };

  // Undo Deletion
  const handleUndoDelete = () => {
    if (!lastDeletedItem || !lastDeletedItem.project) return;
    const { tray, project, originalIndex = 0 } = lastDeletedItem;

    if (tray === 'saas') {
      setSaasProject(project);
    } else if (tray === 'anim') {
      setAnimProjects((prev) => {
        const next = [...prev];
        next.splice(originalIndex, 0, project);
        return next;
      });
    } else if (tray === 'podcast') {
      setPodcastProjects((prev) => {
        const next = [...prev];
        next.splice(originalIndex, 0, project);
        return next;
      });
    } else if (tray === 'ai') {
      setAiProjects((prev) => {
        const next = [...prev];
        next.splice(originalIndex, 0, project);
        return next;
      });
    } else if (tray === 'reels') {
      setReelsProjects((prev) => {
        const next = [...prev];
        next.splice(originalIndex, 0, project);
        return next;
      });
    }

    setLastDeletedItem(null);
    setReorderNotification(
      lang === 'EN' ? 'Video restored successfully!' : 'ভিডিওটি সফলভাবে ফিরিয়ে আনা হয়েছে!'
    );
    setTimeout(() => setReorderNotification(null), 3000);
  };

  // Delete wrapper for backward compatibility
  const handleDeleteVideo = async (
    tray: 'anim' | 'podcast' | 'ai' | 'reels',
    id: string,
    e?: React.MouseEvent
  ) => {
    promptDeleteVideo(tray, id, e);
  };

  const handleDeleteById = async (id: string, e?: React.MouseEvent) => {
    const tray = findTrayForId(id);
    promptDeleteVideo(tray, id, e);
  };

  // Handle Video File Selection
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert(lang === 'EN' ? 'Please select a valid video file (.mp4, .mov, .webm).' : 'দয়া করে একটি সঠিক ভিডিও ফাইল নির্বাচন করুন (.mp4, .mov, .webm)।');
      return;
    }

    setIsProcessingUpload(true);
    setUploadFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);

    // Auto set title from file name
    if (!uploadTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setUploadTitle(cleanName);
    }

    // Try auto-capturing thumbnail frame
    try {
      const thumb = await captureVideoThumbnail(file);
      if (thumb) {
        setThumbnailPreview(thumb);
      }
    } catch {
      // fallback
    }

    // Detect aspect ratio and duration
    try {
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = objectUrl;
      tempVideo.onloadedmetadata = () => {
        const durationSec = Math.round(tempVideo.duration || 30);
        const mins = Math.floor(durationSec / 60);
        const secs = durationSec % 60;
        setUploadDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);

        // If portrait/vertical video, auto-select Reels!
        if (tempVideo.videoHeight > tempVideo.videoWidth) {
          setUploadCategory('reels');
        }
      };
    } catch {
      // ignore
    }

    setIsProcessingUpload(false);
  };

  const handleCustomThumbnail = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setThumbnailPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Video Upload Form Submission
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadSourceType === 'file' && !uploadFile && !videoPreviewUrl) {
      alert(lang === 'EN' ? 'Please choose a video file.' : 'দয়া করে একটি ভিডিও ফাইল নির্বাচন করুন।');
      return;
    }

    if (uploadSourceType === 'url' && !uploadVideoUrl.trim()) {
      alert(lang === 'EN' ? 'Please provide a video link.' : 'দয়া করে ভিডিওর লিংক দিন।');
      return;
    }

    setIsProcessingUpload(true);
    const newId = `video-upload-${Date.now()}`;
    let finalVideoUrl = videoPreviewUrl || '';
    let finalVideoId = newId;
    let isVimeo = false;
    let finalThumb = thumbnailPreview;

    if (uploadSourceType === 'file' && uploadFile) {
      try {
        const serverUrl = await uploadMediaFileToServer(uploadFile, uploadFile.name);
        if (serverUrl) {
          finalVideoUrl = serverUrl;
        }
      } catch (err) {
        console.warn('Upload to server failed:', err);
      }
      if (thumbnailPreview && thumbnailPreview.startsWith('data:')) {
        try {
          const thumbUrl = await uploadBase64ImageToServer(thumbnailPreview, `${newId}_thumb`);
          if (thumbUrl) finalThumb = thumbUrl;
        } catch {}
      }
      try {
        await saveVideoToIndexedDB(newId, uploadFile, finalThumb || undefined);
      } catch {}
      if (!finalVideoUrl) finalVideoUrl = videoPreviewUrl || URL.createObjectURL(uploadFile);
    } else {
      // Parse URL if Vimeo
      const vimeoMatch = uploadVideoUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        finalVideoId = vimeoMatch[1];
        isVimeo = true;
      }
      finalVideoUrl = uploadVideoUrl;
    }

    const defaultThumbs = {
      anim: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=640&q=80',
      podcast: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=640&q=80',
      ai: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=640&q=80',
      reels: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=640&q=80',
    };

    const newProject: Project = {
      id: newId,
      title: uploadTitle.trim() || (lang === 'EN' ? 'Custom Video Showcase' : 'কাস্টম ভিডিও প্রজেক্ট'),
      description: uploadDescription.trim() || (lang === 'EN' ? 'Custom video production by MD Sakibul Hasan Rahat.' : 'এমডি সাকিবুল হাসান রাহাতের এডিটকৃত প্রজেক্ট।'),
      videoId: finalVideoId,
      url: finalVideoUrl,
      category:
        uploadCategory === 'anim'
          ? 'Animation & Motion'
          : uploadCategory === 'podcast'
          ? 'Podcast & Long-Form'
          : uploadCategory === 'ai'
          ? 'AI Generated Video'
          : 'Reels & Shorts',
      tags: uploadTags ? uploadTags.split(',').map((t) => t.trim()).filter(Boolean) : ['Video', 'Master'],
      aspectRatio: uploadCategory === 'reels' ? '9:16' : '16:9',
      thumbnailUrl: finalThumb || defaultThumbs[uploadCategory],
      duration: uploadDuration || '0:30',
      platform: uploadSourceType === 'file' ? 'file' : isVimeo ? 'vimeo' : 'file',
      isUserUploaded: true,
      localVideoUrl: uploadSourceType === 'file' ? finalVideoUrl : undefined,
    };

    // Insert at front of chosen tray
    let nextAnim = animProjects;
    let nextPod = podcastProjects;
    let nextAi = aiProjects;
    let nextReels = reelsProjects;

    if (uploadCategory === 'anim') {
      nextAnim = [newProject, ...animProjects];
      setAnimProjects(nextAnim);
      try { localStorage.setItem(STORAGE_KEY_ANIM, JSON.stringify(nextAnim)); } catch {}
    } else if (uploadCategory === 'podcast') {
      nextPod = [newProject, ...podcastProjects];
      setPodcastProjects(nextPod);
      try { localStorage.setItem(STORAGE_KEY_POD, JSON.stringify(nextPod)); } catch {}
    } else if (uploadCategory === 'ai') {
      nextAi = [newProject, ...aiProjects];
      setAiProjects(nextAi);
      try { localStorage.setItem(STORAGE_KEY_AI, JSON.stringify(nextAi)); } catch {}
    } else if (uploadCategory === 'reels') {
      nextReels = [newProject, ...reelsProjects];
      setReelsProjects(nextReels);
      try { localStorage.setItem(STORAGE_KEY_REELS, JSON.stringify(nextReels)); } catch {}
    }

    await saveSiteDataToServer({
      animProjects: nextAnim,
      podcastProjects: nextPod,
      aiProjects: nextAi,
      reelsProjects: nextReels,
    });

    setIsProcessingUpload(false);
    setUploadSuccess(true);

    setTimeout(() => {
      setUploadSuccess(false);
      setIsUploadModalOpen(false);
      // Reset form
      setUploadFile(null);
      setVideoPreviewUrl(null);
      setThumbnailPreview(null);
      setUploadTitle('');
      setUploadDescription('');
      setUploadVideoUrl('');
      // Scroll to that tray
      handleScrollToTray(uploadCategory);
    }, 1000);
  };

  // SaaS Master Reel Customization Handlers
  const handleOpenChangeSaasModal = () => {
    setSaasTitle(saasProject?.title || 'Saas Animation Video');
    setSaasDescription(saasProject?.description || 'Dynamic SaaS product walkthrough, search kinetic reveal, and high-impact visual motion.');
    setSaasVideoUrl(saasProject?.url || '');
    setSaasDuration(saasProject?.duration || '0:05');
    setSaasThumbPreview(saasProject?.thumbnailUrl || null);
    setSaasPreviewUrl(saasProject?.localVideoUrl || (saasProject?.url?.startsWith('blob:') ? saasProject.url : null));
    setSaasUploadFile(null);
    setSaasSourceType(saasProject?.platform === 'file' ? 'file' : 'url');
    setIsChangeSaasModalOpen(true);
  };

  const handleSaasFileSelect = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert(lang === 'EN' ? 'Please select a valid video file.' : 'দয়া করে একটি বৈধ ভিডিও ফাইল নির্বাচন করুন।');
      return;
    }
    setSaasUploadFile(file);
    setIsProcessingSaas(true);

    const objectUrl = URL.createObjectURL(file);
    setSaasPreviewUrl(objectUrl);

    if (!saasTitle || saasTitle === 'Saas Animation Video') {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setSaasTitle(cleanName);
    }

    try {
      const capturedThumb = await captureVideoThumbnail(file);
      if (capturedThumb) {
        setSaasThumbPreview(capturedThumb);
      }
    } catch {}

    try {
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = objectUrl;
      tempVideo.onloadedmetadata = () => {
        const durationSec = Math.round(tempVideo.duration || 10);
        const mins = Math.floor(durationSec / 60);
        const secs = durationSec % 60;
        setSaasDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      };
    } catch {}

    setIsProcessingSaas(false);
  };

  const handleSaasCustomThumbnail = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSaasThumbPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDirectSaasUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert(lang === 'EN' ? 'Please select a valid video file.' : 'দয়া করে একটি বৈধ ভিডিও ফাইল নির্বাচন করুন।');
      return;
    }
    const masterId = 'saas-anim-featured';
    setReorderNotification(
      lang === 'EN' ? 'Uploading video to server...' : 'সার্ভারে ভিডিও আপলোড হচ্ছে... অনুগ্রহ করে একটু অপেক্ষা করুন।'
    );

    const objectUrl = URL.createObjectURL(file);
    let capturedThumb = '';
    try {
      capturedThumb = (await captureVideoThumbnail(file)) || '';
    } catch {}

    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

    let dur = '0:15';
    try {
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.src = objectUrl;
      await new Promise<void>((resolve) => {
        tempVideo.onloadedmetadata = () => {
          const durationSec = Math.round(tempVideo.duration || 15);
          const mins = Math.floor(durationSec / 60);
          const secs = durationSec % 60;
          dur = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
          resolve();
        };
        tempVideo.onerror = () => resolve();
      });
    } catch {}

    // 1. Upload video file to server disk for permanent retention across refreshes & audience access
    let finalUrl = '';
    try {
      const serverUrl = await uploadMediaFileToServer(file, file.name);
      if (serverUrl) {
        finalUrl = serverUrl;
      }
    } catch (err) {
      console.warn('Direct upload to server failed:', err);
    }

    let finalThumb = capturedThumb;
    if (capturedThumb && capturedThumb.startsWith('data:')) {
      try {
        const thumbUrl = await uploadBase64ImageToServer(capturedThumb, `${masterId}_thumb`);
        if (thumbUrl) finalThumb = thumbUrl;
      } catch {}
    }

    try {
      await saveVideoToIndexedDB(masterId, file, finalThumb || undefined);
    } catch {}

    if (!finalUrl) finalUrl = objectUrl;

    const updated: Project = {
      id: masterId,
      title: cleanTitle || 'Saas Master REEL',
      description: 'Custom uploaded video for Saas Master Reel showcase.',
      videoId: masterId,
      url: finalUrl,
      category: 'Animation & Motion',
      tags: ['SaaS Master', 'Custom Upload'],
      aspectRatio: '16:9',
      thumbnailUrl: finalThumb || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      duration: dur,
      platform: 'file',
      featured: true,
      isUserUploaded: true,
      localVideoUrl: finalUrl,
    };

    setSaasProject(updated);
    setAnimProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === 'anim-1' || p.id === masterId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
    try {
      localStorage.setItem(STORAGE_KEY_SAAS, JSON.stringify(updated));
    } catch {}

    await saveSiteDataToServer({
      saasProject: updated,
    });

    setReorderNotification(
      lang === 'EN'
        ? '✓ SaaS Master Reel video uploaded & saved permanently!'
        : '✓ সাস মাস্টার রিল ভিডিও স্থায়ীভাবে আপলোড ও সেভ হয়েছে! রিফ্রেশ দিলেও আর যাবে না।'
    );
    setTimeout(() => setReorderNotification(null), 4000);
  };

  const handleSaveSaasVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (saasSourceType === 'file' && !saasUploadFile && !saasPreviewUrl && !saasProject) {
      alert(lang === 'EN' ? 'Please choose a video file.' : 'দয়া করে একটি ভিডিও ফাইল নির্বাচন করুন।');
      return;
    }
    if (saasSourceType === 'url' && !saasVideoUrl.trim()) {
      alert(lang === 'EN' ? 'Please enter a video URL.' : 'দয়া করে একটি ভিডিও লিংক দিন।');
      return;
    }

    setIsProcessingSaas(true);
    const masterId = 'saas-anim-featured';
    let finalVideoUrl = saasPreviewUrl || saasProject?.url || '';
    let finalVideoId = '1229887460';
    let isVimeo = false;
    let finalThumb = saasThumbPreview;

    if (saasSourceType === 'file' && saasUploadFile) {
      try {
        const serverUrl = await uploadMediaFileToServer(saasUploadFile, saasUploadFile.name);
        if (serverUrl) {
          finalVideoUrl = serverUrl;
        }
      } catch {}
      if (saasThumbPreview && saasThumbPreview.startsWith('data:')) {
        try {
          const thumbUrl = await uploadBase64ImageToServer(saasThumbPreview, `${masterId}_thumb`);
          if (thumbUrl) finalThumb = thumbUrl;
        } catch {}
      }
      try {
        await saveVideoToIndexedDB(masterId, saasUploadFile, finalThumb || undefined);
      } catch {}
      if (!finalVideoUrl) finalVideoUrl = saasPreviewUrl || URL.createObjectURL(saasUploadFile);
      finalVideoId = masterId;
    } else if (saasSourceType === 'url') {
      const vimeoMatch = saasVideoUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        finalVideoId = vimeoMatch[1];
        isVimeo = true;
      }
      finalVideoUrl = saasVideoUrl;
    }

    const updatedProject: Project = {
      id: masterId,
      title: saasTitle.trim() || 'Saas Animation Video',
      description: saasDescription.trim() || 'Dynamic SaaS product walkthrough and high-impact visual motion.',
      videoId: finalVideoId,
      url: finalVideoUrl,
      category: 'Animation & Motion',
      tags: ['SaaS Master', 'Custom Reel', 'Motion Design'],
      aspectRatio: '16:9',
      thumbnailUrl: finalThumb || saasProject?.thumbnailUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      duration: saasDuration || '0:15',
      platform: saasSourceType === 'file' ? 'file' : isVimeo ? 'vimeo' : 'file',
      featured: true,
      isUserUploaded: saasSourceType === 'file',
      localVideoUrl: saasSourceType === 'file' ? finalVideoUrl : undefined,
    };

    setSaasProject(updatedProject);
    setAnimProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === 'anim-1' || p.id === masterId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = updatedProject;
        return next;
      }
      return [updatedProject, ...prev];
    });
    try {
      localStorage.setItem(STORAGE_KEY_SAAS, JSON.stringify(updatedProject));
    } catch {}

    await saveSiteDataToServer({
      saasProject: updatedProject,
    });

    setIsProcessingSaas(false);
    setSaasUpdateSuccess(true);
    setTimeout(() => {
      setSaasUpdateSuccess(false);
      setIsChangeSaasModalOpen(false);
      setReorderNotification(
        lang === 'EN' ? 'SaaS Master Reel video updated successfully & saved to server!' : 'সাস মাস্টার রিল ভিডিও সফলভাবে পরিবর্তন ও সেভ করা হয়েছে!'
      );
      setTimeout(() => setReorderNotification(null), 3000);
    }, 700);
  };

  const handleResetSaasDefault = () => {
    setSaasProject(SAAS_ANIMATION_PROJECT);
    setAnimProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === 'anim-1' || p.id === 'saas-anim-featured');
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = SAAS_ANIMATION_PROJECT;
        return next;
      }
      return [SAAS_ANIMATION_PROJECT, ...prev];
    });
    try {
      localStorage.setItem(STORAGE_KEY_SAAS, JSON.stringify(SAAS_ANIMATION_PROJECT));
    } catch {}
    setIsChangeSaasModalOpen(false);
    setReorderNotification(
      lang === 'EN' ? 'SaaS Master Reel restored to default video!' : 'সাস মাস্টার রিল মূল ডিফল্ট ভিডিওতে রিস্টোর হয়েছে!'
    );
    setTimeout(() => setReorderNotification(null), 3000);
  };

  return (
    <section
      id="projects"
      className="py-12 sm:py-16 bg-gradient-to-b from-[#0b0c10] via-[#0e1017] to-[#0a0a0d] border-t border-glass-border relative w-full overflow-hidden transition-colors duration-700 select-none"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(56,189,248,0.06),transparent)] pointer-events-none" />
      <div className="absolute top-1/4 -right-24 w-80 h-80 rounded-full bg-cyan-500/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-24 w-80 h-80 rounded-full bg-gold/[0.02] blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 relative z-10">
        {/* ═════════════════════════════════════════════════════════════════════════
            CLEAN TWO-CHAPTER NAVIGATION: [ ভিডিও ]  |  [ গ্রাফিক্স ডিজাইন ]
            (সমস্ত অপ্রয়োজনীয় অপশন ও ট্রে মুছে শুধু মার্জিত দুইটি চ্যাপ্টার রাখা হয়েছে)
            ═════════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center justify-center mb-8 pt-2">
          <div className="inline-flex p-1 rounded-full bg-[#11131b]/95 border border-white/10 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.65)]">
            <button
              type="button"
              onClick={() => {
                if (setActiveChapter) setActiveChapter('video');
                setInternalChapter('video');
              }}
              className={`px-7 sm:px-10 py-2 sm:py-2.5 rounded-full font-serif text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                effectiveChapter === 'video'
                  ? 'bg-gradient-to-r from-cyan-500/25 via-sky-500/20 to-teal-500/25 text-cyan-200 border border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.35)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span>{lang === 'EN' ? 'Videos' : 'ভিডিও'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (setActiveChapter) setActiveChapter('design');
                setInternalChapter('design');
                const el = document.getElementById('graphic-design');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-7 sm:px-10 py-2 sm:py-2.5 rounded-full font-serif text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                effectiveChapter === 'design'
                  ? 'bg-gradient-to-r from-amber-500/25 via-gold/20 to-amber-600/25 text-amber-200 border border-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span>{lang === 'EN' ? 'Graphic Design' : 'গ্রাফিক্স ডিজাইন'}</span>
            </button>
          </div>

          {/* Action Bar: Upload Custom Video & Recycle Bin (Only visible to owner) */}
          {isOwner && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 mt-5">
              {/* Custom Video Upload Button */}
              <button
                type="button"
                onClick={() => {
                  setUploadCategory('anim');
                  setUploadSourceType('file');
                  setIsUploadModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-gold/20 via-amber-400/25 to-gold/20 hover:from-gold/30 hover:to-amber-400/35 text-amber-200 hover:text-white border border-gold/40 hover:border-gold text-xs font-mono font-bold transition-all shadow-[0_4px_15px_rgba(212,175,55,0.2)] cursor-pointer click-bounce"
                title={lang === 'EN' ? 'Upload video file or link' : 'আপনার পছন্দমতো ভিডিও আপলোড করুন'}
              >
                <Upload size={14} className="text-gold" />
                <span>{lang === 'EN' ? '+ Upload Custom Video' : '+ নিজের মনমতো ভিডিও আপলোড করুন'}</span>
              </button>

              {/* Recycle Bin Button */}
              <button
                type="button"
                onClick={() => setIsTrashModalOpen(true)}
                className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full border text-xs font-mono font-semibold transition-all cursor-pointer click-bounce ${
                  trashItems.length > 0
                    ? 'bg-rose-950/40 hover:bg-rose-900/50 border-rose-500/40 text-rose-200 shadow-[0_4px_15px_rgba(244,63,94,0.2)]'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-zinc-400 hover:text-white'
                }`}
                title={lang === 'EN' ? 'View deleted videos in Recycle Bin' : 'ডিলিট করা ভিডিও দেখতে রিসাইকেল বিনে যান'}
              >
                <Trash2 size={13} className={trashItems.length > 0 ? 'text-rose-400' : 'text-zinc-400'} />
                <span>{lang === 'EN' ? 'Recycle Bin' : 'রিসাইকেল বিন (ট্র্যাশ)'}</span>
                {trashItems.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {trashItems.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Floating Notification Bar */}
        {reorderNotification && (
          <div className="mb-6 px-4 py-2.5 rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-200 text-xs font-mono flex items-center justify-between animate-fade-in shadow-lg">
            <div className="flex items-center gap-2">
              <Check size={14} className="text-cyan-400" />
              <span>{reorderNotification}</span>
              {lastDeletedItem && (
                <button
                  onClick={handleUndoDelete}
                  className="ml-3 px-2.5 py-0.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow click-bounce"
                >
                  <RotateCcw size={11} />
                  <span>{lang === 'EN' ? 'Undo' : 'পূর্বাবস্থায় আনুন'}</span>
                </button>
              )}
            </div>
            <button onClick={() => setReorderNotification(null)} className="text-cyan-400/70 hover:text-cyan-300 cursor-pointer">
              <X size={13} />
            </button>
          </div>
        )}

        {/* Hidden File Input for SaaS Video file upload */}
        <input
          ref={saasDirectFileInputRef}
          type="file"
          accept="video/*"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) {
              await handleDirectSaasUpload(f);
            }
          }}
          className="hidden"
        />

        {/* ═════════════════════════════════════════════════════════════════════════
            TOP SINGLE FEATURED VIDEO ROW (প্রথম ভিডিও সারির উপরে একক সিনেমাটিক মাস্টার ভিডিও)
            সাইজ: তুলনামূলক একটু ছোট (max-w-[650px]), নিচের ভিডিও থেকে বড়, ফাইল আপলোড ও ড্র্যাগ-ড্রপ সুবিধাসহ
            ═════════════════════════════════════════════════════════════════════════ */}
        {(() => {
          const featuredProj = saasProject || SAAS_ANIMATION_PROJECT;
          return (
            <div
              id="top-featured-video-container"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDragOverTray('saas');
              }}
              onDragLeave={(e) => {
                // only reset if leaving outer container
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                if (dragOverTray === 'saas') setDragOverTray(null);
              }}
              onDrop={async (e) => {
                e.preventDefault();
                // Check if user dropped an actual video file from OS
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile.type.startsWith('video/')) {
                    await handleDirectSaasUpload(droppedFile);
                    setDragOverTray(null);
                    return;
                  }
                }
                handleDrop('saas', 0);
              }}
              className={`mb-10 sm:mb-12 w-full max-w-xl sm:max-w-2xl lg:max-w-[650px] mx-auto px-2 sm:px-4 transition-all duration-300 ${
                dragOverTray === 'saas'
                  ? 'scale-[1.02] ring-2 ring-amber-400 rounded-3xl shadow-[0_0_35px_rgba(251,191,36,0.5)]'
                  : ''
              }`}
            >
              {/* Header Above Video Frame with Title & Direct Upload Action */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <h4 className="font-sans text-xs sm:text-sm font-semibold text-zinc-100 tracking-wide">
                    {getSaasTitle()}
                  </h4>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => openTextEditModal({
                        type: 'video',
                        id: featuredProj?.id || 'anim-1',
                        tray: 'saas',
                        currentText: getSaasTitle(),
                        titleLabel: lang === 'EN' ? 'Edit Featured Video Title' : 'ফিচার্ড ভিডিওর শিরোনাম পরিবর্তন করুন',
                      })}
                      className="p-1 rounded-lg hover:bg-white/10 text-amber-300 hover:text-white transition-colors cursor-pointer"
                      title={lang === 'EN' ? 'Customize Title' : 'শিরোনাম পরিবর্তন করুন'}
                    >
                      <Edit3 size={13} />
                    </button>
                  )}
                </div>

                {/* Direct Upload & Change Buttons right on top */}
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => saasDirectFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-mono font-bold transition-all shadow-[0_2px_10px_rgba(251,191,36,0.4)] cursor-pointer click-bounce"
                      title={lang === 'EN' ? 'Upload new video file from your computer/mobile' : 'কম্পিউটার বা মোবাইল থেকে নতুন ভিডিও ফাইল আপলোড করুন'}
                    >
                      <Upload size={12} />
                      <span>{lang === 'EN' ? '+ Upload New Video' : '+ নতুন ভিডিও আপলোড'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenChangeSaasModal}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 border border-white/15 text-[11px] font-mono font-semibold transition-all cursor-pointer"
                      title={lang === 'EN' ? 'Change video link or settings' : 'ভিডিও লিংক বা সেটিংস পরিবর্তন'}
                    >
                      <Settings size={11} />
                      <span>{lang === 'EN' ? 'Settings' : 'সেটিংস'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Drag Drop Hint Banner over SaaS when dragging another video */}
              {dragOverTray === 'saas' && draggedItem && draggedItem.tray !== 'saas' && (
                <div className="mb-3 py-2 px-4 rounded-xl bg-amber-500/25 border-2 border-dashed border-amber-400 text-amber-200 text-xs font-mono flex items-center justify-center gap-2 animate-pulse shadow-lg">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>{lang === 'EN' ? '⬇️ Drop here to set as Top Featured Master Video' : '⬇️ এখানে ছেড়ে দিন প্রথম সারির মূল ভিডিও হিসেবে যুক্ত করতে'}</span>
                </div>
              )}

              {/* Cinematic Large Master Box with Moving Border Light Beam */}
              <div
                draggable={isOwner}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', featuredProj.id);
                  e.dataTransfer.effectAllowed = 'move';
                  handleDragStart('saas', 0, featuredProj);
                }}
                onDragEnd={handleDragEnd}
                className="relative rounded-2xl sm:rounded-3xl p-[2px] overflow-hidden group shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(212,175,55,0.2)] cursor-pointer"
              >
                {/* Moving border light beam traveling continuously around the 4 sides */}
                <div
                  className="absolute inset-[-120%] pointer-events-none animate-rect-beam"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(212,175,55,0.3) 300deg, #d4af37 335deg, #ffffff 350deg, #d4af37 358deg, transparent 360deg)',
                  }}
                />
                <div className="relative z-10 w-full h-full p-2 sm:p-3 rounded-[calc(1rem-1px)] sm:rounded-[calc(1.5rem-1px)] bg-[#0b0d13]/95 border border-white/15 hover:border-gold/40 transition-all duration-300 backdrop-blur-xl">
                  {/* Drag Grip Handle Bar on Featured Video in Owner Mode */}
                  {isOwner && (
                    <div
                      className="px-2.5 py-1 mb-2 rounded-lg bg-black/80 border border-amber-400/40 flex items-center justify-between text-[10px] font-mono text-amber-300 cursor-grab active:cursor-grabbing select-none"
                      onClick={(e) => e.stopPropagation()}
                      title={lang === 'EN' ? 'Drag this video to any lower tray' : 'এই ভিডিওটি টেনে নিচের যেকোনো ট্রেতে নিতে পারেন'}
                    >
                      <div className="flex items-center gap-1.5">
                        <GripVertical size={13} className="text-amber-400" />
                        <span className="font-bold">⭐ {lang === 'EN' ? 'Top Featured Video (Drag to swap or move)' : 'প্রথম সারির ভিডিও (টেনে যেকোনো স্থানে নিতে পারেন)'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => saasDirectFileInputRef.current?.click()}
                          className="px-2 py-0.5 rounded bg-amber-400 text-black font-bold hover:bg-amber-300 cursor-pointer flex items-center gap-1"
                          title="Upload new file"
                        >
                          <Upload size={10} />
                          <span>{lang === 'EN' ? 'Upload' : 'আপলোড'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 16:9 Video Frame */}
                  <div
                    onClick={() => setActiveVideo(featuredProj)}
                    className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black/90 group/video cursor-pointer border border-white/10 hover:border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.85)] transition-all duration-300"
                  >
                    <img
                      src={featuredProj.thumbnailUrl}
                      alt={getSaasTitle()}
                      draggable={false}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/video:scale-105 pointer-events-none select-none"
                    />

                    {/* Dark subtle gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-transparent to-black/25 opacity-60 group-hover/video:opacity-30 transition-opacity pointer-events-none" />

                    {/* Bottom-Left Sleek Dark Corner Play Logo */}
                    <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 pointer-events-none">
                      <StandardCornerPlayIcon size="md" />
                    </div>

                    {/* Bottom Duration Badge */}
                    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-2.5 py-1 rounded-lg bg-black/85 border border-white/15 text-[10px] sm:text-xs font-mono text-zinc-300 font-bold backdrop-blur-md shadow pointer-events-none">
                      {featuredProj.duration || '0:05'}
                    </div>

                    {/* Quick Change Video Hover Badge for Owner - ALWAYS VISIBLE TO OWNER */}
                    {isOwner && (
                      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            saasDirectFileInputRef.current?.click();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black border border-amber-300 shadow-[0_2px_12px_rgba(251,191,36,0.5)] backdrop-blur-md transition-all font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer click-bounce"
                          title={lang === 'EN' ? 'Upload new video file' : 'নতুন ভিডিও ফাইল আপলোড করুন'}
                        >
                          <Upload size={13} />
                          <span>{lang === 'EN' ? 'Upload Video' : 'ভিডিও আপলোড'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenChangeSaasModal();
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-black/90 hover:bg-white/20 text-zinc-200 border border-white/20 shadow-md backdrop-blur-md transition-all font-mono text-xs font-semibold flex items-center gap-1 cursor-pointer click-bounce"
                          title={lang === 'EN' ? 'Change Video or Link' : 'ভিডিও বা লিংক পরিবর্তন'}
                        >
                          <Settings size={12} />
                          <span>{lang === 'EN' ? 'Link/Settings' : 'লিংক / সেটিংস'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Owner Toolbar underneath Featured Video - ALWAYS VISIBLE TO OWNER */}
                  {isOwner && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-amber-300/90 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-amber-400" />
                        <span>{lang === 'EN' ? '⭐ Featured Master Video (Top Row)' : '⭐ প্রথম সারির ফিচার্ড মাস্টার ভিডিও'}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => saasDirectFileInputRef.current?.click()}
                          className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-400 hover:text-black text-amber-300 border border-amber-400/60 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm click-bounce"
                        >
                          <Upload size={12} />
                          <span>{lang === 'EN' ? 'Upload File' : 'ফাইল আপলোড'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleOpenChangeSaasModal}
                          className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm click-bounce"
                        >
                          <Settings size={12} />
                          <span>{lang === 'EN' ? 'Change Link' : 'লিংক পরিবর্তন'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ═════════════════════════════════════════════════════════════════════════
            TRAY 1: সাস ও মোশন এনিমেশন ভিডিও (Animation Tray - 3-Column Grid)
            ═════════════════════════════════════════════════════════════════════════ */}
        <div
          id="tray-anim"
          className="mb-12 scroll-mt-24"
          onDragOver={(e) => handleDragOver(e, 'anim')}
          onDrop={() => handleDrop('anim', animProjects.length)}
        >
          {/* Owner video upload controls */}
          {isOwner && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                type="button"
                onClick={() => {
                  setUploadCategory('anim');
                  setUploadSourceType('file');
                  setIsUploadModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-400 hover:text-black text-amber-200 border border-amber-400/40 text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
                title={lang === 'EN' ? 'Upload video file to Animation Tray' : 'এনিমেশন ট্রেতে ফাইল থেকে ভিডিও আপলোড করুন'}
              >
                <Upload size={12} />
                <span>{lang === 'EN' ? '+ Upload Animation Video' : '+ এনিমেশন ভিডিও আপলোড'}</span>
              </button>
              <span className="text-[11px] font-mono text-zinc-400">
                {animProjects.length} {lang === 'EN' ? 'videos' : 'টি ভিডিও'}
              </span>
            </div>
          )}

          {/* Cross-tray Drag Drop Target Banner (Only in customize mode) */}
          {isCustomizeMode && dragOverTray === 'anim' && draggedItem && draggedItem.tray !== 'anim' && (
            <div className="mb-4 py-2 px-4 rounded-xl bg-amber-500/20 border-2 border-dashed border-amber-400 text-amber-200 text-xs font-mono flex items-center justify-center gap-2 animate-pulse shadow-lg">
              <Move size={14} className="text-amber-400" />
              <span>{lang === 'EN' ? '⬇️ Drop here to move video to Animation Tray' : '⬇️ এনিমেশন ও মোশন ট্রেতে স্থানান্তরের জন্য এখানে ছেড়ে দিন'}</span>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════════
              LOWER ROW: এনিমেশন ও মোশন ডিজাইন (Moved here as instructed: tar porer sharir shurute)
              ═════════════════════════════════════════════════════════════════════════ */}
          <div className="mt-6">
            <div className="flex flex-col items-center justify-center my-6">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-sans font-medium tracking-widest uppercase text-zinc-300">
                  {getHeadline('anim')}
                </h3>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => openTextEditModal({
                      type: 'headline',
                      id: 'anim',
                      currentText: getHeadline('anim'),
                      titleLabel: lang === 'EN' ? 'Edit Animation Headline' : 'এনিমেশন হেডলাইন পরিবর্তন করুন',
                    })}
                    className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title={lang === 'EN' ? 'Customize Headline' : 'হেডলাইন পরিবর্তন করুন'}
                  >
                    <Edit3 size={11} />
                  </button>
                )}
              </div>
            </div>

            <div
              className={`grid grid-cols-1 ${
                animProjects.filter((p) => p.id !== (saasProject?.id || 'anim-1') && p.id !== 'anim-1' && p.id !== 'saas-anim-featured').length <= 2
                  ? 'md:grid-cols-2 max-w-4xl mx-auto'
                  : 'md:grid-cols-2 lg:grid-cols-3'
              } gap-5`}
            >
              {animProjects
                .filter((p) => p.id !== (saasProject?.id || 'anim-1') && p.id !== 'anim-1' && p.id !== 'saas-anim-featured')
                .map((p, index) => {
                  const originalIndex = animProjects.findIndex((item) => item.id === p.id);
                  return (
                    <div
                      key={p.id}
                      draggable={true}
                      onDragStart={() => handleDragStart('anim', originalIndex, p)}
                      onDragOver={(e) => handleDragOver(e, 'anim', originalIndex)}
                      onDrop={() => handleDrop('anim', originalIndex)}
                      onDragEnd={handleDragEnd}
                      className={`transition-all duration-200 h-full ${
                        draggedItem?.project?.id === p.id
                          ? 'opacity-40 scale-95 border-dashed border-2 border-amber-400 rounded-xl'
                          : dragOverIndex === originalIndex && dragOverTray === 'anim'
                          ? 'border-2 border-amber-400 scale-[1.02] rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                          : ''
                      }`}
                    >
                      <VideoStandardCard
                        project={p}
                        lang={lang}
                        accentColor="amber"
                        isReorderMode={isCustomizeMode}
                        isDeleteMode={isDeleteMode}
                        isOwner={isOwner}
                        onSettings={() => openEditVideoModal(p, 'anim')}
                        onEditTitle={(proj) => openTextEditModal({
                          type: 'video',
                          id: proj.id,
                          tray: 'anim',
                          currentText: proj.title,
                          titleLabel: lang === 'EN' ? 'Edit Video Title' : 'ভিডিওর শিরোনাম পরিবর্তন করুন',
                        })}
                        index={index}
                        totalInTray={animProjects.length}
                        currentTray="anim"
                        onMoveLeft={(e) => handleMoveCard('anim', originalIndex, 'left', e)}
                        onMoveRight={(e) => handleMoveCard('anim', originalIndex, 'right', e)}
                        onDelete={(e) => promptDeleteVideo('anim', p.id, e)}
                        onPlay={() => setActiveVideo(p)}
                        onMoveToTray={(target) => handleMoveToCategory('anim', originalIndex, target)}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════════
            TRAY 2: পডকাস্ট ভিডিও (Podcast Tray - ALWAYS VISIBLE, NEVER HIDDEN)
            ═════════════════════════════════════════════════════════════════════════ */}
        <div
          id="tray-podcast"
          className="mb-12 scroll-mt-24"
          onDragOver={(e) => handleDragOver(e, 'podcast')}
          onDrop={() => handleDrop('podcast', podcastProjects.length)}
        >
          {/* Centered Compact Minimalist Headline */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-sans font-medium tracking-widest uppercase text-zinc-300">
                {getHeadline('podcast')}
              </h3>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => openTextEditModal({
                    type: 'headline',
                    id: 'podcast',
                    currentText: getHeadline('podcast'),
                    titleLabel: lang === 'EN' ? 'Edit Podcast Headline' : 'পডকাস্ট হেডলাইন পরিবর্তন করুন',
                  })}
                  className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title={lang === 'EN' ? 'Customize Headline' : 'হেডলাইন পরিবর্তন করুন'}
                >
                  <Edit3 size={11} />
                </button>
              )}
            </div>
            {isOwner && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadCategory('podcast');
                    setUploadSourceType('file');
                    setIsUploadModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono transition-all cursor-pointer shadow-sm"
                  title={lang === 'EN' ? 'Upload video file to Podcast Tray' : 'পডকাস্ট ট্রেতে ফাইল থেকে ভিডিও আপলোড করুন'}
                >
                  <Upload size={11} />
                  <span>{lang === 'EN' ? '+ Upload Video' : '+ ভিডিও আপলোড'}</span>
                </button>
                <span className="text-[10px] font-mono text-zinc-500">
                  {podcastProjects.length} {lang === 'EN' ? 'videos' : 'টি ভিডিও'}
                </span>
              </div>
            )}
          </div>

          {/* Cross-tray Drag Drop Target Banner (Only in customize mode) */}
          {isCustomizeMode && dragOverTray === 'podcast' && draggedItem && draggedItem.tray !== 'podcast' && (
            <div className="mb-4 py-2 px-4 rounded-xl bg-cyan-500/20 border-2 border-dashed border-cyan-400 text-cyan-200 text-xs font-mono flex items-center justify-center gap-2 animate-pulse shadow-lg">
              <Move size={14} className="text-cyan-400" />
              <span>{lang === 'EN' ? '⬇️ Drop here to move video to Podcast Tray' : '⬇️ পডকাস্ট ট্রেতে স্থানান্তরের জন্য এখানে ছেড়ে দিন'}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {podcastProjects.map((p, index) => (
              <div
                key={p.id}
                draggable={true}
                onDragStart={() => handleDragStart('podcast', index, p)}
                onDragOver={(e) => handleDragOver(e, 'podcast', index)}
                onDrop={() => handleDrop('podcast', index)}
                onDragEnd={handleDragEnd}
                className={`transition-all duration-200 h-full ${
                  draggedItem?.project?.id === p.id
                    ? 'opacity-40 scale-95 border-dashed border-2 border-cyan-400 rounded-xl'
                    : dragOverIndex === index && dragOverTray === 'podcast'
                    ? 'border-2 border-cyan-400 scale-[1.02] rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                    : ''
                }`}
              >
                <VideoStandardCard
                  project={p}
                  lang={lang}
                  accentColor="cyan"
                  isReorderMode={isCustomizeMode}
                  isDeleteMode={isDeleteMode}
                  isOwner={isOwner}
                  onSettings={() => openEditVideoModal(p, 'podcast')}
                  onEditTitle={(proj) => openTextEditModal({
                    type: 'video',
                    id: proj.id,
                    tray: 'podcast',
                    currentText: proj.title,
                    titleLabel: lang === 'EN' ? 'Edit Video Title' : 'ভিডিওর শিরোনাম পরিবর্তন করুন',
                  })}
                  index={index}
                  totalInTray={podcastProjects.length}
                  currentTray="podcast"
                  onMoveLeft={(e) => handleMoveCard('podcast', index, 'left', e)}
                  onMoveRight={(e) => handleMoveCard('podcast', index, 'right', e)}
                  onDelete={(e) => promptDeleteVideo('podcast', p.id, e)}
                  onPlay={() => setActiveVideo(p)}
                  onMoveToTray={(target) => handleMoveToCategory('podcast', index, target)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════════
            TRAY 3: এআই ভিডিও (AI Video Tray - ALWAYS VISIBLE, NEVER HIDDEN)
            ═════════════════════════════════════════════════════════════════════════ */}
        <div
          id="tray-ai"
          className="mb-12 scroll-mt-24"
          onDragOver={(e) => handleDragOver(e, 'ai')}
          onDrop={() => handleDrop('ai', aiProjects.length)}
        >
          {/* Centered Compact Minimalist Headline */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-sans font-medium tracking-widest uppercase text-zinc-300">
                {getHeadline('ai')}
              </h3>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => openTextEditModal({
                    type: 'headline',
                    id: 'ai',
                    currentText: getHeadline('ai'),
                    titleLabel: lang === 'EN' ? 'Edit AI Headline' : 'এআই হেডলাইন পরিবর্তন করুন',
                  })}
                  className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title={lang === 'EN' ? 'Customize Headline' : 'হেডলাইন পরিবর্তন করুন'}
                >
                  <Edit3 size={11} />
                </button>
              )}
            </div>
            {isOwner && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadCategory('ai');
                    setUploadSourceType('file');
                    setIsUploadModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono transition-all cursor-pointer shadow-sm"
                  title={lang === 'EN' ? 'Upload video file to AI Tray' : 'এআই ট্রেতে ফাইল থেকে ভিডিও আপলোড করুন'}
                >
                  <Upload size={11} />
                  <span>{lang === 'EN' ? '+ Upload Video' : '+ ভিডিও আপলোড'}</span>
                </button>
                <span className="text-[10px] font-mono text-zinc-500">
                  {aiProjects.length} {lang === 'EN' ? 'videos' : 'টি ভিডিও'}
                </span>
              </div>
            )}
          </div>

          {/* Cross-tray Drag Drop Target Banner (Only in customize mode) */}
          {isCustomizeMode && dragOverTray === 'ai' && draggedItem && draggedItem.tray !== 'ai' && (
            <div className="mb-4 py-2 px-4 rounded-xl bg-purple-500/20 border-2 border-dashed border-purple-400 text-purple-200 text-xs font-mono flex items-center justify-center gap-2 animate-pulse shadow-lg">
              <Move size={14} className="text-purple-400" />
              <span>{lang === 'EN' ? '⬇️ Drop here to move video to AI Tray' : '⬇️ এআই ট্রেতে স্থানান্তরের জন্য এখানে ছেড়ে দিন'}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {aiProjects.map((p, index) => (
              <div
                key={p.id}
                draggable={true}
                onDragStart={() => handleDragStart('ai', index, p)}
                onDragOver={(e) => handleDragOver(e, 'ai', index)}
                onDrop={() => handleDrop('ai', index)}
                onDragEnd={handleDragEnd}
                className={`transition-all duration-200 h-full ${
                  draggedItem?.project?.id === p.id
                    ? 'opacity-40 scale-95 border-dashed border-2 border-purple-400 rounded-xl'
                    : dragOverIndex === index && dragOverTray === 'ai'
                    ? 'border-2 border-purple-400 scale-[1.02] rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.4)]'
                    : ''
                }`}
              >
                <VideoStandardCard
                  project={p}
                  lang={lang}
                  accentColor="purple"
                  isReorderMode={isCustomizeMode}
                  isDeleteMode={isDeleteMode}
                  isOwner={isOwner}
                  onSettings={() => openEditVideoModal(p, 'ai')}
                  onEditTitle={(proj) => openTextEditModal({
                    type: 'video',
                    id: proj.id,
                    tray: 'ai',
                    currentText: proj.title,
                    titleLabel: lang === 'EN' ? 'Edit Video Title' : 'ভিডিওর শিরোনাম পরিবর্তন করুন',
                  })}
                  index={index}
                  totalInTray={aiProjects.length}
                  currentTray="ai"
                  onMoveLeft={(e) => handleMoveCard('ai', index, 'left', e)}
                  onMoveRight={(e) => handleMoveCard('ai', index, 'right', e)}
                  onDelete={(e) => promptDeleteVideo('ai', p.id, e)}
                  onPlay={() => setActiveVideo(p)}
                  onMoveToTray={(target) => handleMoveToCategory('ai', index, target)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════════
            TRAY 4: রিলস ভিডিও (Reels Tray - ALWAYS VISIBLE, NEVER HIDDEN)
            ═════════════════════════════════════════════════════════════════════════ */}
        <div
          id="tray-reels"
          className="mb-4 scroll-mt-24"
          onDragOver={(e) => handleDragOver(e, 'reels')}
          onDrop={() => handleDrop('reels', reelsProjects.length)}
        >
          {/* Centered Compact Minimalist Headline */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-sans font-medium tracking-widest uppercase text-zinc-300">
                {getHeadline('reels')}
              </h3>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => openTextEditModal({
                    type: 'headline',
                    id: 'reels',
                    currentText: getHeadline('reels'),
                    titleLabel: lang === 'EN' ? 'Edit Reels Headline' : 'রিলস হেডলাইন পরিবর্তন করুন',
                  })}
                  className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title={lang === 'EN' ? 'Customize Headline' : 'হেডলাইন পরিবর্তন করুন'}
                >
                  <Edit3 size={11} />
                </button>
              )}
            </div>
            {isOwner && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadCategory('reels');
                    setUploadSourceType('file');
                    setIsUploadModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono transition-all cursor-pointer shadow-sm"
                  title={lang === 'EN' ? 'Upload reel file to Reels Tray' : 'রিলস ট্রেতে ফাইল থেকে ভিডিও আপলোড করুন'}
                >
                  <Upload size={11} />
                  <span>{lang === 'EN' ? '+ Upload Reel' : '+ রিলস আপলোড'}</span>
                </button>
                <span className="text-[10px] font-mono text-zinc-500">
                  {reelsProjects.length} {lang === 'EN' ? 'reels' : 'টি রিলস'}
                </span>
              </div>
            )}
          </div>

          {/* Cross-tray Drag Drop Target Banner (Only in customize mode) */}
          {isCustomizeMode && dragOverTray === 'reels' && draggedItem && draggedItem.tray !== 'reels' && (
            <div className="mb-4 py-2 px-4 rounded-xl bg-rose-500/20 border-2 border-dashed border-rose-400 text-rose-200 text-xs font-mono flex items-center justify-center gap-2 animate-pulse shadow-lg">
              <Move size={14} className="text-rose-400" />
              <span>{lang === 'EN' ? '⬇️ Drop here to move video to Reels Tray' : '⬇️ রিলস ট্রেতে স্থানান্তরের জন্য এখানে ছেড়ে দিন'}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reelsProjects.map((p, index) => (
              <div
                key={p.id}
                draggable={true}
                onDragStart={() => handleDragStart('reels', index, p)}
                onDragOver={(e) => handleDragOver(e, 'reels', index)}
                onDrop={() => handleDrop('reels', index)}
                onDragEnd={handleDragEnd}
                className={`transition-all duration-200 h-full ${
                  draggedItem?.project?.id === p.id
                    ? 'opacity-40 scale-95 border-dashed border-2 border-rose-400 rounded-xl'
                    : dragOverIndex === index && dragOverTray === 'reels'
                    ? 'border-2 border-rose-400 scale-[1.02] rounded-xl shadow-[0_0_20px_rgba(251,113,133,0.4)]'
                    : ''
                }`}
              >
                <VideoStandardCard
                  project={p}
                  lang={lang}
                  accentColor="rose"
                  isReorderMode={isCustomizeMode}
                  isDeleteMode={isDeleteMode}
                  isOwner={isOwner}
                  onSettings={() => openEditVideoModal(p, 'reels')}
                  onEditTitle={(proj) => openTextEditModal({
                    type: 'video',
                    id: proj.id,
                    tray: 'reels',
                    currentText: proj.title,
                    titleLabel: lang === 'EN' ? 'Edit Video Title' : 'ভিডিওর শিরোনাম পরিবর্তন করুন',
                  })}
                  index={index}
                  totalInTray={reelsProjects.length}
                  currentTray="reels"
                  onMoveLeft={(e) => handleMoveCard('reels', index, 'left', e)}
                  onMoveRight={(e) => handleMoveCard('reels', index, 'right', e)}
                  onDelete={(e) => promptDeleteVideo('reels', p.id, e)}
                  onPlay={() => setActiveVideo(p)}
                  onMoveToTray={(target) => handleMoveToCategory('reels', index, target)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════
          VIDEO PLAYER MODAL (Plays Vimeo, YouTube, or Local Uploaded Video Files)
          ═════════════════════════════════════════════════════════════════════════ */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/92 backdrop-blur-xl animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          {/* Floating Back Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveVideo(null);
            }}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold shadow-[0_4px_25px_rgba(239,68,68,0.5)] border border-red-400/50 cursor-pointer transition-all duration-200 click-bounce"
            title="Back / Close Video"
          >
            <ArrowLeft size={15} />
            <span>{lang === 'EN' ? 'Back / Close' : 'ব্যাক / বন্ধ করুন'}</span>
          </button>

          <div
            className={`relative w-full ${
              activeVideo.aspectRatio === '9:16' ? 'max-w-md' : 'max-w-4xl'
            } bg-[#121316] border border-gold/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(212,175,55,0.2)] overflow-hidden flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between bg-black/50 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button
                  onClick={() => setActiveVideo(null)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-red-600 text-white border border-white/20 hover:border-red-500 font-mono text-xs font-bold transition-all duration-200 cursor-pointer click-bounce flex-shrink-0"
                  title="Back"
                >
                  <ArrowLeft size={14} />
                  <span>{lang === 'EN' ? 'Back' : 'ব্যাক'}</span>
                </button>

                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border bg-gold/10 border-gold/40 text-gold flex-shrink-0">
                  {activeVideo.category}
                </span>

                <h3 className="font-serif text-sm sm:text-base font-bold text-white truncate">
                  {lang === 'BN' && activeVideo.titleBn ? activeVideo.titleBn : activeVideo.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => promptDeleteVideo(findTrayForId(activeVideo.id), activeVideo.id, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 hover:border-red-500 font-mono text-xs font-semibold transition-all cursor-pointer"
                  title={lang === 'EN' ? 'Delete this video' : 'ভিডিওটি মুছে ফেলুন'}
                >
                  <Trash2 size={13} />
                  <span>{lang === 'EN' ? 'Delete Video' : 'ভিডিও মুছুন'}</span>
                </button>

                {activeVideo.url && !activeVideo.url.startsWith('blob:') && (
                  <a
                    href={activeVideo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-gold transition-colors"
                    title="Open Video Link"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}

                <button
                  onClick={() => setActiveVideo(null)}
                  className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 hover:border-red-500 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Video Player Display: Supports File or Vimeo Iframe */}
            <div
              className={`w-full bg-black relative flex items-center justify-center ${
                activeVideo.aspectRatio === '9:16' ? 'h-[65vh] max-h-[580px]' : 'aspect-video'
              }`}
            >
              {activeVideo.platform === 'file' || activeVideo.localVideoUrl || activeVideo.url.startsWith('blob:') ? (
                <video
                  src={activeVideo.localVideoUrl || activeVideo.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black"
                  onError={() => {
                    if (activeVideo.videoId && VIMEO_HASHES[activeVideo.videoId]) {
                      setActiveVideo({
                        ...activeVideo,
                        platform: 'vimeo',
                        localVideoUrl: undefined,
                        url: `https://vimeo.com/${activeVideo.videoId}`,
                      });
                    }
                  }}
                />
              ) : (
                <iframe
                  src={getVimeoEmbedUrl(activeVideo.videoId, activeVideo.url)}
                  title={activeVideo.title}
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-b from-[#121316] to-[#0c0d10] flex flex-col gap-2">
              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                {activeVideo.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs font-mono text-zinc-400">
                <div className="flex flex-wrap items-center gap-1.5">
                  {activeVideo.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gold font-bold">Duration: {activeVideo.duration}</span>
                  <button
                    onClick={(e) => promptDeleteVideo(findTrayForId(activeVideo.id), activeVideo.id, e)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-mono font-semibold transition-all duration-200 cursor-pointer"
                    title={lang === 'EN' ? 'Delete this video' : 'ভিডিও মুছে ফেলুন'}
                  >
                    <Trash2 size={12} />
                    <span>{lang === 'EN' ? 'Delete' : 'মুছুন'}</span>
                  </button>
                  <button
                    onClick={() => setActiveVideo(null)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-gold hover:text-black text-white font-mono text-xs font-semibold transition-all duration-200 cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>{lang === 'EN' ? 'Back' : 'ফিরে যান'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          CUSTOM IN-APP DELETE CONFIRMATION DIALOG (Works 100% in iFrames)
          ═════════════════════════════════════════════════════════════════════════ */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#14151e] border-2 border-red-500/50 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(239,68,68,0.25)] p-5 overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Alert Icon & Title */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <Trash2 size={20} className="animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-white">
                  {lang === 'EN' ? 'Confirm Video Deletion' : 'ভিডিও মুছে ফেলার নিশ্চিতকরণ'}
                </h3>
                <p className="text-[11px] font-mono text-red-400">
                  {lang === 'EN' ? 'This action can be undone anytime' : 'প্রয়োজনে আনডু বা রিসেট করে ফিরিয়ে আনা যাবে'}
                </p>
              </div>
            </div>

            {/* Target Item Preview */}
            <div className="mb-4 p-3 rounded-xl bg-black/60 border border-white/10 flex items-center gap-3">
              {deleteTarget.thumbnailUrl && (
                <div className="w-20 aspect-video rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10">
                  <img
                    src={deleteTarget.thumbnailUrl}
                    alt={deleteTarget.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-gold uppercase font-bold">
                  {deleteTarget.tray === 'saas' ? 'SaaS' : deleteTarget.tray}
                </span>
                <h4 className="text-xs sm:text-sm font-serif font-bold text-white truncate mt-1">
                  {deleteTarget.title}
                </h4>
              </div>
            </div>

            <p className="text-xs text-zinc-300 font-sans mb-5 leading-relaxed">
              {lang === 'EN'
                ? `Are you sure you want to delete "${deleteTarget.title}"? It will be safely moved to your Recycle Bin where you can restore it anytime or delete it forever.`
                : `আপনি কি "${deleteTarget.title}" ভিডিওটি ডিলিট করতে চান? এটি রিসাইকেল বিনে জমা থাকবে এবং আপনি যেকোনো সময় সেখান থেকে ফিরিয়ে আনতে পারবেন অথবা চিরতরে সম্পূর্ণ মুছে ফেলতে পারবেন।`}
            </p>

            {/* Modal Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={confirmExecuteDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all cursor-pointer click-bounce"
              >
                <Trash2 size={14} />
                <span>{lang === 'EN' ? 'Move to Recycle Bin' : 'রিসাইকেল বিনে পাঠান'}</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 font-mono text-xs font-semibold transition-all cursor-pointer"
              >
                <span>{lang === 'EN' ? 'Cancel' : 'বাতিল'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          RECYCLE BIN / TRASH MODAL (রিসাইকেল বিন - ডিলিট করা ভিডিও ফিরিয়ে আনা বা সম্পূর্ণ ডিলিট করা)
          ═════════════════════════════════════════════════════════════════════════ */}
      {isTrashModalOpen && (
        <div
          className="fixed inset-0 z-[105] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setIsTrashModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[#11131c] border border-rose-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(244,63,94,0.2)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#19111a] to-[#10121a] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-md">
                  <Trash2 size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>{lang === 'EN' ? 'Recycle Bin / Trash' : 'রিসাইকেল বিন (ডিলিট করা ভিডিও)'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold">
                      {trashItems.length} {lang === 'EN' ? 'items' : 'টি আইটেম'}
                    </span>
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400">
                    {lang === 'EN'
                      ? 'Restore deleted videos back to the page or permanently delete them forever.'
                      : 'এখান থেকে ভিডিও ফিরিয়ে আনতে পারেন অথবা চিরতরে সম্পূর্ণ মুছে ফেলতে পারেন।'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTrashModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 divide-y divide-white/5">
              {trashItems.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-zinc-600">
                    <Trash2 size={28} />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-zinc-300">
                      {lang === 'EN' ? 'Recycle Bin is Empty' : 'রিসাইকেল বিন সম্পূর্ণ খালি'}
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-sm mt-1">
                      {lang === 'EN'
                        ? 'No deleted videos right now. Any video you delete from the page will safely appear here.'
                        : 'বর্তমানে কোনো ডিলিট করা ভিডিও নেই। পেজ থেকে কোনো ভিডিও ডিলিট করলে তা এখানে জমা থাকবে।'}
                    </p>
                  </div>
                </div>
              ) : (
                trashItems.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-20 aspect-video rounded-lg object-cover bg-black flex-shrink-0 border border-white/10"
                        />
                      ) : (
                        <div className="w-20 aspect-video rounded-lg bg-black/60 flex items-center justify-center text-zinc-600 flex-shrink-0 border border-white/10">
                          <Film size={18} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-gold uppercase font-bold">
                            {item.tray === 'saas' ? 'SaaS' : item.tray}
                          </span>
                          {item.deletedAt && (
                            <span className="text-[10px] font-mono text-zinc-500">
                              {item.deletedAt}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-serif font-bold text-white truncate mt-1">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    {/* Action buttons: Restore vs Delete Permanently */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleRestoreSingleTrashItem(item)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm click-bounce"
                        title={lang === 'EN' ? 'Restore video to page' : 'পেজে ফিরিয়ে আনুন'}
                      >
                        <RotateCcw size={12} />
                        <span>{lang === 'EN' ? 'Restore' : 'ফিরিয়ে আনুন'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePermanentlyDeleteTrashItem(item.id, item.title)}
                        className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm click-bounce"
                        title={lang === 'EN' ? 'Permanently delete forever' : 'চিরতরে সম্পূর্ণ ডিলিট'}
                      >
                        <Trash2 size={12} />
                        <span>{lang === 'EN' ? 'Delete Forever' : 'সম্পূর্ণ ডিলিট'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer with Empty Trash & Restore All option */}
            {trashItems.length > 0 && (
              <div className="p-3.5 bg-black/70 border-t border-white/10 flex items-center justify-between gap-3">
                <span className="text-xs font-mono text-zinc-400">
                  {lang === 'EN' ? `${trashItems.length} videos in trash` : `রিসাইকেল বিনে ${trashItems.length}টি ভিডিও রয়েছে`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRestoreAllDeleted}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 hover:text-white font-mono text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw size={12} />
                    <span>{lang === 'EN' ? 'Restore All' : 'সব ফিরিয়ে আনুন'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEmptyTrash}
                    className="px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/50 font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm click-bounce"
                  >
                    <Trash2 size={12} />
                    <span>{lang === 'EN' ? 'Empty Recycle Bin' : 'সব সম্পূর্ণ ডিলিট'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          MANAGE ALL VIDEOS MODAL (Comprehensive Quick Deletion List)
          ═════════════════════════════════════════════════════════════════════════ */}
      {isManageModalOpen && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setIsManageModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[#12141c] border border-white/20 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-black/80 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Trash2 size={16} />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white">
                    {lang === 'EN' ? 'Manage & Delete Portfolio Videos' : 'পোর্টফোলিও ভিডিও ম্যানেজ ও ডিলিট তালিকা'}
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400">
                    {lang === 'EN' ? 'Click "Delete" next to any video to remove it' : 'যেকোনো ভিডিওর পাশে "মুছে ফেলুন" বাটনে ক্লিক করুন'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsManageModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* List */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-white/5">
              {saasProject && (
                <div className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={saasProject.thumbnailUrl}
                      alt={saasProject.title}
                      className="w-16 aspect-video rounded-lg object-cover bg-black flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/30 font-bold uppercase">
                        SaaS Featured
                      </span>
                      <p className="text-xs font-bold text-white truncate mt-0.5">{saasProject.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => promptDeleteVideo('saas', saasProject.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Trash2 size={12} />
                    <span>{lang === 'EN' ? 'Delete' : 'মুছে ফেলুন'}</span>
                  </button>
                </div>
              )}

              {/* Lower animation list */}
              {animProjects.map((p) => (
                <div key={p.id} className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.thumbnailUrl}
                      alt={p.title}
                      className="w-16 aspect-video rounded-lg object-cover bg-black flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold uppercase">
                        Animation
                      </span>
                      <p className="text-xs font-bold text-white truncate mt-0.5">{p.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => promptDeleteVideo('anim', p.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Trash2 size={12} />
                    <span>{lang === 'EN' ? 'Delete' : 'মুছে ফেলুন'}</span>
                  </button>
                </div>
              ))}

              {/* Podcast list */}
              {podcastProjects.map((p) => (
                <div key={p.id} className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.thumbnailUrl}
                      alt={p.title}
                      className="w-16 aspect-video rounded-lg object-cover bg-black flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                        Podcast
                      </span>
                      <p className="text-xs font-bold text-white truncate mt-0.5">{p.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => promptDeleteVideo('podcast', p.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Trash2 size={12} />
                    <span>{lang === 'EN' ? 'Delete' : 'মুছে ফেলুন'}</span>
                  </button>
                </div>
              ))}

              {/* AI list */}
              {aiProjects.map((p) => (
                <div key={p.id} className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.thumbnailUrl}
                      alt={p.title}
                      className="w-16 aspect-video rounded-lg object-cover bg-black flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold uppercase">
                        AI Video
                      </span>
                      <p className="text-xs font-bold text-white truncate mt-0.5">{p.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => promptDeleteVideo('ai', p.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Trash2 size={12} />
                    <span>{lang === 'EN' ? 'Delete' : 'মুছে ফেলুন'}</span>
                  </button>
                </div>
              ))}

              {/* Reels list */}
              {reelsProjects.map((p) => (
                <div key={p.id} className="pt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.thumbnailUrl}
                      alt={p.title}
                      className="w-12 aspect-[9/15] rounded-lg object-cover bg-black flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold uppercase">
                        Reels
                      </span>
                      <p className="text-xs font-bold text-white truncate mt-0.5">{p.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => promptDeleteVideo('reels', p.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Trash2 size={12} />
                    <span>{lang === 'EN' ? 'Delete' : 'মুছে ফেলুন'}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 bg-black/60 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">
                {lang === 'EN' ? 'Need to bring back all original videos?' : 'সব মূল ভিডিও আবার ফিরিয়ে আনতে চান?'}
              </span>
              <button
                onClick={() => {
                  handleResetOrder();
                  setIsManageModalOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>{lang === 'EN' ? 'Reset All Defaults' : 'সব রিসেট করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          CUSTOMIZE TEXT / TITLE MODAL (ভিডিও শিরোনাম ও হেডলাইন কাস্টমাইজেশন)
          ═════════════════════════════════════════════════════════════════════════ */}
      {textEditModal.isOpen && (
        <div
          className="fixed inset-0 z-[98] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setTextEditModal((prev) => ({ ...prev, isOpen: false }))}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#0f1118] border border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(251,191,36,0.2)] p-5 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Edit3 size={15} />
                </div>
                <div>
                  <h3 className="font-sans text-sm font-semibold text-white">
                    {textEditModal.titleLabel || (lang === 'EN' ? 'Customize Text' : 'লেখা পরিবর্তন করুন')}
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-400">
                    {lang === 'EN' ? 'Changes are automatically saved' : 'পরিবর্তন স্বয়ংক্রিয়ভাবে সেভ হবে'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTextEditModal((prev) => ({ ...prev, isOpen: false }))}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                {lang === 'EN' ? 'Title / Headline Text' : 'শিরোনাম / হেডলাইন টেক্সট'}
              </label>
              <input
                type="text"
                autoFocus
                value={textEditValue}
                onChange={(e) => setTextEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveCustomText();
                  }
                }}
                placeholder={lang === 'EN' ? 'Enter title...' : 'শিরোনাম লিখুন...'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 text-white text-xs font-sans outline-none transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  if (textEditModal.type === 'headline') {
                    const key = textEditModal.id as 'saas' | 'anim' | 'podcast' | 'ai' | 'reels';
                    setCustomHeadlines((prev) => {
                      const updated = { ...prev };
                      delete updated[key];
                      return updated;
                    });
                  } else if (textEditModal.type === 'video') {
                    if (textEditModal.tray === 'saas') {
                      setSaasProject(SAAS_ANIMATION_PROJECT);
                    }
                  }
                  setTextEditModal((prev) => ({ ...prev, isOpen: false }));
                  setReorderNotification(lang === 'EN' ? 'Restored default text!' : 'ডিফল্ট টেক্সট ফিরিয়ে আনা হয়েছে!');
                  setTimeout(() => setReorderNotification(null), 3000);
                }}
                className="text-[10px] font-mono text-zinc-400 hover:text-amber-300 underline cursor-pointer"
              >
                {lang === 'EN' ? 'Reset to default' : 'ডিফল্টে ফিরুন'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTextEditModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-mono text-xs transition-colors cursor-pointer"
                >
                  {lang === 'EN' ? 'Cancel' : 'বাতিল'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomText}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.3)] flex items-center gap-1.5"
                >
                  <Check size={13} />
                  <span>{lang === 'EN' ? 'Save Changes' : 'সেভ করুন'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          UPLOAD VIDEO MODAL (Direct file upload or URL)
          ═════════════════════════════════════════════════════════════════════════ */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="relative max-w-xl w-full bg-[#13151f] border border-gold/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(212,175,55,0.2)] overflow-hidden flex flex-col p-6 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                  <Video size={16} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white leading-tight">
                    {lang === 'EN' ? 'Upload Video to Portfolio' : 'পোর্টফোলিওতে নতুন ভিডিও আপলোড'}
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {lang === 'EN' ? 'Upload video file from device or add Vimeo link' : 'ডিভাইস থেকে ফাইল নির্বাচন করুন অথবা লিংক দিন'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Source Tab: File vs Link */}
            <div className="flex rounded-xl bg-black/50 p-1 border border-white/10 mb-4">
              <button
                type="button"
                onClick={() => setUploadSourceType('file')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  uploadSourceType === 'file'
                    ? 'bg-gold text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {lang === 'EN' ? '📁 File from Device' : '📁 ফাইল থেকে আপলোড'}
              </button>
              <button
                type="button"
                onClick={() => setUploadSourceType('url')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  uploadSourceType === 'url'
                    ? 'bg-gold text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {lang === 'EN' ? '🔗 Vimeo / Web URL' : '🔗 ভিডিও লিংক'}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {uploadSourceType === 'file' ? (
                /* Video File Dropzone */
                <div>
                  <label className="block text-[11px] font-mono text-gold uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Video File (.mp4, .mov, .webm)' : 'ভিডিও ফাইল নির্বাচন করুন'} *
                  </label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
                    }}
                    onClick={() => videoInputRef.current?.click()}
                    className={`relative w-full rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer p-4 ${
                      videoPreviewUrl
                        ? 'border-gold bg-black/60'
                        : 'border-white/20 hover:border-gold/60 bg-white/[0.02] hover:bg-gold/[0.03]'
                    }`}
                  >
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />

                    {videoPreviewUrl ? (
                      <div className="w-full flex flex-col items-center gap-2">
                        <video
                          src={videoPreviewUrl}
                          controls
                          playsInline
                          className="max-h-48 w-full object-contain rounded-lg bg-black border border-white/10"
                        />
                        <div className="text-[11px] font-mono text-gold flex items-center gap-1.5">
                          <CheckCircle2 size={13} />
                          <span>{uploadFile?.name || 'Video loaded successfully'}</span>
                          <span className="text-zinc-400 font-sans">({lang === 'EN' ? 'Click to replace' : 'পরিবর্তন করতে ক্লিক করুন'})</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center py-5">
                        <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center text-gold">
                          <Video size={24} />
                        </div>
                        <p className="text-xs font-serif font-bold text-white">
                          {lang === 'EN' ? 'Click to select or Drag & Drop video here' : 'ভিডিও ফাইল নির্বাচন করতে ক্লিক করুন বা ড্র্যাগ করুন'}
                        </p>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Supports MP4, MOV, WebM, MKV
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Vimeo / Video URL Input */
                <div>
                  <label className="block text-[11px] font-mono text-gold uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Vimeo or Video URL' : 'ভিডিওর ইউআরএল বা ভিমো লিংক'} *
                  </label>
                  <input
                    type="url"
                    required
                    value={uploadVideoUrl}
                    onChange={(e) => setUploadVideoUrl(e.target.value)}
                    placeholder="https://vimeo.com/1229887460"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-gold text-white text-xs font-sans outline-none transition-colors"
                  />
                </div>
              )}

              {/* Category / Tray Selector */}
              <div>
                <label className="block text-[11px] font-mono text-gold uppercase tracking-wider mb-1">
                  {lang === 'EN' ? 'Select Video Tray / Category' : 'ভিডিওর ক্যাটাগরি বা ট্রে নির্বাচন করুন'} *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'anim', label: lang === 'EN' ? '1. Animation (16:9)' : '১. এনিমেশন ভিডিও (16:9)', color: 'border-amber-400' },
                    { id: 'podcast', label: lang === 'EN' ? '2. Podcast (16:9)' : '২. পডকাস্ট ভিডিও (16:9)', color: 'border-cyan-400' },
                    { id: 'ai', label: lang === 'EN' ? '3. AI Video (16:9)' : '৩. এআই ভিডিও (16:9)', color: 'border-purple-400' },
                    { id: 'reels', label: lang === 'EN' ? '4. Reels (9:16 Vertical)' : '৪. রিলস ভিডিও (9:16)', color: 'border-rose-400' },
                  ].map((tray) => (
                    <button
                      type="button"
                      key={tray.id}
                      onClick={() => setUploadCategory(tray.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-mono text-left transition-all cursor-pointer ${
                        uploadCategory === tray.id
                          ? 'bg-gold/20 border-gold text-white font-bold shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                          : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {tray.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono text-gold uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Video Title' : 'ভিডিওর টাইটেল / নাম'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder={lang === 'EN' ? 'e.g. Commercial Kinetic Typography Cut' : 'যেমন: প্রিমিয়ার মোশন ডিজাইন কাট'}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-gold text-white text-xs font-sans outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gold uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Duration' : 'দৈর্ঘ্য'}
                  </label>
                  <input
                    type="text"
                    value={uploadDuration}
                    onChange={(e) => setUploadDuration(e.target.value)}
                    placeholder="0:30"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-gold text-white text-xs font-sans outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Optional Custom Thumbnail Picker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-gold uppercase tracking-wider">
                    {lang === 'EN' ? 'Thumbnail (Auto-generated or custom)' : 'থাম্বনেইল (স্বয়ংক্রিয় বা কাস্টম ছবি)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current?.click()}
                    className="text-[10px] font-mono text-zinc-400 hover:text-gold cursor-pointer inline-flex items-center gap-1"
                  >
                    <ImageIcon size={11} />
                    <span>{lang === 'EN' ? 'Upload Custom Image' : 'কাস্টম ছবি দিন'}</span>
                  </button>
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleCustomThumbnail(e.target.files[0])}
                    className="hidden"
                  />
                </div>

                {thumbnailPreview && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-black/50 border border-white/10">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-16 h-10 object-cover rounded border border-white/20"
                    />
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      {lang === 'EN' ? 'Thumbnail ready' : 'থাম্বনেইল প্রস্তুত'}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gold uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Tags (comma separated)' : 'ট্যাগস (কমা দিয়ে লিখুন)'}
                  </label>
                  <input
                    type="text"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="Motion, Commercial, VFX"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-gold text-white text-xs font-sans outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gold uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Description' : 'সংক্ষিপ্ত বিবরণ'}
                  </label>
                  <input
                    type="text"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder={lang === 'EN' ? 'Brief notes on editing and style' : 'এডিটিং কনসেপ্ট বা ক্লায়েন্ট'}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-gold text-white text-xs font-sans outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-mono text-xs transition-colors cursor-pointer"
                >
                  {lang === 'EN' ? 'Cancel' : 'বাতিল'}
                </button>

                <button
                  type="submit"
                  disabled={isProcessingUpload || uploadSuccess}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gold hover:bg-amber-400 text-black font-mono text-xs font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {uploadSuccess ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>{lang === 'EN' ? 'Video Added!' : 'ভিডিও যুক্ত হয়েছে!'}</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>{lang === 'EN' ? 'Publish Video' : 'ভিডিও সেভ ও পাবলিশ করুন'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          SAAS MASTER REEL SETTINGS / CHANGE MODAL
          (ইচ্ছামতো ফাইল থেকে আপলোড বা লিংক দিয়ে ভিডিও পরিবর্তনের পূর্ণাঙ্গ সেটিংস)
          ═════════════════════════════════════════════════════════════════════════ */}
      {isChangeSaasModalOpen && (
        <div
          className="fixed inset-0 z-[96] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setIsChangeSaasModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl max-h-[90vh] rounded-2xl bg-[#0f1118] border border-cyan-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#141724] to-[#0d0e14] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <Settings size={16} />
                </div>
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>{lang === 'EN' ? 'Customize Saas Master REEL' : 'সাস মাস্টার রিল ভিডিও পরিবর্তন সেটিংস'}</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    {lang === 'EN'
                      ? 'Upload your own video file or link to replace this reel anytime'
                      : 'ফাইল থেকে যেকোনো ভিডিও আপলোড করুন বা লিংক দিয়ে পরিবর্তন করুন'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsChangeSaasModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSaasVideo} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Source Switcher */}
              <div>
                <label className="block text-[11px] font-mono text-cyan-300 uppercase tracking-wider mb-1.5">
                  {lang === 'EN' ? 'Video Source Method' : 'ভিডিও আনার মাধ্যম'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSaasSourceType('file')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      saasSourceType === 'file'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Upload size={14} />
                    <span>{lang === 'EN' ? 'File from Computer' : 'কম্পিউটার/ফাইল থেকে'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSaasSourceType('url')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      saasSourceType === 'url'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <LinkIcon size={14} />
                    <span>{lang === 'EN' ? 'Vimeo / Video Link' : 'অনলাইন ভিডিও লিংক'}</span>
                  </button>
                </div>
              </div>

              {/* Source Content */}
              {saasSourceType === 'file' ? (
                <div>
                  <label className="block text-[11px] font-mono text-cyan-300 uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Choose Video File' : 'ভিডিও ফাইল নির্বাচন করুন'}
                  </label>
                  <div
                    onClick={() => saasVideoInputRef.current?.click()}
                    className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-xl p-4 bg-cyan-950/20 hover:bg-cyan-950/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center"
                  >
                    <input
                      ref={saasVideoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={(e) => e.target.files?.[0] && handleSaasFileSelect(e.target.files[0])}
                      className="hidden"
                    />

                    {saasPreviewUrl ? (
                      <div className="w-full flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <video
                          src={saasPreviewUrl}
                          controls
                          playsInline
                          className="max-h-44 w-full object-contain rounded-lg bg-black border border-cyan-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => saasVideoInputRef.current?.click()}
                          className="text-[11px] font-mono text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 size={13} className="text-cyan-400" />
                          <span>{saasUploadFile?.name || 'Video loaded'}</span>
                          <span className="text-zinc-400">({lang === 'EN' ? 'Click to change file' : 'ফাইল বদলাতে ক্লিক করুন'})</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                          <Video size={20} />
                        </div>
                        <p className="text-xs font-serif font-bold text-white">
                          {lang === 'EN' ? 'Click to choose video from your files' : 'ফাইল থেকে ভিডিও নির্বাচন করতে এখানে ক্লিক করুন'}
                        </p>
                        <span className="text-[10px] font-mono text-zinc-500">
                          MP4, MOV, WebM (Auto-saved securely)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-mono text-cyan-300 uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Vimeo or Direct Video URL' : 'ভিমো বা সরাসরি ভিডিও লিংক'} *
                  </label>
                  <input
                    type="url"
                    value={saasVideoUrl}
                    onChange={(e) => setSaasVideoUrl(e.target.value)}
                    placeholder="https://vimeo.com/1229887460"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 text-white text-xs font-sans outline-none transition-colors"
                  />
                </div>
              )}

              {/* Title & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono text-cyan-300 uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Reel Title' : 'রিল টাইটেল / নাম'}
                  </label>
                  <input
                    type="text"
                    value={saasTitle}
                    onChange={(e) => setSaasTitle(e.target.value)}
                    placeholder="Saas Master REEL"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 text-white text-xs font-sans outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-cyan-300 uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Duration' : 'দৈর্ঘ্য'}
                  </label>
                  <input
                    type="text"
                    value={saasDuration}
                    onChange={(e) => setSaasDuration(e.target.value)}
                    placeholder="0:15"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 text-white text-xs font-sans outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-mono text-cyan-300 uppercase tracking-wider mb-1">
                  {lang === 'EN' ? 'Description' : 'বিবরণ'}
                </label>
                <textarea
                  rows={2}
                  value={saasDescription}
                  onChange={(e) => setSaasDescription(e.target.value)}
                  placeholder="Dynamic SaaS walkthrough & high-impact visual motion."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 text-white text-xs font-sans outline-none resize-none transition-colors"
                />
              </div>

              {/* Custom Thumbnail Picker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider">
                    {lang === 'EN' ? 'Cover / Thumbnail Image' : 'থাম্বনেইল / কভার ছবি'}
                  </label>
                  <button
                    type="button"
                    onClick={() => saasThumbInputRef.current?.click()}
                    className="text-[10px] font-mono text-zinc-400 hover:text-cyan-300 cursor-pointer inline-flex items-center gap-1"
                  >
                    <ImageIcon size={11} />
                    <span>{lang === 'EN' ? 'Upload Custom Image' : 'কাস্টম ছবি দিন'}</span>
                  </button>
                  <input
                    ref={saasThumbInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleSaasCustomThumbnail(e.target.files[0])}
                    className="hidden"
                  />
                </div>

                {saasThumbPreview && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-black/50 border border-white/10">
                    <img
                      src={saasThumbPreview}
                      alt="Thumbnail preview"
                      className="w-16 h-10 object-cover rounded border border-cyan-400/40"
                    />
                    <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      {lang === 'EN' ? 'Thumbnail ready' : 'থাম্বনেইল প্রস্তুত'}
                    </span>
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetSaasDefault}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                  title="Restore original video"
                >
                  <RotateCcw size={12} className="inline mr-1" />
                  <span>{lang === 'EN' ? 'Reset to Default' : 'মূল ভিডিওতে ফিরুন'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsChangeSaasModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono transition-colors cursor-pointer"
                  >
                    {lang === 'EN' ? 'Cancel' : 'বাতিল'}
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessingSaas}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-mono text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50 click-bounce"
                  >
                    {saasUpdateSuccess ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>{lang === 'EN' ? 'Updated!' : 'আপডেট হয়েছে!'}</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>{lang === 'EN' ? 'Save & Apply' : 'সংরক্ষণ ও পরিবর্তন করুন'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════
          UNIVERSAL VIDEO EDIT / CHANGE MODAL
          (যেকোনো ভিডিওর ফাইল বদলানো, লিংক বদলানো, থাম্বনেইল পরিবর্তন ও টাইটেল এডিট)
          ═════════════════════════════════════════════════════════════════════════ */}
      {editingVideoItem && (
        <div
          className="fixed inset-0 z-[115] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setEditingVideoItem(null)}
        >
          <div
            className="relative w-full max-w-xl max-h-[90vh] rounded-2xl bg-[#0f1118] border border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#171520] to-[#0d0e14] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Settings size={16} />
                </div>
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>{lang === 'EN' ? 'Change Video & Thumbnail' : 'ভিডিও ও থাম্বনেইল পরিবর্তন করুন'}</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-sans">
                    {lang === 'EN'
                      ? 'Upload your own video file or link to replace this video anytime'
                      : 'ফাইল থেকে যেকোনো ভিডিও আপলোড করুন বা লিংক দিয়ে পরিবর্তন করুন'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingVideoItem(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEditVideo} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Source Switcher */}
              <div>
                <label className="block text-[11px] font-mono text-amber-300 uppercase tracking-wider mb-1.5">
                  {lang === 'EN' ? 'Video Source Method' : 'ভিডিও আনার মাধ্যম'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditVideoSourceType('file')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      editVideoSourceType === 'file'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Upload size={14} />
                    <span>{lang === 'EN' ? 'File from Computer/Phone' : 'কম্পিউটার/ফাইল থেকে'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditVideoSourceType('url')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      editVideoSourceType === 'url'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <LinkIcon size={14} />
                    <span>{lang === 'EN' ? 'YouTube / Vimeo / MP4 Link' : 'অনলাইন ভিডিও লিংক'}</span>
                  </button>
                </div>
              </div>

              {/* Source Content */}
              {editVideoSourceType === 'file' ? (
                <div>
                  <label className="block text-[11px] font-mono text-amber-300 uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Choose Video File' : 'ভিডিও ফাইল নির্বাচন করুন'}
                  </label>
                  <div
                    onClick={() => editVideoFileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 rounded-xl p-4 bg-amber-950/20 hover:bg-amber-950/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center"
                  >
                    <input
                      ref={editVideoFileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={(e) => e.target.files?.[0] && handleEditVideoFileSelect(e.target.files[0])}
                      className="hidden"
                    />

                    {editVideoPreviewUrl ? (
                      <div className="w-full flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <video
                          src={editVideoPreviewUrl}
                          controls
                          playsInline
                          className="max-h-40 w-full object-contain rounded-lg bg-black border border-amber-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => editVideoFileInputRef.current?.click()}
                          className="text-[11px] font-mono text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 size={13} className="text-amber-400" />
                          <span>{editVideoFile?.name || 'Video loaded'}</span>
                          <span className="text-zinc-400">({lang === 'EN' ? 'Click to change file' : 'ফাইল বদলাতে ক্লিক করুন'})</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
                          <Video size={20} />
                        </div>
                        <p className="text-xs font-serif font-bold text-white">
                          {lang === 'EN' ? 'Click to choose video from your files' : 'ফাইল থেকে ভিডিও নির্বাচন করতে এখানে ক্লিক করুন'}
                        </p>
                        <span className="text-[10px] font-mono text-zinc-500">
                          MP4, MOV, WebM (Saved safely)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-mono text-amber-300 uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Direct Video URL or Embed Link' : 'ইউটিউব, ভিমো বা সরাসরি ভিডিও লিংক'}
                  </label>
                  <input
                    type="url"
                    value={editVideoUrl}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    placeholder="https://youtu.be/... or https://vimeo.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 text-white text-xs font-sans outline-none transition-colors"
                  />
                </div>
              )}

              {/* Title & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono text-amber-300 uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Video Title' : 'ভিডিও শিরোনাম / নাম'} *
                  </label>
                  <input
                    type="text"
                    value={editVideoTitle}
                    onChange={(e) => setEditVideoTitle(e.target.value)}
                    placeholder="Video project title"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 text-white text-xs font-sans outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-amber-300 uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Duration' : 'দৈর্ঘ্য'}
                  </label>
                  <input
                    type="text"
                    value={editVideoDuration}
                    onChange={(e) => setEditVideoDuration(e.target.value)}
                    placeholder="0:30"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 text-white text-xs font-sans outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-mono text-amber-300 uppercase tracking-wider mb-1">
                  {lang === 'EN' ? 'Description' : 'বিবরণ'}
                </label>
                <textarea
                  rows={2}
                  value={editVideoDescription}
                  onChange={(e) => setEditVideoDescription(e.target.value)}
                  placeholder="Creative motion graphics, pacing, and visual story."
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 text-white text-xs font-sans outline-none resize-none transition-colors"
                />
              </div>

              {/* Custom Thumbnail Picker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-amber-300 uppercase tracking-wider">
                    {lang === 'EN' ? 'Cover / Thumbnail Image' : 'থাম্বনেইল / কভার ছবি'}
                  </label>
                  <button
                    type="button"
                    onClick={() => editVideoThumbInputRef.current?.click()}
                    className="text-[10px] font-mono text-zinc-400 hover:text-amber-300 cursor-pointer inline-flex items-center gap-1"
                  >
                    <ImageIcon size={11} />
                    <span>{lang === 'EN' ? 'Upload Custom Image' : 'কাস্টম ছবি দিন'}</span>
                  </button>
                  <input
                    ref={editVideoThumbInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleEditVideoCustomThumbnail(e.target.files[0])}
                    className="hidden"
                  />
                </div>

                {editVideoThumbPreview && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/15 bg-black/80 mt-2">
                    <img
                      src={editVideoThumbPreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-amber-300">
                      Thumbnail Preview
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setEditingVideoItem(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono transition-colors cursor-pointer"
                >
                  {lang === 'EN' ? 'Cancel' : 'বাতিল'}
                </button>

                <button
                  type="submit"
                  disabled={isProcessingEditVideo}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer disabled:opacity-50 click-bounce"
                >
                  {editVideoSuccess ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>{lang === 'EN' ? 'Updated!' : 'আপডেট হয়েছে!'}</span>
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>{lang === 'EN' ? 'Save & Apply Changes' : 'পরিবর্তন সেভ করুন'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

// ═════════════════════════════════════════════════════════════════════════
// 16:9 VIDEO CARD (৩টি করে শাড়িতে, ড্র্যাগ অ্যান্ড ড্রপ ও স্থানান্তর সেটিংসসহ)
// ═════════════════════════════════════════════════════════════════════════
interface VideoStandardCardProps {
  project: Project;
  lang: 'EN' | 'BN';
  accentColor: 'amber' | 'cyan' | 'purple' | 'rose';
  isReorderMode?: boolean;
  isDeleteMode?: boolean;
  isOwner?: boolean;
  onEditTitle?: (project: Project) => void;
  index?: number;
  totalInTray?: number;
  currentTray?: 'anim' | 'podcast' | 'ai' | 'reels';
  onMoveLeft?: (e: React.MouseEvent) => void;
  onMoveRight?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onPlay: () => void;
  onMoveToTray?: (targetTray: 'saas' | 'anim' | 'podcast' | 'ai' | 'reels') => void;
  isFeaturedMaster?: boolean;
  onSettings?: () => void;
}

const VideoStandardCard: React.FC<VideoStandardCardProps> = ({
  project,
  lang,
  accentColor,
  isReorderMode,
  isDeleteMode,
  isOwner,
  onEditTitle,
  index = 0,
  totalInTray = 3,
  currentTray = 'anim',
  onMoveLeft,
  onMoveRight,
  onDelete,
  onPlay,
  onMoveToTray,
  isFeaturedMaster,
  onSettings,
}) => {
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const showReorder = isOwner || isReorderMode;

  const accentStyles = {
    amber: {
      border: 'hover:border-amber-400/60',
      badge: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
      aura: 'bg-amber-400/25',
      playBorder: 'border-amber-400/60 group-hover:border-amber-400',
      playFill: 'fill-amber-400 text-amber-400',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.15)]',
    },
    cyan: {
      border: 'hover:border-cyan-400/60',
      badge: 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300',
      aura: 'bg-cyan-400/25',
      playBorder: 'border-cyan-400/60 group-hover:border-cyan-400',
      playFill: 'fill-cyan-400 text-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(34,211,238,0.15)]',
    },
    purple: {
      border: 'hover:border-purple-400/60',
      badge: 'bg-purple-950/70 border-purple-500/40 text-purple-300',
      aura: 'bg-purple-400/25',
      playBorder: 'border-purple-400/60 group-hover:border-purple-400',
      playFill: 'fill-purple-400 text-purple-400',
      glow: 'shadow-[0_0_20px_rgba(192,132,252,0.15)]',
    },
    rose: {
      border: 'hover:border-rose-400/60',
      badge: 'bg-rose-950/70 border-rose-500/40 text-rose-300',
      aura: 'bg-rose-400/25',
      playBorder: 'border-rose-400/60 group-hover:border-rose-400',
      playFill: 'fill-rose-400 text-rose-400',
      glow: 'shadow-[0_0_20px_rgba(251,113,133,0.15)]',
    },
  }[accentColor];

  return (
    <div className="relative rounded-xl p-[1.5px] overflow-hidden group shadow-lg h-full">
      {/* Moving border light beam traveling continuously around the 4 sides of the box (Same as Contact Section) */}
      <div
        className="absolute inset-[-120%] pointer-events-none animate-rect-beam"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(212,175,55,0.25) 300deg, #d4af37 335deg, #ffffff 350deg, #d4af37 358deg, transparent 360deg)',
        }}
      />
      <div
        onClick={(e) => {
          if (isDeleteMode) {
            e.stopPropagation();
            onDelete ? onDelete(e) : onPlay();
          } else {
            onPlay();
          }
        }}
        className={`relative z-10 w-full h-full rounded-[calc(0.75rem-1.5px)] border overflow-hidden backdrop-blur-xl transition-all duration-300 flex flex-col justify-between select-none ${
          isDeleteMode
            ? 'cursor-pointer border-red-500/80 bg-[#1e1014]/95 shadow-[0_0_25px_rgba(239,68,68,0.3)] hover:border-red-400'
            : showReorder
            ? 'cursor-grab active:cursor-grabbing hover:border-gold ring-1 ring-gold/30 bg-[#12141d]/95'
            : `cursor-pointer ${accentStyles.border} ${accentStyles.glow} hover:-translate-y-1 bg-[#12141d]/95 border-white/10`
        }`}
      >
        {/* Customize / Owner Mode Grip Bar with Nudge Arrows */}
      {showReorder && (
        <div
          className="px-3 py-1.5 bg-gradient-to-r from-black/95 via-amber-500/20 to-black/95 border-b border-amber-400/40 flex items-center justify-between z-20 text-[10px] font-mono text-amber-300 shadow-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing hover:text-white" title={lang === 'EN' ? 'Click and drag anywhere to move' : 'মাউস দিয়ে চেপে টেনে যেকোনো স্থানে স্থানান্তর করুন'}>
            <GripVertical size={13} className="text-amber-400" />
            <span className="font-bold">#{index + 1} {lang === 'EN' ? 'Drag to move' : 'টেনে সরান'}</span>
          </div>

          <div className="flex items-center gap-1">
            {onMoveLeft && (
              <button
                type="button"
                disabled={index === 0}
                onClick={onMoveLeft}
                className="p-1 rounded hover:bg-gold hover:text-black disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                title={lang === 'EN' ? 'Move Left' : 'বামে সরান'}
              >
                <ArrowLeft size={11} />
              </button>
            )}
            {onMoveRight && (
              <button
                type="button"
                disabled={index >= totalInTray - 1}
                onClick={onMoveRight}
                className="p-1 rounded hover:bg-gold hover:text-black disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                title={lang === 'EN' ? 'Move Right' : 'ডানে সরান'}
              >
                <ArrowRight size={11} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(e);
                }}
                className="p-1 rounded text-red-400 hover:bg-red-600 hover:text-white transition-colors cursor-pointer ml-1"
                title={lang === 'EN' ? 'Delete video' : 'ভিডিও মুছে ফেলুন'}
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 16:9 Thumbnail Image */}
      <div className="relative w-full aspect-video overflow-hidden bg-black/90">
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          draggable={false}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
        />

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12141d] via-transparent to-black/25 opacity-70 group-hover:opacity-40 transition-opacity pointer-events-none" />

        {/* Delete Mode Active Indicator Badge */}
        {isDeleteMode && (
          <div className="absolute top-2 left-2 z-20 px-2 py-1 rounded-lg bg-red-600 text-white font-mono text-[10px] font-bold shadow-lg flex items-center gap-1 animate-pulse">
            <Trash2 size={11} />
            <span>{lang === 'EN' ? 'Click to Delete' : 'মুছতে ক্লিক করুন'}</span>
          </div>
        )}

        {/* Quick Delete Action Button on Card */}
        {onDelete && !isFeaturedMaster && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
            className={`absolute top-2 right-2 z-20 px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-500 text-white border border-red-400 shadow-md backdrop-blur-md transition-all duration-200 cursor-pointer flex items-center gap-1 font-mono text-[10px] font-bold ${
              isDeleteMode
                ? 'opacity-100 ring-2 ring-red-300 scale-105 animate-pulse'
                : 'opacity-80 sm:opacity-0 group-hover:opacity-100'
            }`}
            title={lang === 'EN' ? 'Delete this video' : 'ভিডিওটি মুছে ফেলুন'}
          >
            <Trash2 size={11} />
            <span>{lang === 'EN' ? 'Delete' : 'মুছুন'}</span>
          </button>
        )}

        {/* Quick Change Video Action Button on Card (Owner view) - ALWAYS VISIBLE TO OWNER */}
        {isOwner && onSettings && !isFeaturedMaster && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSettings();
            }}
            className="absolute top-2 left-2 z-20 px-2.5 py-1 rounded-lg bg-black/90 hover:bg-amber-400 text-amber-300 hover:text-black border border-amber-400/60 shadow-[0_2px_8px_rgba(251,191,36,0.3)] backdrop-blur-md opacity-100 transition-all duration-200 cursor-pointer flex items-center gap-1 font-mono text-[10px] font-bold"
            title={lang === 'EN' ? 'Change Video file or link' : 'ভিডিও বা থাম্বনেইল পরিবর্তন করুন'}
          >
            <Settings size={11} />
            <span>{lang === 'EN' ? 'Change Video' : 'ভিডিও পরিবর্তন'}</span>
          </button>
        )}

        {/* Bottom-Left Sleek Dark Corner Play Logo */}
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
          <StandardCornerPlayIcon size="sm" />
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 border border-white/15 text-[9px] font-mono text-zinc-300 font-bold backdrop-blur-md">
          {project.duration}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          HEADLINE BELOW VIDEO FRAME: Bottom-Left Aligned, Clean Minimalist
          (ভিডিওর নিচে বাম দিক থেকে শুরু হওয়া মার্জিত শর্টকাট শিরোনাম)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="px-3 py-2 text-left border-t border-white/5 bg-[#0d0f16]/90 flex items-center justify-between gap-2">
        <h4 className="font-sans text-[11px] sm:text-xs font-normal text-zinc-300 group-hover:text-white transition-colors line-clamp-1 tracking-normal text-left flex-1 min-w-0">
          {lang === 'BN' && project.titleBn ? project.titleBn : project.title}
        </h4>
        <div className="flex items-center gap-1.5 shrink-0">
          {isOwner && onSettings && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSettings();
              }}
              className="px-2 py-0.5 rounded bg-amber-500/25 hover:bg-amber-400 hover:text-black text-amber-300 border border-amber-500/50 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              title={lang === 'EN' ? 'Change Video or Thumbnail' : 'ভিডিও বা থাম্বনেইল পরিবর্তন করুন'}
            >
              <Settings size={10} />
              <span>{lang === 'EN' ? 'Change' : 'পরিবর্তন'}</span>
            </button>
          )}
          {isOwner && onEditTitle && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditTitle(project);
              }}
              className="p-1 rounded hover:bg-white/10 text-amber-300 hover:text-white transition-colors cursor-pointer opacity-100"
              title={lang === 'EN' ? 'Customize Title' : 'শিরোনাম পরিবর্তন করুন'}
            >
              <Edit3 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* In Owner or Reorder Mode: Move Video Action */}
      {showReorder && onMoveToTray && (
        <div
          className="p-1.5 bg-black/50 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-400"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[9px] text-zinc-500">#{project.tags[0] || 'video'}</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMoveMenuOpen(!isMoveMenuOpen)}
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-400 hover:text-black text-amber-300 border border-amber-400/40 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
            >
              <Move size={10} />
              <span>{lang === 'EN' ? 'Move / Position' : 'স্থানান্তর করুন'}</span>
            </button>

            {isMoveMenuOpen && (
              <div
                className="absolute right-0 bottom-full mb-1.5 z-40 p-1.5 rounded-xl bg-[#0f111a] border border-amber-400/40 shadow-[0_12px_35px_rgba(0,0,0,0.95),0_0_20px_rgba(251,191,36,0.25)] flex flex-col gap-1 min-w-[190px] backdrop-blur-2xl text-[10px] font-mono"
              >
                <div className="px-2 py-1 text-[8px] text-zinc-400 font-bold uppercase border-b border-white/10 flex items-center justify-between">
                  <span>{lang === 'EN' ? 'Move to Tray:' : 'স্থানান্তর করুন:'}</span>
                  <button onClick={() => setIsMoveMenuOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                    <X size={10} />
                  </button>
                </div>
                {/* 0. Promote to Top Single Featured Video */}
                <button
                  type="button"
                  disabled={isFeaturedMaster}
                  onClick={() => {
                    setIsMoveMenuOpen(false);
                    onMoveToTray('saas');
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-400 hover:text-black text-amber-300 font-bold disabled:opacity-30 disabled:pointer-events-none text-left cursor-pointer transition-colors"
                >
                  <Sparkles size={11} className="text-amber-400" />
                  <span>{lang === 'EN' ? '⭐ Make Top Featured' : '⭐ প্রথম সারির ফিচার্ড করুন'}</span>
                </button>
                <button
                  type="button"
                  disabled={currentTray === 'anim'}
                  onClick={() => {
                    setIsMoveMenuOpen(false);
                    onMoveToTray('anim');
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none text-left cursor-pointer transition-colors"
                >
                  <Sparkles size={11} className="text-amber-400" />
                  <span>{lang === 'EN' ? '1. Motion Videos' : '১. মোশন ডিজাইন'}</span>
                </button>
                <button
                  type="button"
                  disabled={currentTray === 'podcast'}
                  onClick={() => {
                    setIsMoveMenuOpen(false);
                    onMoveToTray('podcast');
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-300 disabled:opacity-30 disabled:pointer-events-none text-left cursor-pointer transition-colors"
                >
                  <Mic size={11} className="text-cyan-400" />
                  <span>{lang === 'EN' ? '2. Podcast Videos' : '২. পডকাস্ট ভিডিও'}</span>
                </button>
                <button
                  type="button"
                  disabled={currentTray === 'ai'}
                  onClick={() => {
                    setIsMoveMenuOpen(false);
                    onMoveToTray('ai');
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-purple-500/20 text-zinc-300 hover:text-purple-300 disabled:opacity-30 disabled:pointer-events-none text-left cursor-pointer transition-colors"
                >
                  <Cpu size={11} className="text-purple-400" />
                  <span>{lang === 'EN' ? '3. AI Videos' : '৩. এআই ভিডিও'}</span>
                </button>
                <button
                  type="button"
                  disabled={currentTray === 'reels'}
                  onClick={() => {
                    setIsMoveMenuOpen(false);
                    onMoveToTray('reels');
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-rose-500/20 text-zinc-300 hover:text-rose-300 disabled:opacity-30 disabled:pointer-events-none text-left cursor-pointer transition-colors"
                >
                  <Smartphone size={11} className="text-rose-400" />
                  <span>{lang === 'EN' ? '4. Reels (9:16)' : '৪. রিলস ভিডিও'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════
// 9:16 REEL CARD (৪টি এক শাড়িতে সবার শেষে, ড্র্যাগ অ্যান্ড ড্রপ ও স্থানান্তরসহ)
// ═════════════════════════════════════════════════════════════════════════
interface ReelStandardCardProps {
  project: Project;
  lang: 'EN' | 'BN';
  isReorderMode?: boolean;
  isDeleteMode?: boolean;
  index?: number;
  totalInTray?: number;
  currentTray?: 'anim' | 'podcast' | 'ai' | 'reels';
  onMoveLeft?: (e: React.MouseEvent) => void;
  onMoveRight?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onPlay: () => void;
  onMoveToTray?: (targetTray: 'anim' | 'podcast' | 'ai' | 'reels') => void;
}

const ReelStandardCard: React.FC<ReelStandardCardProps> = ({
  project,
  lang,
  isReorderMode,
  isDeleteMode,
  index = 0,
  totalInTray = 4,
  currentTray = 'reels',
  onMoveLeft,
  onMoveRight,
  onDelete,
  onPlay,
  onMoveToTray,
}) => {
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);

  return (
    <div className="relative rounded-xl p-[1.5px] overflow-hidden group shadow-lg h-full">
      {/* Moving border light beam traveling continuously around the 4 sides of the box (Same as Contact Section) */}
      <div
        className="absolute inset-[-120%] pointer-events-none animate-rect-beam"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(244,63,94,0.25) 300deg, #f43f5e 335deg, #ffffff 350deg, #f43f5e 358deg, transparent 360deg)',
        }}
      />
      <div
        onClick={(e) => {
          if (isDeleteMode) {
            e.stopPropagation();
            onDelete ? onDelete(e) : onPlay();
          } else {
            onPlay();
          }
        }}
        className={`relative z-10 w-full h-full rounded-[calc(0.75rem-1.5px)] border overflow-hidden backdrop-blur-xl transition-all duration-300 flex flex-col justify-between select-none ${
          isDeleteMode
            ? 'cursor-pointer border-red-500/80 bg-[#1e1014]/95 shadow-[0_0_25px_rgba(239,68,68,0.3)] hover:border-red-400'
            : isReorderMode
            ? 'cursor-grab active:cursor-grabbing hover:border-rose-400 ring-1 ring-rose-400/30 bg-[#12141d]/95'
            : 'cursor-pointer hover:border-rose-500/60 hover:shadow-[0_8px_25px_rgba(244,63,94,0.2)] hover:-translate-y-1 bg-[#12141d]/95 border-white/10'
        }`}
      >
        {/* Customize Mode Grip Bar with Nudge Arrows */}
      {isReorderMode && (
        <div
          className="px-2.5 py-1 bg-gradient-to-r from-black/90 via-rose-950/40 to-black/90 border-b border-rose-500/30 flex items-center justify-between z-20 text-[9px] font-mono text-rose-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            <GripVertical size={11} className="text-rose-400" />
            <span>#{index + 1} {lang === 'EN' ? 'Drag' : 'টানুন'}</span>
          </div>

          <div className="flex items-center gap-1">
            {onMoveLeft && (
              <button
                type="button"
                disabled={index === 0}
                onClick={onMoveLeft}
                className="p-0.5 rounded hover:bg-rose-500 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Move left"
              >
                <ArrowLeft size={10} />
              </button>
            )}
            {onMoveRight && (
              <button
                type="button"
                disabled={index >= totalInTray - 1}
                onClick={onMoveRight}
                className="p-0.5 rounded hover:bg-rose-500 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Move right"
              >
                <ArrowRight size={10} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(e);
                }}
                className="p-0.5 rounded text-red-400 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                title={lang === 'EN' ? 'Delete reel' : 'রিলস মুছে ফেলুন'}
              >
                <Trash2 size={10} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 9:15 Refined Vertical Aspect Ratio */}
      <div className="relative w-full aspect-[9/15] overflow-hidden bg-black/90">
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12141d] via-transparent to-black/25 opacity-75 group-hover:opacity-40 transition-opacity" />

        {/* Delete Mode Active Indicator Badge */}
        {isDeleteMode && (
          <div className="absolute top-2 left-2 z-20 px-1.5 py-0.5 rounded-md bg-red-600 text-white font-mono text-[9px] font-bold shadow-lg flex items-center gap-1 animate-pulse">
            <Trash2 size={10} />
            <span>{lang === 'EN' ? 'Delete' : 'মুছুন'}</span>
          </div>
        )}

        {/* Quick Delete Action Button on Reel Card */}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
            className={`absolute top-2 right-2 z-20 px-2 py-1 rounded-md bg-red-600/90 hover:bg-red-500 text-white border border-red-400 shadow-md backdrop-blur-md transition-all duration-200 cursor-pointer flex items-center gap-1 font-mono text-[9px] font-bold ${
              isDeleteMode
                ? 'opacity-100 ring-2 ring-red-300 scale-105 animate-pulse'
                : 'opacity-80 sm:opacity-0 group-hover:opacity-100'
            }`}
            title={lang === 'EN' ? 'Delete this reel' : 'রিলসটি মুছে ফেলুন'}
          >
            <Trash2 size={10} />
            <span>{lang === 'EN' ? 'Delete' : 'মুছুন'}</span>
          </button>
        )}

        {/* Bottom-Left Sleek Dark Corner Play Logo */}
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
          <StandardCornerPlayIcon size="sm" />
        </div>

        {/* 9:16 Format Tag */}
        <div className="absolute top-2 left-2">
          {!isDeleteMode && (
            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-rose-950/80 border border-rose-500/40 text-rose-300 backdrop-blur-md">
              9:16
            </span>
          )}
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 border border-white/15 text-[9px] font-mono text-rose-300 font-bold backdrop-blur-md">
          {project.duration}
        </div>

        {/* User uploaded badge */}
        {project.isUserUploaded && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-rose-500 text-white text-[8px] font-mono font-bold uppercase shadow">
            Uploaded
          </div>
        )}
      </div>

      {/* Meta Info */}
      <div className="px-2.5 py-2 flex flex-col justify-between flex-1 gap-1">
        <div>
          <h4 className="font-sans text-[11px] font-normal text-zinc-300 group-hover:text-rose-300 transition-colors line-clamp-1">
            {lang === 'BN' && project.titleBn ? project.titleBn : project.title}
          </h4>
          <p className="text-[9.5px] font-normal text-zinc-400 font-sans line-clamp-2 leading-tight mt-0.5">
            {lang === 'BN' && project.descriptionBn ? project.descriptionBn : project.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[9px] font-mono text-zinc-400">
          <div className="flex items-center gap-1">
            <span>#Reels</span>

            {/* Move to another tray setting */}
            {onMoveToTray && (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMoveMenuOpen(!isMoveMenuOpen);
                  }}
                  className="px-1 py-0.5 rounded bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-200 border border-white/10 text-[8px] font-mono flex items-center gap-0.5 transition-colors cursor-pointer"
                  title={lang === 'EN' ? 'Move reel to another tray' : 'রিলসটি অন্য ক্যাটাগরিতে স্থানান্তর করুন'}
                >
                  <Move size={8} />
                  <span>{lang === 'EN' ? 'Move' : 'সরান'}</span>
                </button>

                {isMoveMenuOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-0 bottom-full mb-1.5 z-40 p-1.5 rounded-xl bg-[#0f111a] border border-rose-500/40 shadow-[0_12px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(244,63,94,0.25)] flex flex-col gap-1 min-w-[160px] backdrop-blur-2xl text-[10px] font-mono"
                  >
                    <div className="px-2 py-1 text-[8px] text-zinc-400 font-bold uppercase border-b border-white/10 flex items-center justify-between">
                      <span>{lang === 'EN' ? 'Move to Tray:' : 'স্থানান্তর করুন:'}</span>
                      <button onClick={() => setIsMoveMenuOpen(false)} className="text-zinc-500 hover:text-white cursor-pointer">
                        <X size={10} />
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={currentTray === 'anim'}
                      onClick={() => {
                        setIsMoveMenuOpen(false);
                        onMoveToTray('anim');
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-amber-500/20 text-zinc-300 hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none text-left cursor-pointer transition-colors"
                    >
                      <Sparkles size={11} className="text-amber-400" />
                      <span>{lang === 'EN' ? '1. Motion Videos' : '১. মোশন ডিজাইন'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={currentTray === 'podcast'}
                      onClick={() => {
                        setIsMoveMenuOpen(false);
                        onMoveToTray('podcast');
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-300 disabled:opacity-30 disabled:pointer-events-none text-left cursor-pointer transition-colors"
                    >
                      <Mic size={11} className="text-cyan-400" />
                      <span>{lang === 'EN' ? '2. Podcast Videos' : '২. পডকাস্ট ভিডিও'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={currentTray === 'ai'}
                      onClick={() => {
                        setIsMoveMenuOpen(false);
                        onMoveToTray('ai');
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-purple-500/20 text-zinc-300 hover:text-purple-300 disabled:opacity-30 disabled:pointer-events-none text-left cursor-pointer transition-colors"
                    >
                      <Cpu size={11} className="text-purple-400" />
                      <span>{lang === 'EN' ? '3. AI Videos' : '৩. এআই ভিডিও'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {isDeleteMode ? (
            <span className="text-red-400 font-bold inline-flex items-center gap-0.5">
              <span>{lang === 'EN' ? 'Delete' : 'মুছুন'}</span>
              <Trash2 size={9} />
            </span>
          ) : (
            <span className="text-rose-300 group-hover:underline inline-flex items-center gap-0.5">
              <span>{isReorderMode ? (lang === 'EN' ? 'Drag' : 'টানুন') : (lang === 'EN' ? 'Watch' : 'দেখুন')}</span>
              {isReorderMode ? <GripVertical size={10} /> : <Play size={8} className="fill-current" />}
            </span>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

