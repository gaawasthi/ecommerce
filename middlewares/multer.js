import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('only images allowed'), false),
  limits: { fileSize: 5 * 1024 * 1024 }, 
});
