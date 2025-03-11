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

const uploadPic = (file, folderName) => {
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

const uploadVideo = (file, folderName) => {
  return new Promise((resolve, reject) => {
    const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/mkv"];

    // Validate file type
    if (!allowedTypes.includes(file.mimetype)) {
      return reject(
        new Error("Invalid file type. Only MP4, MOV, AVI, and MKV are allowed.")
      );
    }

    // Create Cloudinary upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "video", // Ensures Cloudinary processes it as a video
        chunk_size: 6000000, // 6MB chunk size (adjust if needed)
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Video Upload Error:", error);
          reject(error);
        } else {
          console.log("Cloudinary Video Upload Result:", result); // Debugging
          resolve({
            public_id: result.public_id, // ✅ Ensures public_id is returned
            url: result.secure_url, // ✅ Ensures video URL is returned
          });
        }
      }
    );

    // Convert file buffer into a readable stream and upload
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

module.exports = {
  cloudinary,
  uploadSpacePic,
  removeFromCloudinary,
  uploadPic,
  uploadVideo,
};
