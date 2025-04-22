const express = require("express");
//images store path
const cloudinary = require("cloudinary").v2;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Community = require("../Models/Community");
const UsersModel = require("../Models/Users");
const CommunityCourse = require("../Models/CommunityCourse");
const { uploadToCloudinary, upload } = require("../utils/uploadMedia");
const CommunityMessage = require("../Models/CommunityMessage");
const Payment = require("../Models/Payment");
const { createNotification } = require("../utils/notifications");

const router = express.Router();

// Endpoint to create a community
router.post(
    "/create-community",
    upload.fields([
        { name: "bannerImage", maxCount: 1 },
        { name: "logo", maxCount: 1 },
    ]),
    async (req, res) => {
        const userId = req.userId;
        // Extract fields from the request body
        const {
            name,
            description,
            subscriptionFee,
            category,
            rules,
            visions,
            paymentId,
        } = req.body;

        const bannerImage = req.files["bannerImage"]?.[0];
        const logo = req.files["logo"]?.[0];

        // Validate required fields
        if (
            !name ||
            !description ||
            !subscriptionFee ||
            !category ||
            !rules ||
            !visions
        ) {
            return res.status(400).json("All fields are required");
        }

        if (!bannerImage || !logo) {
            return res.status(400).json("Banner image and logo are required");
        }

        try {
            // Find user
            const creator = await UsersModel.findById(userId);
            if (!creator) {
                return res.status(404).json("User not found");
            }

            // Check payment or role
            if (!paymentId) {
                // If no paymentId, user must be admin or creator
                if (creator.role !== "admin" && creator.role !== "creator") {
                    return res
                        .status(403)
                        .json("Payment required for regular users");
                }
            } else {
                // If paymentId is provided, verify payment
                const paymentIntent = await stripe.paymentIntents.retrieve(
                    paymentId
                );
                if (
                    paymentIntent.status !== "succeeded" ||
                    paymentIntent.amount !==
                        parseInt(process.env.COMMUNITY_CREATION_FEE)
                ) {
                    return res
                        .status(400)
                        .json("Invalid or unverified payment");
                }
            }

            // Upload banner image to Cloudinary
            const bannerImageBuffer = bannerImage.buffer;
            const bannerImageName = bannerImage.originalname;
            const bannerImageResult = await uploadToCloudinary(
                bannerImageBuffer,
                bannerImageName,
                "image"
            );

            // Upload logo to Cloudinary
            const logoBuffer = logo.buffer;
            const logoName = logo.originalname;
            const logoResult = await uploadToCloudinary(
                logoBuffer,
                logoName,
                "image"
            );

            // Create the community
            const communityData = {
                name,
                description,
                rules,
                visions,
                subscriptionFee: parseFloat(subscriptionFee),
                category,
                bannerImage: bannerImageResult.secure_url,
                logo: logoResult.secure_url,
                createdBy: creator._id,
            };
            if (paymentId) {
                communityData.paymentId = paymentId;
            }

            const community = await Community.create(communityData);

            // If payment was made, store payment details
            if (paymentId) {
                const paymentIntent = await stripe.paymentIntents.retrieve(
                    paymentId
                );
                await Payment.create({
                    paymentId,
                    amount: paymentIntent.amount / 100, // Convert cents to dollars
                    currency: paymentIntent.currency,
                    userId,
                    communityId: community._id,
                    paymentType: "community_creation",
                    status: paymentIntent.status,
                });

                // Notify payment success
                await createNotification(
                    userId,
                    `Payment of $${
                        paymentIntent.amount / 100
                    } for community ${name} creation succeeded`
                );
            }

            // Create community course object
            await CommunityCourse.create({
                communityId: community._id,
                courses: [],
            });

            // Notify community creation
            await createNotification(
                userId,
                `You Created the community "${name}"`
            );

            // Create community messages object
            await CommunityMessage.create({
                communityId: community._id,
                messages: [],
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

            if (creator.id !== community.createdBy.toString()) {
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

            // create a community notification
            const message = `New Course Added: ${communityCourseObj.name}`;

            // add notification to community
            await community.notifications.push({ message });

            // save the updated community course schema
            await communityCourse.save();

            // save the updated community
            await community.save();

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

        // get community courses obj and delete and also the videos url
        const communityCourse = await CommunityCourse.findOne({
            communityId: community._id,
        });

        if (communityCourse) {
            await communityCourse.courses.forEach(async (course) => {
                const videoUrls = course.videos;

                await Promise.all(
                    videoUrls.map(async (videoUrl) => {
                        const publicId = videoUrl
                            .split("/")
                            .slice(-2)
                            .join("/")
                            .split(".")[0];
                        await cloudinary.uploader.destroy(publicId);
                    })
                );
            });

            // now delete community course
            await CommunityCourse.findByIdAndDelete(communityCourse._id);
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
