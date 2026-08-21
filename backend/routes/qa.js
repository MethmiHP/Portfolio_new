import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 50);
    const skip = Math.max(Number(req.query.skip) || 0, 0);
    const db = getDB();
    const filter = { answer: { $exists: true, $ne: '' } };

    const [items, total] = await Promise.all([
      db.collection('qa')
        .find(filter)
        .sort({ answeredAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('qa').countDocuments(filter),
    ]);

    res.json({ items, total, hasMore: skip + items.length < total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const name = cleanText(req.body.name, 80);
    const question = cleanText(req.body.question, 1200);

    if (!name || !question) {
      return res.status(400).json({ message: 'Name and question are required' });
    }

    const db = getDB();
    const doc = {
      name,
      question,
      answer: '',
      createdAt: new Date(),
      answeredAt: null,
      updatedAt: new Date(),
    };

    const result = await db.collection('qa').insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admin', authMiddleware, async (_req, res) => {
  try {
    const db = getDB();
    const items = await db.collection('qa')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/answer', authMiddleware, async (req, res) => {
  try {
    const answer = cleanText(req.body.answer, 3000);
    if (!answer) return res.status(400).json({ message: 'Answer is required' });
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid question id' });

    const db = getDB();
    const result = await db.collection('qa').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { answer, answeredAt: new Date(), updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) return res.status(404).json({ message: 'Question not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid question id' });

    const db = getDB();
    const result = await db.collection('qa').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Question not found' });

    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
