import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Ensure data and uploads directories exist
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const DATA_DIR = path.resolve(process.cwd(), 'data');
const SITE_DATA_FILE = path.join(DATA_DIR, 'site-data.json');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Body parsers with generous limits for JSON base64 payloads if needed
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve uploaded files statically with range support for video streaming
app.use('/uploads', express.static(UPLOADS_DIR, {
  setHeaders: (res, filePath) => {
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (filePath.endsWith('.webm')) {
      res.setHeader('Content-Type', 'video/webm');
    } else if (filePath.endsWith('.mov')) {
      res.setHeader('Content-Type', 'video/quicktime');
    }
  },
}));

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    const uniqueName = `${cleanBase}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 300 * 1024 * 1024, // 300 MB max for videos
  },
});

// ─── API Routes ─────────────────────────────────────────────────────────────

// 1. Upload Video or Image File
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

// 2. Upload Base64 image directly (for profile photos, thumbnails, etc.)
app.post('/api/upload-base64', (req, res) => {
  try {
    const { dataUrl, filename = 'image' } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      res.status(400).json({ error: 'Invalid dataUrl' });
      return;
    }
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      res.status(400).json({ error: 'Invalid base64 string' });
      return;
    }
    const mime = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    let ext = '.png';
    if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
    else if (mime.includes('webp')) ext = '.webp';
    else if (mime.includes('mp4')) ext = '.mp4';

    const safeName = `${filename.replace(/[^a-zA-Z0-9-_]/g, '_')}_${Date.now()}${ext}`;
    const targetPath = path.join(UPLOADS_DIR, safeName);
    fs.writeFileSync(targetPath, buffer);

    res.json({
      success: true,
      url: `/uploads/${safeName}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save base64 file' });
  }
});

// 3. Get Complete Persisted Site Data (For Visitors & Owner)
app.get('/api/site-data', (_req, res) => {
  try {
    if (fs.existsSync(SITE_DATA_FILE)) {
      const content = fs.readFileSync(SITE_DATA_FILE, 'utf-8');
      res.json({ success: true, data: JSON.parse(content) });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to read site data' });
  }
});

// 4. Save Persisted Site Data
app.post('/api/site-data', (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      res.status(400).json({ error: 'Invalid payload' });
      return;
    }
    const tempFile = `${SITE_DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, SITE_DATA_FILE);
    res.json({ success: true, savedAt: Date.now() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save site data' });
  }
});

// ─── Frontend Integration (Vite Middleware in Dev / Static Dist in Prod) ─────
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
