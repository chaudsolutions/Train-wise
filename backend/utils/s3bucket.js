const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

// Configure multer for file upload (same as before)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// AWS S3 configurations
const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// Create S3 client
const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

// Upload to S3 function
const uploadToS3 = async (buffer, originalName, mimetype) => {
    const uniqueName = `${uuidv4()}-${originalName}`;
    const key = `TrainWise/${uniqueName}`; // Equivalent to Cloudinary folder

    const params = {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
    };

    try {
        await s3Client.send(new PutObjectCommand(params));

        // Return URL (note: for private buckets, you'll need to generate signed URLs)
        return {
            url: `https://${bucketName}.s3.${region}.amazonaws.com/${key}`,
            key: key,
            public_id: key, // Keeping same structure as Cloudinary for easier migration
        };
    } catch (error) {
        console.error("S3 upload error:", error);
        throw error;
    }
};

// Delete from S3 function
const deleteFromS3 = async (key) => {
    const params = {
        Bucket: bucketName,
        Key: key,
    };

    try {
        await s3Client.send(new DeleteObjectCommand(params));
    } catch (error) {
        console.error("Error deleting S3 object:", error);
        throw error;
    }
};

// Helper function to extract S3 key from URL
const extractS3Key = (url) => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        // Remove leading slash if present
        return urlObj.pathname.substring(1);
    } catch (error) {
        console.error("Error parsing S3 URL:", error);
        return null;
    }
};

// Add this to your s3Service.js
const deleteFromS3ByUrl = async (url) => {
    const key = extractS3Key(url);
    if (!key) {
        throw new Error("Invalid S3 URL provided");
    }
    return deleteFromS3(key);
};

module.exports = {
    uploadToS3,
    deleteFromS3,
    extractS3Key,
    deleteFromS3ByUrl,
    upload, // keeping the same multer middleware
};
