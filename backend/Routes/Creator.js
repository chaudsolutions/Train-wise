const express = require("express");
const { v4: uuidv4 } = require("uuid");
//images store path
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const Community = require("../Models/Community");
const UsersModel = require("../Models/Users");

const router = express.Router();

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

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Promisify the upload_stream function
const uploadToCloudinary = (buffer, originalName) => {
    return new Promise((resolve, reject) => {
        const uniqueName = `${uuidv4()}-${originalName}`;
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "TrainWise",
                public_id: uniqueName,
                format: "png", // Convert to PNG format
                transformation: [
                    { width: 500, crop: "scale" },
                    { quality: "auto:best" },
                    { fetch_format: "auto" },
                ],
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};

// endpoint to create a community
router.post(
    "/create-community",
    upload.fields([
        { name: "bannerImage", maxCount: 1 },
        { name: "logo", maxCount: 1 },
    ]),
    async (req, res) => {
        const userId = req.userId;
        // Extract fields from the request body
        const { name, description, rules, visions } = req.body;

        try {
            // find user
            const creator = await UsersModel.findById(userId);

            if (!creator) {
                return res.status(404).json("User not found");
            }

            // Upload banner image to Cloudinary
            const bannerImageBuffer = req.files["bannerImage"][0].buffer;
            const bannerImageName = req.files["bannerImage"][0].originalname;
            const bannerImageResult = await uploadToCloudinary(
                bannerImageBuffer,
                bannerImageName
            );

            // Upload logo to Cloudinary
            const logoBuffer = req.files["logo"][0].buffer;
            const logoName = req.files["logo"][0].originalname;
            const logoResult = await uploadToCloudinary(logoBuffer, logoName);

            // Create the community
            const community = await Community.create({
                name,
                description,
                rules,
                visions,
                bannerImage: bannerImageResult.secure_url, // Store Cloudinary URL
                logo: logoResult.secure_url, // Store Cloudinary URL
                createdBy: creator._id,
            });

            res.status(200).json(community);
        } catch (error) {
            console.error("Error creating community:", error);
            res.status(500).json("Failed to create community");
        }
    }
);

module.exports = { Creator: router };
