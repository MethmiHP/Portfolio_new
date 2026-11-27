import { Router } from 'express';

import { findMediaFile, openMediaDownloadStream } from '../utils/mediaStorage.js';

const router = Router();

router.get('/:id', async (req, res) => {
  try {
    const file = await findMediaFile(req.params.id);
    if (!file) return res.status(404).json({ message: 'Media not found' });

    res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    openMediaDownloadStream(req.params.id)
      .on('error', () => {
        if (!res.headersSent) res.status(404).json({ message: 'Media not found' });
        else res.end();
      })
      .pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
