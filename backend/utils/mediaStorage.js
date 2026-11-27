import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

import { getDB } from '../config/db.js';

const BUCKET_NAME = 'media';

function getBucket() {
  return new GridFSBucket(getDB(), { bucketName: BUCKET_NAME });
}

export function isMediaPath(filePath) {
  return typeof filePath === 'string' && filePath.startsWith('/api/media/');
}

export function mediaPathFromId(id) {
  return `/api/media/${id}`;
}

export async function saveMediaFile(file, metadata = {}) {
  if (!file?.buffer) return '';

  const bucket = getBucket();
  const uploadStream = bucket.openUploadStream(file.originalname || 'upload', {
    contentType: file.mimetype,
    metadata: {
      fieldname: file.fieldname,
      size: file.size,
      ...metadata,
    },
  });

  await new Promise((resolve, reject) => {
    Readable.from(file.buffer)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', resolve);
  });

  return mediaPathFromId(uploadStream.id.toString());
}

export async function deleteMediaFile(filePath) {
  if (!isMediaPath(filePath)) return;

  const id = filePath.split('/api/media/')[1]?.split(/[?#]/)[0];
  if (!ObjectId.isValid(id)) return;

  try {
    await getBucket().delete(new ObjectId(id));
  } catch (err) {
    if (err.codeName !== 'FileNotFound' && err.message !== 'FileNotFound') {
      console.error(`Failed to delete media ${id}:`, err.message);
    }
  }
}

export async function findMediaFile(id) {
  if (!ObjectId.isValid(id)) return null;

  return getDB().collection(`${BUCKET_NAME}.files`).findOne({ _id: new ObjectId(id) });
}

export function openMediaDownloadStream(id) {
  return getBucket().openDownloadStream(new ObjectId(id));
}
