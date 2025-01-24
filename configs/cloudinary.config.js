const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allowed file types
const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];

// Upload pic space
const uploadSpacePic = (file, folderName) => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!allowedTypes.includes(file.mimetype)) {
      return reject(
        new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed.")
      );
    }

    // Create upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

const removeFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = { cloudinary, uploadSpacePic, removeFromCloudinary };
