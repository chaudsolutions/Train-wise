const express = require("express");
const { v4: uuidv4 } = require("uuid");
//images store path
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const Community = require("../Models/Community");
const UsersModel = require("../Models/Users");
const CommunityCourse = require("../Models/CommunityCourse");

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
        const { name, description, subscriptionFee, rules, visions } = req.body;

        try {
            // find user
            const creator = await UsersModel.findById(userId);

            if (!creator) {
                return res.status(404).json("User not found");
            }

            const communities = await Community.find({});

            const existingSN = await Community.findOne({
                SN: communities.length + 1,
            });

            // Upload banner image to Cloudinary
            const bannerImageBuffer = req.files["bannerImage"][0].buffer;
            const bannerImageName = req.files["bannerImage"][0].originalname;
            const bannerImageResult = await uploadToCloudinary(
                bannerImageBuffer,
                bannerImageName,
                "png"
            );

            // Upload logo to Cloudinary
            const logoBuffer = req.files["logo"][0].buffer;
            const logoName = req.files["logo"][0].originalname;
            const logoResult = await uploadToCloudinary(
                logoBuffer,
                logoName,
                "png"
            );

            // Create the community
            const community = await Community.create({
                SN: existingSN ? existingSN.SN + 1 : communities.length + 1,
                name,
                description,
                rules,
                visions,
                subscriptionFee,
                bannerImage: bannerImageResult.secure_url, // Store Cloudinary URL
                logo: logoResult.secure_url, // Store Cloudinary URL
                createdBy: creator._id,
            });

            // create community course obj also
            await CommunityCourse.create({
                communityId: community._id,
                courses: [],
            });

            res.status(200).json(community);
        } catch (error) {
            console.error("Error creating community:", error);
            res.status(500).json("Failed to create community");
        }
    }
);

// endpoint to create a community course
router.post(
    "/createCourse/:communityId",
    upload.fields([
        { name: "videos", maxCount: 5 }, // Allow up to 5 video files
    ]),
    async (req, res) => {
        const userId = req.userId;
        const { communityId } = req.params;
        const { name, duration } = req.body;

        try {
            // Find the user creating the course
            const creator = await UsersModel.findById(userId);
            const community = await Community.findById(communityId);

            if (creator.id !== community.id) {
                return res
                    .status(403)
                    .json("Unauthorized to create course in this community");
            }

            // find the course schema
            const communityCourse = await CommunityCourse.findOne({
                communityId: community._id,
            });

            if (!communityCourse) {
                return res
                    .status(403)
                    .json("Cant find course for this community");
            }

            // Upload video files to Cloudinary
            const videosBuffer = req.files["videos"];
            const videosResult = await Promise.all(
                videosBuffer.map(async (file) => {
                    const videoName = file.originalname;
                    return await uploadToCloudinary(
                        file.buffer,
                        videoName,
                        "video"
                    );
                })
            );

            // create the community course obj and push into community course schema
            const communityCourseObj = {
                name,
                duration,
                videos: videosResult.map((video) => video.secure_url),
            };

            await communityCourse.courses.push(communityCourseObj);

            // save the updated community course schema
            await communityCourse.save();

            res.status(200).json("Course Created Successfully");
        } catch (error) {
            console.error("Error creating community course:", error);
            res.status(500).json("Failed to create community course");
        }
    }
);

// endpoint to delete a community
router.delete("/delete-community/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // find community
        const community = await Community.findByIdAndDelete(id);

        if (!community) {
            return res.status(404).json("Community not found");
        }

        const imageUrls = [community.logo, community.bannerImage];

        // Extract public_ids from image URLs and delete them from Cloudinary
        const deletePromises = imageUrls.map((url) => {
            const publicId = url.split("/").slice(-2).join("/").split(".")[0];
            return cloudinary.uploader.destroy(publicId);
        });

        await Promise.all(deletePromises);

        res.status(200).json("Community deleted successfully");
    } catch (error) {
        console.error("Error deleting community:", error);
        res.status(500).json("Failed to delete community");
    }
});

module.exports = { Creator: router };
