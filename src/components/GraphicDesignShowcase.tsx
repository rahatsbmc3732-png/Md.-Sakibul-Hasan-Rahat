import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Maximize2,
  X,
  ExternalLink,
  Sparkles,
  Layers,
  Filter,
  CheckCircle2,
  GripVertical,
  Move,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Check,
  Settings,
  Edit3,
} from 'lucide-react';
import { getSiteContent, SiteContent } from '../utils/siteContent';
import {
  uploadMediaFileToServer,
  uploadBase64ImageToServer,
  saveSiteDataToServer,
  fetchSiteDataFromServer,
} from '../utils/apiSync';

export interface GraphicDesignItem {
  id: string;
  title: string;
  category: 'Thumbnails' | 'Social Posters' | 'Branding' | 'Visual Art';
  imageUrl: string;
  description: string;
  isUserUploaded?: boolean;
  date?: string;
  tags: string[];
}

const DEFAULT_DESIGNS: GraphicDesignItem[] = [
  {
    id: 'design-default-1',
    title: 'AI Revolution: বর্তমান ও ভবিষ্যৎ | হাই-ইমপ্যাক্ট থাম্বনেইল',
    category: 'Thumbnails',
    imageUrl: '/images/ai_future_thumbnail.jpg',
    description: 'Cinematic, high CTR YouTube master thumbnail designed with photorealistic typography and sci-fi neon depth.',
    tags: ['YouTube Thumbnail', 'High CTR', 'Photoshop'],
    date: '2026',
  },
  {
    id: 'design-default-2',
    title: 'Minimalist Obsidian Brand Identity & Typography System',
    category: 'Branding',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    description: 'Luxury obsidian visual branding guidelines, golden ratio geometry, and corporate typography system.',
    tags: ['Brand Identity', 'Logo Design', 'Luxury'],
    date: '2026',
  },
  {
    id: 'design-default-3',
    title: 'Cyberpunk Neon Social Media Event Poster',
    category: 'Social Posters',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    description: 'Dynamic event poster featuring layered typography, vibrant holographic gradients, and futuristic street aesthetics.',
    tags: ['Event Poster', 'Instagram', 'Graphic Art'],
    date: '2026',
  },
  {
    id: 'design-default-4',
    title: 'Vector Motion Poster & Abstract Visual Concept',
    category: 'Visual Art',
    imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
    description: 'Conceptual 3D and 2D vector composition designed for brand storytelling and digital campaigns.',
    tags: ['Vector Art', 'Concept Art', 'Illustrator'],
    date: '2026',
  },
];

const LOCAL_STORAGE_KEY = 'rahat_portfolio_graphic_designs_v2';

interface GraphicDesignShowcaseProps {
  lang: 'EN' | 'BN';
  isCustomizeMode?: boolean;
  setIsCustomizeMode?: (v: boolean) => void;
  activeChapter?: 'video' | 'design';
  setActiveChapter?: (ch: 'video' | 'design') => void;
  viewMode?: 'audience' | 'owner';
}

export const GraphicDesignShowcase: React.FC<GraphicDesignShowcaseProps> = ({
  lang,
  isCustomizeMode: propCustomizeMode,
  setIsCustomizeMode: propSetCustomizeMode,
  activeChapter = 'design',
  setActiveChapter,
  viewMode = 'audience',
}) => {
  const isOwner = viewMode === 'owner';
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

  const [internalCustomizeMode, setInternalCustomizeMode] = useState(false);
  const isCustomizeMode = isOwner ? (propCustomizeMode !== undefined ? propCustomizeMode : internalCustomizeMode) : false;
  const setIsCustomizeMode = propSetCustomizeMode || setInternalCustomizeMode;

  const [designs, setDesigns] = useState<GraphicDesignItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_DESIGNS;
  });

  const [activeFilter, setActiveFilter] = useState<'All' | 'Thumbnails' | 'Social Posters' | 'Branding' | 'Visual Art'>('All');
  const [lightboxItem, setLightboxItem] = useState<GraphicDesignItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Drag & Reorder State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [reorderNotification, setReorderNotification] = useState<string | null>(null);

  // In-App Delete State (avoids iframe confirm() blocks)
  const [designToDelete, setDesignToDelete] = useState<GraphicDesignItem | null>(null);
  const [lastDeletedDesign, setLastDeletedDesign] = useState<{ item: GraphicDesignItem; index: number } | null>(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'Thumbnails' | 'Social Posters' | 'Branding' | 'Visual Art'>('Thumbnails');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFileRef = useRef<File | null>(null);
  const editDesignFileRef = useRef<File | null>(null);
  const isHydratedRef = useRef<boolean>(false);

  // Initial Server Hydration & Sync Listener
  useEffect(() => {
    fetchSiteDataFromServer().then((data) => {
      if (data && data.graphicDesignProjects && Array.isArray(data.graphicDesignProjects) && data.graphicDesignProjects.length > 0) {
        setDesigns(data.graphicDesignProjects);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.graphicDesignProjects));
        } catch {}
      }
      isHydratedRef.current = true;
    });

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      if (customEvent.detail && customEvent.detail.graphicDesignProjects && Array.isArray(customEvent.detail.graphicDesignProjects)) {
        setDesigns(customEvent.detail.graphicDesignProjects);
      }
    };
    window.addEventListener('rahat:data-synced-from-server', handleSync);
    return () => window.removeEventListener('rahat:data-synced-from-server', handleSync);
  }, []);

  // Save to localStorage & server whenever designs change
  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(designs));
    } catch {
      // storage full or disabled
    }
    saveSiteDataToServer({ graphicDesignProjects: designs });
  }, [designs]);

  // Handle ESC key for modals
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxItem(null);
        setIsUploadModalOpen(false);
        setDesignToDelete(null);
        setEditingDesignItem(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Edit / Change Graphic Design State
  const [editingDesignItem, setEditingDesignItem] = useState<GraphicDesignItem | null>(null);
  const [editDesignTitle, setEditDesignTitle] = useState('');
  const [editDesignCategory, setEditDesignCategory] = useState<'Thumbnails' | 'Social Posters' | 'Branding' | 'Visual Art'>('Thumbnails');
  const [editDesignDesc, setEditDesignDesc] = useState('');
  const [editDesignTags, setEditDesignTags] = useState('');
  const [editDesignImage, setEditDesignImage] = useState<string | null>(null);
  const [editDesignSuccess, setEditDesignSuccess] = useState(false);
  const editDesignFileInputRef = useRef<HTMLInputElement>(null);

  // Listen for owner bar trigger
  useEffect(() => {
    const handleTrigger = () => {
      if (isOwner) {
        setIsUploadModalOpen(true);
      }
    };
    window.addEventListener('rahat:open-upload-graphic-modal', handleTrigger);
    return () => window.removeEventListener('rahat:open-upload-graphic-modal', handleTrigger);
  }, [isOwner]);

  const openEditDesignModal = (item: GraphicDesignItem) => {
    setEditingDesignItem(item);
    setEditDesignTitle(item.title);
    setEditDesignCategory(item.category);
    setEditDesignDesc(item.description);
    setEditDesignTags(item.tags.join(', '));
    setEditDesignImage(item.imageUrl);
    setEditDesignSuccess(false);
    editDesignFileRef.current = null;
  };

  const handleEditDesignFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(lang === 'EN' ? 'Please select an image file.' : 'দয়া করে একটি ইমেজ ফাইল নির্বাচন করুন।');
      return;
    }
    editDesignFileRef.current = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setEditDesignImage(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEditDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesignItem) return;

    let finalImageUrl = editDesignImage || editingDesignItem.imageUrl;
    if (editDesignFileRef.current) {
      try {
        const serverUrl = await uploadMediaFileToServer(editDesignFileRef.current, editDesignFileRef.current.name);
        if (serverUrl) finalImageUrl = serverUrl;
      } catch (err) {
        console.warn('Edit design server upload failed:', err);
      }
    } else if (editDesignImage && editDesignImage.startsWith('data:')) {
      try {
        const serverUrl = await uploadBase64ImageToServer(editDesignImage, 'graphic_design_edit');
        if (serverUrl) finalImageUrl = serverUrl;
      } catch {}
    }

    const updatedItem: GraphicDesignItem = {
      ...editingDesignItem,
      title: editDesignTitle.trim() || editingDesignItem.title,
      category: editDesignCategory,
      description: editDesignDesc.trim() || editingDesignItem.description,
      tags: editDesignTags
        ? editDesignTags.split(',').map((t) => t.trim()).filter(Boolean)
        : editingDesignItem.tags,
      imageUrl: finalImageUrl,
    };

    const nextDesigns = designs.map((d) => (d.id === editingDesignItem.id ? updatedItem : d));
    setDesigns(nextDesigns);
    if (lightboxItem && lightboxItem.id === editingDesignItem.id) {
      setLightboxItem(updatedItem);
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextDesigns));
    } catch {}

    await saveSiteDataToServer({
      graphicDesignProjects: nextDesigns,
    });

    setEditDesignSuccess(true);
    setTimeout(() => {
      setEditDesignSuccess(false);
      setEditingDesignItem(null);
      editDesignFileRef.current = null;
    }, 700);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(lang === 'EN' ? 'Please select an image file.' : 'দয়া করে একটি ইমেজ ফাইল নির্বাচন করুন।');
      return;
    }
    uploadFileRef.current = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewImage(e.target.result as string);
        if (!uploadTitle) {
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
          setUploadTitle(nameWithoutExt);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDropUpload = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewImage && !uploadFileRef.current) {
      alert(lang === 'EN' ? 'Please select or drop an image.' : 'দয়া করে ছবি নির্বাচন করুন বা ড্রপ করুন।');
      return;
    }

    let finalImageUrl = previewImage || '';
    if (uploadFileRef.current) {
      try {
        const serverUrl = await uploadMediaFileToServer(uploadFileRef.current, uploadFileRef.current.name);
        if (serverUrl) finalImageUrl = serverUrl;
      } catch (err) {
        console.warn('Graphic design server upload failed:', err);
      }
    } else if (previewImage && previewImage.startsWith('data:')) {
      try {
        const serverUrl = await uploadBase64ImageToServer(previewImage, 'graphic_design');
        if (serverUrl) finalImageUrl = serverUrl;
      } catch {}
    }

    const newItem: GraphicDesignItem = {
      id: `design-${Date.now()}`,
      title: uploadTitle.trim() || (lang === 'EN' ? 'Untitled Graphic Design' : 'গ্রাফিক্স ডিজাইন প্রজেক্ট'),
      category: uploadCategory,
      imageUrl: finalImageUrl,
      description: uploadDesc.trim() || (lang === 'EN' ? 'Custom graphic design project by MD Sakibul Hasan Rahat.' : 'এমডি সাকিবুল হাসান রাহাতের তৈরি কাস্টম গ্রাফিক্স ডিজাইন।'),
      tags: uploadTags
        ? uploadTags.split(',').map((t) => t.trim()).filter(Boolean)
        : [uploadCategory, 'Design'],
      isUserUploaded: true,
      date: new Date().getFullYear().toString(),
    };

    const nextDesigns = [newItem, ...designs];
    setDesigns(nextDesigns);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextDesigns));
    } catch {}

    await saveSiteDataToServer({
      graphicDesignProjects: nextDesigns,
    });

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setIsUploadModalOpen(false);
      uploadFileRef.current = null;
      // Reset form
      setPreviewImage(null);
      setUploadTitle('');
      setUploadDesc('');
      setUploadTags('');
    }, 1000);
  };

  const handleDeleteItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const item = designs.find((d) => d.id === id);
    if (item) {
      setDesignToDelete(item);
    }
  };

  const confirmExecuteDeleteDesign = () => {
    if (!designToDelete) return;
    const index = designs.findIndex((d) => d.id === designToDelete.id);
    setLastDeletedDesign({ item: designToDelete, index: index >= 0 ? index : 0 });
    setDesigns((prev) => prev.filter((d) => d.id !== designToDelete.id));
    if (lightboxItem?.id === designToDelete.id) {
      setLightboxItem(null);
    }
    setDesignToDelete(null);
    setReorderNotification(
      lang === 'EN'
        ? `"${designToDelete.title}" deleted!`
        : `"${designToDelete.title}" ডিজাইনটি মুছে ফেলা হয়েছে!`
    );
  };

  const handleUndoDeleteDesign = () => {
    if (!lastDeletedDesign) return;
    const { item, index } = lastDeletedDesign;
    setDesigns((prev) => {
      const next = [...prev];
      next.splice(index, 0, item);
      return next;
    });
    setLastDeletedDesign(null);
    setReorderNotification(
      lang === 'EN' ? 'Design restored successfully!' : 'ডিজাইনটি ফিরিয়ে আনা হয়েছে!'
    );
    setTimeout(() => setReorderNotification(null), 3000);
  };

  // Reordering handlers for Drag and Drop
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = [...designs];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setDesigns(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setReorderNotification(
      lang === 'EN'
        ? 'Graphic design position updated! Saved.'
        : 'গ্রাফিক্স কার্ড সফলভাবে সরানো ও সেভ হয়েছে।'
    );
    setTimeout(() => setReorderNotification(null), 3000);
  };

  const handleMove = (index: number, direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= designs.length) return;

    const updated = [...designs];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setDesigns(updated);
    setReorderNotification(
      lang === 'EN' ? 'Graphic repositioned!' : 'গ্রাফিক্স কার্ডের অবস্থান পরিবর্তন হয়েছে!'
    );
    setTimeout(() => setReorderNotification(null), 2500);
  };

  const handleResetOrder = () => {
    setDesigns(DEFAULT_DESIGNS);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setReorderNotification(
      lang === 'EN' ? 'Default graphic designs restored!' : 'গ্রাফিক্সের মূল সিরিয়াল রিস্টোর হয়েছে!'
    );
    setTimeout(() => setReorderNotification(null), 3000);
  };

  const filteredDesigns = activeFilter === 'All'
    ? designs
    : designs.filter((d) => d.category === activeFilter);

  return (
    <section
      id="graphic-design"
      className="py-14 sm:py-20 bg-gradient-to-b from-[#0a0b10] via-[#0d0f17] to-[#090a0e] relative w-full overflow-hidden select-none border-b border-white/[0.06]"
    >
      {/* Background ambient accents */}
      <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-gold/[0.03] blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-24 w-96 h-96 rounded-full bg-amber-600/[0.02] blur-[130px] pointer-events-none" />

      {/* Floating Notification */}
      {reorderNotification && (
        <div className="fixed bottom-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-amber-400 text-black font-mono text-xs font-bold shadow-[0_4px_25px_rgba(251,191,36,0.6)] flex items-center gap-2 animate-bounce">
          <Check size={16} />
          <span>{reorderNotification}</span>
          {lastDeletedDesign && (
            <button
              onClick={handleUndoDeleteDesign}
              className="ml-2 px-2.5 py-0.5 rounded-lg bg-black text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all hover:bg-neutral-900 click-bounce"
            >
              <RotateCcw size={11} />
              <span>{lang === 'EN' ? 'Undo' : 'পূর্বাবস্থায় আনুন'}</span>
            </button>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 relative z-10">
        {/* ═════════════════════════════════════════════════════════════════════════
            CLEAN TWO-CHAPTER NAVIGATION: [ ভিডিও ]  |  [ গ্রাফিক্স ডিজাইন ]
            ═════════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center justify-center mb-8 pt-2">
          <div className="inline-flex p-1 rounded-full bg-[#11131b]/95 border border-white/10 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.65)]">
            <button
              type="button"
              onClick={() => {
                if (setActiveChapter) setActiveChapter('video');
                const el = document.getElementById('projects');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-7 sm:px-10 py-2 sm:py-2.5 rounded-full font-serif text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
            >
              <span>{lang === 'EN' ? 'Videos' : 'ভিডিও'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (setActiveChapter) setActiveChapter('design');
              }}
              className="px-7 sm:px-10 py-2 sm:py-2.5 rounded-full font-serif text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 cursor-pointer bg-gradient-to-r from-amber-500/25 via-gold/20 to-amber-600/25 text-amber-200 border border-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.35)]"
            >
              <span>{lang === 'EN' ? 'Graphic Design' : 'গ্রাফিক্স ডিজাইন'}</span>
            </button>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 mb-2.5">
              <Palette size={13} className="text-gold" />
              <span className="text-[10px] font-mono tracking-widest text-gold uppercase font-bold">
                {lang === 'EN' ? 'GRAPHIC SUITE & BRAND VISUALS' : 'গ্রাফিক্স ডিজাইন ও ভিজ্যুয়াল আর্ট'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
              {siteData.headlineGraphic || (lang === 'EN' ? 'Graphic Design Portfolio' : 'গ্রাফিক্স ডিজাইন পোর্টফোলিও')}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-1 max-w-xl">
              {lang === 'EN'
                ? (siteData.graphicSubEn || 'High-conversion thumbnails, promotional posters, and branding. Drag to rearrange cards or upload your own.')
                : (siteData.graphicSubBn || 'হাই-কনভার্টিং থাম্বনেইল, সোশ্যাল পোস্টার ও ব্র্যান্ডিং। মাউস দিয়ে টেনে কার্ডগুলো যেকোনো দিকে সাজিয়ে নিন বা নতুন ডিজাইন আপলোড করুন।')}
            </p>
          </div>

          {/* Action & Customize Controls (Only in Owner View) */}
          {isOwner && (
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              {/* Drag to Reorder Toggle */}
              <button
                onClick={() => setIsCustomizeMode(!isCustomizeMode)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all duration-200 cursor-pointer click-bounce ${
                  isCustomizeMode
                    ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.5)]'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/15'
                }`}
              >
                <Move size={14} className={isCustomizeMode ? 'animate-spin' : ''} />
                <span>
                  {isCustomizeMode
                    ? (lang === 'EN' ? 'Drag Mode: ON' : 'টেনে সাজানো সচল')
                    : (lang === 'EN' ? 'Drag & Reorder' : 'টেনে সাজান')}
                </span>
              </button>

              {/* Reset Order Button */}
              <button
                onClick={handleResetOrder}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/15 text-xs font-mono font-medium transition-colors cursor-pointer"
                title={lang === 'EN' ? 'Restore original designs & order' : 'ডিফল্ট ডিজাইন ও মূল ক্রম ফিরিয়ে আনুন'}
              >
                <RotateCcw size={13} />
                <span>{lang === 'EN' ? 'Reset' : 'রিসেট'}</span>
              </button>

              {/* Upload Button */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold hover:bg-amber-400 text-black font-mono text-xs font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-200 cursor-pointer click-bounce"
              >
                <Upload size={14} />
                <span>{lang === 'EN' ? 'Upload Design' : 'নতুন ডিজাইন আপলোড করুন'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-1.5 bg-[#141620]/90 rounded-xl border border-white/10 p-1 backdrop-blur-md">
            {(['All', 'Thumbnails', 'Social Posters', 'Branding', 'Visual Art'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all duration-200 cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-gold text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat === 'All'
                  ? (lang === 'EN' ? `All Designs (${designs.length})` : `সব ডিজাইন (${designs.length})`)
                  : cat === 'Thumbnails'
                  ? (lang === 'EN' ? 'Thumbnails' : 'থাম্বনেইল')
                  : cat === 'Social Posters'
                  ? (lang === 'EN' ? 'Social Posters' : 'সোশ্যাল পোস্টার')
                  : cat === 'Branding'
                  ? (lang === 'EN' ? 'Branding' : 'ব্র্যান্ডিং')
                  : (lang === 'EN' ? 'Visual Art' : 'ভিজ্যুয়াল আর্ট')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isCustomizeMode && (
              <span className="text-xs font-mono text-amber-300 font-semibold flex items-center gap-1">
                <GripVertical size={13} />
                <span>{lang === 'EN' ? 'Hold & Drag cards to swap' : 'মাউস দিয়ে কার্ড টেনে সাজান'}</span>
              </span>
            )}
            <span className="text-xs font-mono text-zinc-500">
              {filteredDesigns.length} {lang === 'EN' ? 'Items displayed' : 'টি আইটেম প্রদর্শিত'}
            </span>
          </div>
        </div>

        {/* ═══ GRAPHIC DESIGN GRID (3 CARDS PER ROW STANDARDIZED) ═══ */}
        {filteredDesigns.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02]">
            <ImageIcon size={36} className="text-zinc-500 mx-auto mb-2" />
            <p className="text-sm font-sans text-zinc-400">
              {lang === 'EN' ? 'No designs found in this category.' : 'এই ক্যাটাগরিতে কোনো ডিজাইন পাওয়া যায়নি।'}
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 text-xs font-mono font-semibold"
            >
              <Plus size={13} />
              <span>{lang === 'EN' ? 'Upload One Now' : 'এখনই একটি আপলোড করুন'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDesigns.map((item, index) => {
              const isDraggingThis = draggedIndex === index;
              const isOverThis = dragOverIndex === index;

              return (
                <div key={item.id} className="relative rounded-xl p-[1.5px] overflow-hidden group shadow-lg h-full">
                  {/* Moving border light beam traveling continuously around the 4 sides of the box (Same as Contact Section) */}
                  <div
                    className="absolute inset-[-120%] pointer-events-none animate-rect-beam"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(212,175,55,0.25) 300deg, #d4af37 335deg, #ffffff 350deg, #d4af37 358deg, transparent 360deg)',
                    }}
                  />

                  <div
                    draggable={isCustomizeMode}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    onClick={() => setLightboxItem(item)}
                    className={`relative z-10 w-full h-full rounded-[calc(0.75rem-1.5px)] border bg-[#12141c]/95 overflow-hidden backdrop-blur-xl transition-all duration-300 flex flex-col justify-between ${
                      isCustomizeMode ? 'cursor-grab active:cursor-grabbing ring-1 ring-amber-400/30' : 'cursor-pointer'
                    } ${
                      isDraggingThis
                        ? 'opacity-40 scale-95 border-dashed border-amber-400'
                        : isOverThis
                        ? 'border-amber-400 scale-[1.02] shadow-[0_0_25px_rgba(251,191,36,0.35)]'
                        : 'border-white/10 hover:border-gold/50 hover:shadow-[0_10px_30px_rgba(212,175,55,0.15)] hover:-translate-y-1'
                    }`}
                  >
                    {/* Reorder Grip Handle Banner in Customize Mode */}
                  {isCustomizeMode && (
                    <div
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500/20 via-black/80 to-amber-500/20 border-b border-amber-500/30 flex items-center justify-between z-20 text-[10px] font-mono text-amber-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1">
                        <GripVertical size={14} className="text-amber-400" />
                        <span>#{index + 1} {lang === 'EN' ? 'Drag to move' : 'টেনে পরিবর্তন করুন'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={(e) => handleMove(index, 'left', e)}
                          className="p-1 rounded hover:bg-amber-400 hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Move left / আগে নিন"
                        >
                          <ArrowLeft size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={index === designs.length - 1}
                          onClick={(e) => handleMove(index, 'right', e)}
                          className="p-1 rounded hover:bg-amber-400 hover:text-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Move right / পরে নিন"
                        >
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Image Container with Consistent Aspect Ratio */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-black/90">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12141d] via-transparent to-black/20 opacity-70 group-hover:opacity-30 transition-opacity" />

                    {/* Category Pill */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-black/80 border border-gold/40 text-gold backdrop-blur-md">
                        {item.category}
                      </span>
                    </div>

                    {/* Action Buttons: ALWAYS VISIBLE TO OWNER */}
                    <div className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20 transition-opacity ${
                      isOwner ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {isOwner && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDesignModal(item);
                            }}
                            className="px-2 py-1 rounded-lg bg-black/90 hover:bg-amber-400 text-amber-300 hover:text-black border border-amber-400/60 backdrop-blur-md transition-colors cursor-pointer shadow-md font-mono text-[10px] font-bold flex items-center gap-1"
                            title={lang === 'EN' ? 'Change Image & Details' : 'ডিজাইন বা ছবি পরিবর্তন করুন'}
                          >
                            <Settings size={12} />
                            <span>{lang === 'EN' ? 'Edit' : 'পরিবর্তন'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white backdrop-blur-md transition-colors cursor-pointer shadow-md"
                            title={lang === 'EN' ? 'Delete Design' : 'ডিজাইন মুছুন'}
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                      <div className="p-1.5 rounded-lg bg-black/80 border border-white/20 text-white backdrop-blur-md">
                        <Maximize2 size={13} />
                      </div>
                    </div>

                    {/* Year Tag */}
                    {item.date && (
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 border border-white/10 text-[9px] font-mono text-zinc-400">
                        {item.date}
                      </div>
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="p-3.5 flex flex-col justify-between flex-1 gap-1.5">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-white group-hover:text-gold transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-sans line-clamp-2 leading-relaxed mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-zinc-400">
                      <div className="flex items-center gap-1 overflow-hidden">
                        {item.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="truncate">#{tag}</span>
                        ))}
                      </div>
                      <span className="text-gold font-semibold group-hover:underline inline-flex items-center gap-1 flex-shrink-0">
                        <span>{lang === 'EN' ? 'View Full' : 'বড় দেখুন'}</span>
                        <Maximize2 size={10} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* ═══ FULLSCREEN LIGHTBOX MODAL ═══ */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/92 backdrop-blur-xl animate-fade-in"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[92vh] bg-[#12141c] border border-gold/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(212,175,55,0.2)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between bg-black/60">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-gold/15 border border-gold/40 text-gold uppercase">
                  {lightboxItem.category}
                </span>
                <h3 className="font-serif text-sm sm:text-base font-bold text-white truncate max-w-md">
                  {lightboxItem.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {isOwner && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDesignModal(lightboxItem);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 transition-colors cursor-pointer text-xs font-mono font-medium"
                    title={lang === 'EN' ? 'Change Design' : 'ডিজাইন পরিবর্তন করুন'}
                  >
                    <Settings size={14} />
                    <span>{lang === 'EN' ? 'Change' : 'পরিবর্তন'}</span>
                  </button>
                )}
                <button
                  onClick={(e) => handleDeleteItem(lightboxItem.id, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 transition-colors cursor-pointer text-xs font-mono font-medium"
                  title={lang === 'EN' ? 'Delete Design' : 'ডিজাইন মুছুন'}
                >
                  <Trash2 size={14} />
                  <span>{lang === 'EN' ? 'Delete' : 'মুছে ফেলুন'}</span>
                </button>
                <button
                  onClick={() => setLightboxItem(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-red-600 text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Image Display */}
            <div className="flex-1 overflow-auto bg-black/95 flex items-center justify-center p-2 sm:p-4">
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.title}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#141622] border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-zinc-300 font-sans max-w-2xl leading-relaxed">
                  {lightboxItem.description}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {lightboxItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                <a
                  href={lightboxItem.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={lightboxItem.title}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/15 hover:bg-gold text-gold hover:text-black border border-gold/30 font-mono text-xs font-semibold transition-all"
                >
                  <ExternalLink size={13} />
                  <span>{lang === 'EN' ? 'Open High-Res' : 'মূল ছবি খুলুন'}</span>
                </a>
                <button
                  onClick={() => setLightboxItem(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors"
                >
                  {lang === 'EN' ? 'Close' : 'বন্ধ করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ UPLOAD DESIGN MODAL ═══ */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-[#13151f] border border-gold/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.2)] overflow-hidden flex flex-col p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                  <Upload size={16} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white leading-tight">
                    {lang === 'EN' ? 'Upload Graphic Design' : 'নতুন গ্রাফিক্স ডিজাইন আপলোড'}
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {lang === 'EN' ? 'Add thumbnail, poster, or brand visuals' : 'থাম্বনেইল, সোশ্যাল পোস্টার বা ব্র্যান্ডিং যুক্ত করুন'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropUpload}
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-full h-44 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                  previewImage
                    ? 'border-gold bg-black/60'
                    : 'border-white/20 hover:border-gold/60 bg-white/[0.02] hover:bg-gold/[0.03]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />

                {previewImage ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-mono">
                      {lang === 'EN' ? 'Click to change image' : 'ছবি পরিবর্তন করতে ক্লিক করুন'}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center p-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center text-gold">
                      <ImageIcon size={22} />
                    </div>
                    <p className="text-xs font-serif font-bold text-white">
                      {lang === 'EN' ? 'Click to select or Drag & Drop image here' : 'ছবি নির্বাচন করতে ক্লিক করুন বা ড্র্যাগ করে ছাড়ুন'}
                    </p>
                    <span className="text-[10px] font-mono text-zinc-500">
                      PNG, JPG, WEBP, SVG
                    </span>
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-[11px] font-mono text-gold uppercase tracking-wider mb-1">
                  {lang === 'EN' ? 'Design Title' : 'ডিজাইনের নাম / টাইটেল'} *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder={lang === 'EN' ? 'e.g. YouTube Podcast Master Thumbnail' : 'যেমন: ইউটিউব পডকাস্ট থাম্বনেইল'}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-gold text-white text-xs font-sans outline-none transition-colors"
                />
              </div>

              {/* Category Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-gold uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Category' : 'ক্যাটাগরি'}
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-gold text-white text-xs font-sans outline-none transition-colors"
                  >
                    <option value="Thumbnails">Thumbnails</option>
                    <option value="Social Posters">Social Posters</option>
                    <option value="Branding">Branding</option>
                    <option value="Visual Art">Visual Art</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-gold uppercase tracking-wider mb-1">
                    {lang === 'EN' ? 'Tags (comma separated)' : 'ট্যাগস (কমা দিয়ে লিখুন)'}
                  </label>
                  <input
                    type="text"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="CTR, Poster, Modern"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-gold text-white text-xs font-sans outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-mono text-gold uppercase tracking-wider mb-1">
                  {lang === 'EN' ? 'Short Description' : 'সংক্ষিপ্ত বিবরণ'}
                </label>
                <textarea
                  rows={2}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder={lang === 'EN' ? 'Describe the concept, tools used, or client brief...' : 'ডিজাইনের কনসেপ্ট বা ব্যবহৃত সফটওয়্যার...'}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-gold text-white text-xs font-sans outline-none transition-colors resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-mono text-xs transition-colors cursor-pointer"
                >
                  {lang === 'EN' ? 'Cancel' : 'বাতিল'}
                </button>

                <button
                  type="submit"
                  disabled={uploadSuccess}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gold hover:bg-amber-400 text-black font-mono text-xs font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all cursor-pointer"
                >
                  {uploadSuccess ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>{lang === 'EN' ? 'Uploaded!' : 'আপলোড সম্পন্ন!'}</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>{lang === 'EN' ? 'Publish to Portfolio' : 'পোর্টফোলিওতে যুক্ত করুন'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Graphic Design */}
      {designToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setDesignToDelete(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#14151e] border-2 border-red-500/50 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(239,68,68,0.25)] p-5 overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <Trash2 size={20} className="animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-white">
                  {lang === 'EN' ? 'Confirm Design Deletion' : 'ডিজাইন মুছে ফেলার নিশ্চিতকরণ'}
                </h3>
                <p className="text-[11px] font-mono text-red-400">
                  {lang === 'EN' ? 'You can undo this deletion anytime' : 'প্রয়োজনে আনডু করে ফিরিয়ে আনতে পারবেন'}
                </p>
              </div>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-black/60 border border-white/10 flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10">
                <img
                  src={designToDelete.imageUrl}
                  alt={designToDelete.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-gold uppercase font-bold">
                  {designToDelete.category}
                </span>
                <h4 className="text-xs sm:text-sm font-serif font-bold text-white truncate mt-1">
                  {designToDelete.title}
                </h4>
              </div>
            </div>

            <p className="text-xs text-zinc-300 font-sans mb-5 leading-relaxed">
              {lang === 'EN'
                ? `Are you sure you want to delete "${designToDelete.title}"? It will be removed immediately from your showcase.`
                : `আপনি কি নিশ্চিত যে "${designToDelete.title}" ডিজাইনটি মুছে ফেলতে চান? এটি তৎক্ষণাৎ পোর্টফোলিও থেকে সরানো হবে।`}
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={confirmExecuteDeleteDesign}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all cursor-pointer click-bounce"
              >
                <Trash2 size={14} />
                <span>{lang === 'EN' ? 'Yes, Delete' : 'হ্যাঁ, ডিলিট করুন'}</span>
              </button>
              <button
                type="button"
                onClick={() => setDesignToDelete(null)}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 font-mono text-xs font-semibold transition-all cursor-pointer"
              >
                <span>{lang === 'EN' ? 'Cancel' : 'বাতিল'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT / CHANGE GRAPHIC DESIGN MODAL ═══ */}
      {editingDesignItem && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setEditingDesignItem(null)}
        >
          <div
            className="relative max-w-xl w-full max-h-[90vh] bg-[#12141c] border border-amber-400/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.2)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Settings size={16} />
                </div>
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-bold text-white">
                    {lang === 'EN' ? 'Change Graphic Design & Image' : 'গ্রাফিক্স ডিজাইন ও ছবি পরিবর্তন'}
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-400">
                    {lang === 'EN' ? 'Replace image file or edit design details' : 'কম্পিউটার/ফোন থেকে ছবি বদলান বা বিবরণ এডিট করুন'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingDesignItem(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditDesign} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Image Picker */}
              <div>
                <label className="block text-[11px] font-mono text-amber-300 uppercase tracking-wider mb-1.5">
                  {lang === 'EN' ? 'Design Image' : 'গ্রাফিক্স ছবি পরিবর্তন'}
                </label>
                <input
                  ref={editDesignFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleEditDesignFileSelect(e.target.files[0])}
                  className="hidden"
                />

                <div
                  onClick={() => editDesignFileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-400/40 hover:border-amber-400 rounded-xl p-4 bg-amber-950/15 hover:bg-amber-950/25 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center"
                >
                  {editDesignImage ? (
                    <div className="w-full flex flex-col items-center gap-2">
                      <div className="max-h-44 w-full rounded-lg overflow-hidden border border-white/20 bg-black">
                        <img
                          src={editDesignImage}
                          alt="Design preview"
                          className="w-full h-44 object-contain"
                        />
                      </div>
                      <span className="text-[11px] font-mono text-amber-300 hover:underline">
                        {lang === 'EN' ? 'Click to choose different image file' : 'অন্য ছবি বেছে নিতে এখানে ক্লিক করুন'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={24} className="text-amber-400" />
                      <span className="text-xs font-serif font-bold text-white">
                        {lang === 'EN' ? 'Click to upload image' : 'ছবি নির্বাচন করতে ক্লিক করুন'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-300 mb-1">
                  {lang === 'EN' ? 'Title / Headline' : 'শিরোনাম / নাম'} *
                </label>
                <input
                  type="text"
                  required
                  value={editDesignTitle}
                  onChange={(e) => setEditDesignTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 text-white text-xs font-sans outline-none transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-300 mb-1">
                  {lang === 'EN' ? 'Category' : 'ক্যাটাগরি'}
                </label>
                <select
                  value={editDesignCategory}
                  onChange={(e) => setEditDesignCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/15 focus:border-amber-400 text-white text-xs font-sans outline-none transition-colors"
                >
                  <option value="Thumbnails">Thumbnails (YouTube / Social)</option>
                  <option value="Social Posters">Social Posters & Ads</option>
                  <option value="Branding">Branding & Identity</option>
                  <option value="Visual Art">Visual Art & Covers</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-300 mb-1">
                  {lang === 'EN' ? 'Tags (comma separated)' : 'ট্যাগস (কমা দিয়ে লিখুন)'}
                </label>
                <input
                  type="text"
                  value={editDesignTags}
                  onChange={(e) => setEditDesignTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 text-white text-xs font-sans outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-mono text-zinc-300 mb-1">
                  {lang === 'EN' ? 'Description' : 'বিবরণ'}
                </label>
                <textarea
                  rows={2}
                  value={editDesignDesc}
                  onChange={(e) => setEditDesignDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 text-white text-xs font-sans outline-none transition-colors resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setEditingDesignItem(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono transition-colors cursor-pointer"
                >
                  {lang === 'EN' ? 'Cancel' : 'বাতিল'}
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all cursor-pointer click-bounce"
                >
                  {editDesignSuccess ? (
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
