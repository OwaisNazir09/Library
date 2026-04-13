import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import '../config/cloudinary.js';

const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;


export const createUploader = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: (req) => {
      const tenantId = req.tenantId || 'global';
      return {
        folder: `library/${tenantId}/${folderName}`,
        allowed_formats: ALLOWED_FORMATS,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      };
    },
  });

  return multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
      const ext = file.mimetype.split('/')[1];
      if (!ALLOWED_FORMATS.includes(ext)) {
        return cb(new Error(`Invalid file type. Allowed: ${ALLOWED_FORMATS.join(', ')}`), false);
      }
      cb(null, true);
    },
  });
};


export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`Failed to delete Cloudinary image [${publicId}]:`, err.message);
  }
};

export const createResourceUploader = () => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
      const tenantId = req.tenantId || 'global';
      const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf') || file.fieldname === 'file';

      return {
        folder: `library/${tenantId}/resources`,
        resource_type: isPdf ? 'raw' : 'image',
        public_id: `${Date.now()}-${file.fieldname}`
      };
    },
  });

  return multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

      const isValidMime = allowedMimes.includes(file.mimetype.toLowerCase());
      const isValidExt = allowedExts.some(ext => file.originalname.toLowerCase().endsWith(ext));

      if (isValidMime || isValidExt) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type [${file.mimetype}]. Allowed: PDF, JPG, PNG, WEBP`), false);
      }
    },
  });
};
