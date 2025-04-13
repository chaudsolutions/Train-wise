const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// cloudinary configurations
const cloud_name = process.env.cloudinaryName;
const api_key = process.env.cloudinaryApiKey;
const api_secret = process.env.cloudinaryApiSecret;

// cloudinary config
cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
});

// Promisify the upload_stream function
const uploadToCloudinary = (buffer, originalName, resourceType) => {
    return new Promise((resolve, reject) => {
        const uniqueName = `${uuidv4()}-${originalName}`;
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "TrainWise",
                public_id: uniqueName,
                resource_type: resourceType, // "auto", "image", "video", or "raw" (for PDFs)
                transformation: [
                    { width: 500, crop: "scale" }, // Only for images
                    { quality: "auto:best" },
                    { fetch_format: "auto" },
                ],
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return reject(error);
                }
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};

module.exports = {
    uploadToCloudinary,
    upload,
};
