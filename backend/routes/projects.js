import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { cleanText, isValidHttpUrl, parseTextArray } from '../utils/validation.js';
import { deleteMediaFile, isMediaPath, saveMediaFile } from '../utils/mediaStorage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isImage = file.fieldname === 'image' && file.mimetype.startsWith('image/');
    const isVideo = file.fieldname === 'video' && file.mimetype.startsWith('video/');
    if (isImage || isVideo) return cb(null, true);
    cb(new Error('Only image and video uploads are allowed'));
  },
});

const router = Router();

async function removeUpload(filePath) {
  if (isMediaPath(filePath)) {
    await deleteMediaFile(filePath);
    return;
  }

  if (!filePath?.startsWith('/uploads/')) return;

  const resolved = path.resolve(uploadDir, path.basename(filePath));
  if (!resolved.startsWith(path.resolve(uploadDir))) return;

  fs.unlink(resolved, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error(`Failed to delete upload ${resolved}:`, err.message);
    }
  });
}

router.get('/', async (_req, res) => {
  try {
    const db = getDB();
    const projects = await db
      .collection('projects')
      .find({})
      .sort({ order: 1, createdAt: -1 })
      .toArray();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid project id' });
    const db = getDB();
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(req.params.id),
    });
    if (!project) return res.status(404).json({ message: 'Not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]), async (req, res) => {
  try {
    const db = getDB();
    const { title, subtitle, description, technologies, link, order, category } = req.body;
    const projectTitle = cleanText(title, 160);
    const projectDescription = cleanText(description, 5000);
    const projectLink = cleanText(link, 500);

    if (!projectTitle) return res.status(400).json({ message: 'Project title is required' });
    if (!projectDescription) return res.status(400).json({ message: 'Project description is required' });
    if (!isValidHttpUrl(projectLink)) return res.status(400).json({ message: 'Project link must be a valid URL' });

    let parsedTechnologies;
    try {
      parsedTechnologies = parseTextArray(technologies, []);
    } catch {
      return res.status(400).json({ message: 'Technologies must be a valid array' });
    }

    const project = {
      title: projectTitle,
      subtitle: cleanText(subtitle, 240),
      description: projectDescription,
      category: cleanText(category, 80) || 'Development',
      technologies: parsedTechnologies,
      link: projectLink,
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    project.image = req.files?.image?.[0]
      ? await saveMediaFile(req.files.image[0], { collection: 'projects', type: 'image' })
      : '';
    project.video = req.files?.video?.[0]
      ? await saveMediaFile(req.files.video[0], { collection: 'projects', type: 'video' })
      : '';

    const result = await db.collection('projects').insertOne(project);
    res.status(201).json({ ...project, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/reorder', authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: 'orderedIds must be an array' });
    }

    const operations = orderedIds
      .filter((id) => ObjectId.isValid(id))
      .map((id, index) => ({
        updateOne: {
          filter: { _id: new ObjectId(id) },
          update: { $set: { order: index + 1, updatedAt: new Date() } },
        },
      }));

    if (operations.length) {
      await db.collection('projects').bulkWrite(operations);
    }

    const projects = await db
      .collection('projects')
      .find({})
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/categories/rename', authMiddleware, async (req, res) => {
  try {
    const from = String(req.body.from || '').trim();
    const to = String(req.body.to || '').trim();
    if (!from || !to) return res.status(400).json({ message: 'From and to categories are required' });

    const db = getDB();
    await db.collection('projects').updateMany(
      { category: from },
      { $set: { category: to, updatedAt: new Date() } }
    );

    const projects = await db.collection('projects').find({}).sort({ order: 1, createdAt: -1 }).toArray();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/categories/delete', authMiddleware, async (req, res) => {
  try {
    const category = String(req.body.category || '').trim();
    const moveTo = String(req.body.moveTo || 'Development').trim() || 'Development';
    if (!category || category === 'Development') {
      return res.status(400).json({ message: 'Choose a custom category to delete' });
    }

    const db = getDB();
    await db.collection('projects').updateMany(
      { category },
      { $set: { category: moveTo, updatedAt: new Date() } }
    );

    const projects = await db.collection('projects').find({}).sort({ order: 1, createdAt: -1 }).toArray();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]), async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid project id' });
    const db = getDB();
    const existing = await db.collection('projects').findOne({
      _id: new ObjectId(req.params.id),
    });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const { title, subtitle, description, technologies, link, order, category, removeImage, removeVideo } = req.body;

    const projectLink = link !== undefined ? cleanText(link, 500) : existing.link;
    if (!isValidHttpUrl(projectLink)) return res.status(400).json({ message: 'Project link must be a valid URL' });

    let parsedTechnologies = existing.technologies;
    try {
      parsedTechnologies = parseTextArray(technologies, existing.technologies);
    } catch {
      return res.status(400).json({ message: 'Technologies must be a valid array' });
    }

    const update = {
      title: title !== undefined ? cleanText(title, 160) : existing.title,
      subtitle: subtitle !== undefined ? cleanText(subtitle, 240) : existing.subtitle,
      description: description !== undefined ? cleanText(description, 5000) : existing.description,
      category: cleanText(category, 80) || existing.category || 'Development',
      technologies: parsedTechnologies,
      link: projectLink,
      order: order !== undefined && Number.isFinite(Number(order)) ? Number(order) : existing.order,
      updatedAt: new Date(),
    };

    if (!update.title) return res.status(400).json({ message: 'Project title is required' });
    if (!update.description) return res.status(400).json({ message: 'Project description is required' });

    if (req.files?.image?.[0]) {
      await removeUpload(existing.image);
      update.image = await saveMediaFile(req.files.image[0], { collection: 'projects', type: 'image' });
    } else if (removeImage === 'true') {
      await removeUpload(existing.image);
      update.image = '';
    }
    if (req.files?.video?.[0]) {
      await removeUpload(existing.video);
      update.video = await saveMediaFile(req.files.video[0], { collection: 'projects', type: 'video' });
    } else if (removeVideo === 'true') {
      await removeUpload(existing.video);
      update.video = '';
    }

    await db.collection('projects').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update },
    );

    res.json({ ...existing, ...update, _id: existing._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid project id' });
    const db = getDB();
    const existing = await db.collection('projects').findOne({
      _id: new ObjectId(req.params.id),
    });
    const result = await db.collection('projects').deleteOne({
      _id: new ObjectId(req.params.id),
    });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
    await removeUpload(existing?.image);
    await removeUpload(existing?.video);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;


