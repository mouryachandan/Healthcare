import multer from 'multer';
import streamifier from 'streamifier';
import { cloudinary } from '../config/cloudinary.js';

const storage = multer.memoryStorage();
export const uploadMemory = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
});

export async function uploadToCloudinary(req, res, next) {
  if (!req.file?.buffer) return next();
  try {
    const folder = 'medisync/prescriptions';
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto' },
        (err, r) => (err ? reject(err) : resolve(r))
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    req.fileUrl = result.secure_url;
    next();
  } catch (e) {
    next(e);
  }
}

export function requireCloudinary(req, res, next) {
  const configured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;
  if (!configured)
    return res.status(503).json({
      message: 'File upload disabled — configure Cloudinary in .env',
    });
  next();
}
