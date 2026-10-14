const multer = require('multer');

// Store incoming files in memory as Buffers so we can stream directly to Cloudinary
const storage = multer.memoryStorage();

// Allowed avatar formats
const avatarMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const avatarFilter = (req, file, cb) => {
  if (avatarMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image type. Only JPEG, PNG, and WebP are allowed.'), false);
  }
};

// Allowed resume formats
const resumeMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const resumeFilter = (req, file, cb) => {
  if (resumeMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid resume file type. Only PDF and DOC/DOCX files are allowed.'), false);
  }
};

const uploadAvatarMiddleware = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB limit
  fileFilter: avatarFilter
});

const uploadResumeMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: resumeFilter
});

module.exports = {
  uploadAvatarMiddleware,
  uploadResumeMiddleware
};
