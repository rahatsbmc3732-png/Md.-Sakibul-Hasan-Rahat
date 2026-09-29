// Server Sync & Upload Service for MD Sakibul Hasan Rahat's Portfolio

export interface ServerSiteData {
  siteContent?: any;
  saasProject?: any;
  animProjects?: any[];
  podcastProjects?: any[];
  aiProjects?: any[];
  reelsProjects?: any[];
  graphicDesignProjects?: any[];
  profileImage?: string;
  customHeadlines?: Record<string, string>;
  customSubtitle?: string;
  trashItems?: any[];
  permanentlyDeletedIds?: string[];
  updatedAt?: number;
}

const STORAGE_KEY_SAAS = 'rahat_video_saas_anim_v5';
const STORAGE_KEY_ANIM = 'rahat_video_order_anim_v5';
const STORAGE_KEY_POD = 'rahat_video_order_pod_v5';
const STORAGE_KEY_AI = 'rahat_video_order_ai_v5';
const STORAGE_KEY_REELS = 'rahat_video_order_reels_v5';
const STORAGE_KEY_HEADLINES = 'rahat_custom_tray_headlines_v5';
const STORAGE_KEY_TRASH = 'rahat_video_recycle_bin_v5';
const STORAGE_KEY_PERMANENTLY_DELETED = 'rahat_video_permanently_deleted_v5';
const STORAGE_KEY_PHOTO = 'rahat_custom_profile_image';
const STORAGE_KEY_DESIGN = 'rahat_graphic_design_projects_v2';
const STORAGE_KEY_CONTENT = 'rahat_master_site_content_v1';
const STORAGE_KEY_SUBTITLE = 'rahat_custom_subtitle';

function getLocalJson(keys: string[], defaultVal: any = null) {
  if (typeof window === 'undefined') return defaultVal;
  for (const k of keys) {
    try {
      const val = localStorage.getItem(k);
      if (val && val !== 'null' && val !== 'undefined') {
        return JSON.parse(val);
      }
    } catch {}
  }
  return defaultVal;
}

function getLocalString(keys: string[], defaultVal: string = '') {
  if (typeof window === 'undefined') return defaultVal;
  for (const k of keys) {
    try {
      const val = localStorage.getItem(k);
      if (val && val !== 'null' && val !== 'undefined') {
        return val;
      }
    } catch {}
  }
  return defaultVal;
}

/**
 * Fetch full site data from server.
 * Both audiences/visitors and the owner get their data from here.
 */
export async function fetchSiteDataFromServer(): Promise<ServerSiteData | null> {
  try {
    const res = await fetch('/api/site-data', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.warn('Failed to fetch site data from server:', err);
  }
  return null;
}

let saveDebounceTimer: any = null;
/**
 * Persist site data directly to server backend.
 * Merges with localStorage so nothing is dropped.
 */
export async function saveSiteDataToServer(data: Partial<ServerSiteData>): Promise<boolean> {
  try {
    const payload: ServerSiteData = {
      siteContent: data.siteContent !== undefined ? data.siteContent : getLocalJson([STORAGE_KEY_CONTENT], {}),
      saasProject: data.saasProject !== undefined ? data.saasProject : getLocalJson([STORAGE_KEY_SAAS, 'rahat_video_saas_anim_v3', 'rahat_video_saas_anim_v2']),
      animProjects: data.animProjects !== undefined ? data.animProjects : getLocalJson([STORAGE_KEY_ANIM, 'rahat_video_order_anim_v4'], []),
      podcastProjects: data.podcastProjects !== undefined ? data.podcastProjects : getLocalJson([STORAGE_KEY_POD, 'rahat_video_order_pod_v4'], []),
      aiProjects: data.aiProjects !== undefined ? data.aiProjects : getLocalJson([STORAGE_KEY_AI, 'rahat_video_order_ai_v4'], []),
      reelsProjects: data.reelsProjects !== undefined ? data.reelsProjects : getLocalJson([STORAGE_KEY_REELS, 'rahat_video_order_reels_v4'], []),
      graphicDesignProjects: data.graphicDesignProjects !== undefined ? data.graphicDesignProjects : getLocalJson([STORAGE_KEY_DESIGN], []),
      profileImage: data.profileImage !== undefined ? data.profileImage : getLocalString([STORAGE_KEY_PHOTO]),
      customHeadlines: data.customHeadlines !== undefined ? data.customHeadlines : getLocalJson([STORAGE_KEY_HEADLINES, 'rahat_custom_tray_headlines_v3'], {}),
      customSubtitle: data.customSubtitle !== undefined ? data.customSubtitle : getLocalString([STORAGE_KEY_SUBTITLE]),
      trashItems: data.trashItems !== undefined ? data.trashItems : getLocalJson([STORAGE_KEY_TRASH, 'rahat_video_trash_history_v2'], []),
      permanentlyDeletedIds: data.permanentlyDeletedIds !== undefined ? data.permanentlyDeletedIds : getLocalJson([STORAGE_KEY_PERMANENTLY_DELETED], []),
      updatedAt: Date.now(),
    };

    const res = await fetch('/api/site-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('rahat:data-synced-from-server', { detail: payload }));
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Failed to save site data to server:', err);
    return false;
  }
}

/**
 * Upload an actual video or image file to the server.
 * Returns the permanent static URL (e.g. /uploads/video_1720000000.mp4)
 */
export async function uploadMediaFileToServer(file: File | Blob, originalFilename?: string): Promise<string | null> {
  try {
    const formData = new FormData();
    const filename = originalFilename || (file instanceof File ? file.name : `upload_${Date.now()}.mp4`);
    formData.append('file', file, filename);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Server upload failed');
    const json = await res.json();
    if (json.success && json.url) {
      return json.url;
    }
  } catch (err) {
    console.error('Failed to upload media file to server:', err);
  }
  return null;
}

/**
 * Upload a Base64 image (like profile picture crop or canvas thumbnail) to the server.
 * Returns the permanent static URL (e.g. /uploads/profile_1720000000.jpg)
 */
export async function uploadBase64ImageToServer(dataUrl: string, namePrefix = 'image'): Promise<string | null> {
  try {
    const res = await fetch('/api/upload-base64', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl, filename: namePrefix }),
    });
    if (!res.ok) throw new Error('Base64 upload failed');
    const json = await res.json();
    if (json.success && json.url) {
      return json.url;
    }
  } catch (err) {
    console.error('Failed to upload base64 image to server:', err);
  }
  return null;
}

/**
 * Recovers previously uploaded media from IndexedDB and syncs to server.
 * This recovers any video or photo that the user uploaded earlier that was saved in IndexedDB!
 */
export async function recoverAndSyncIndexedDBMedia(): Promise<Record<string, { url: string; thumbUrl?: string }>> {
  const recoveredMap: Record<string, { url: string; thumbUrl?: string }> = {};
  if (typeof window === 'undefined' || !window.indexedDB) return recoveredMap;

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('rahat_portfolio_media_db', 1);
      request.onsuccess = async () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('videos')) {
          resolve(recoveredMap);
          return;
        }
        const tx = db.transaction('videos', 'readonly');
        const store = tx.objectStore('videos');
        const getAllReq = store.getAll();

        getAllReq.onsuccess = async () => {
          const records = getAllReq.result || [];
          for (const rec of records) {
            if (rec && rec.blob && rec.id) {
              try {
                const ext = rec.mimeType?.includes('webm') ? 'webm' : 'mp4';
                const serverUrl = await uploadMediaFileToServer(rec.blob, `${rec.id}.${ext}`);
                let thumbServerUrl = '';
                if (rec.thumbnailUrl && rec.thumbnailUrl.startsWith('data:')) {
                  thumbServerUrl = (await uploadBase64ImageToServer(rec.thumbnailUrl, `${rec.id}_thumb`)) || '';
                }
                if (serverUrl) {
                  recoveredMap[rec.id] = {
                    url: serverUrl,
                    thumbUrl: thumbServerUrl || rec.thumbnailUrl,
                  };
                }
              } catch (e) {
                console.warn(`Failed to recover media record ${rec.id}:`, e);
              }
            }
          }
          resolve(recoveredMap);
        };
        getAllReq.onerror = () => resolve(recoveredMap);
      };
      request.onerror = () => resolve(recoveredMap);
    } catch {
      resolve(recoveredMap);
    }
  });
}
