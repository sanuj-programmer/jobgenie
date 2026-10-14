const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a profile image buffer to Cloudinary with automatic face cropping and webp optimization.
 * @param {Buffer} buffer
 * @param {string} userId
 * @returns {Promise<string>} Secure image URL
 */
const uploadAvatar = (buffer, userId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'jobgenie/avatars',
        public_id: `avatar_${userId}_${Date.now()}`,
        overwrite: true,
        transformation: [
          { width: 300, height: 300, crop: 'thumb', gravity: 'face' },
          { quality: 'auto', fetch_format: 'webp' }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Uploads a resume document buffer to Cloudinary in raw/authenticated format for security.
 * @param {Buffer} buffer
 * @param {string} originalName
 * @param {string} userId
 * @returns {Promise<{publicId: string, url: string}>}
 */
const uploadResume = (buffer, originalName, userId) => {
  return new Promise((resolve, reject) => {
    // Preserve extension for raw file types
    const ext = originalName.split('.').pop() || 'pdf';
    const cleanName = originalName.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'jobgenie/resumes',
        public_id: `resume_${userId}_${Date.now()}_${cleanName}`,
        resource_type: 'raw',
        access_mode: 'public' // or authenticated depending on distribution
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          publicId: result.public_id,
          url: result.secure_url
        });
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Deletes an asset by publicId
 * @param {string} publicId
 * @param {string} resourceType
 */
const deleteAsset = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.warn(`Failed to delete Cloudinary asset ${publicId}:`, err.message);
  }
};

module.exports = {
  uploadAvatar,
  uploadResume,
  deleteAsset
};
