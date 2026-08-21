import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { getDB } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { saveMediaFile } from '../utils/mediaStorage.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image uploads are allowed'));
  },
});

router.get('/', async (_req, res) => {
  try {
    const db = getDB();
    const portfolio = await db.collection('portfolio').findOne({ key: 'main' });
    res.json(portfolio || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { _id, createdAt, ...safeBody } = req.body;
    const data = { ...safeBody, key: 'main', updatedAt: new Date() };

    await db.collection('portfolio').updateOne(
      { key: 'main' },
      { $set: data },
      { upsert: true },
    );

    const portfolio = await db.collection('portfolio').findOne({ key: 'main' });
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/asset', authMiddleware, upload.single('asset'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Asset file is required' });
    const path = await saveMediaFile(req.file, { collection: 'portfolio', type: 'asset' });
    res.status(201).json({ path });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { password } = req.body;
    const admin = await db.collection('admin').findOne({ username: req.user.username });

    if (!admin || !password) {
      return res.status(401).json({ message: 'Admin password is required' });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid admin password' });
    }

    await db.collection('portfolio').deleteOne({ key: 'main' });
    res.json({ message: 'Portfolio deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
