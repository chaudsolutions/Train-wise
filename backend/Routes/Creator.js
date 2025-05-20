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
const { createCourse } = require("../controllers/course.controller");
const Settings = require("../Models/Settings");

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

            const settings = await Settings.findOne().lean();

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
                        parseInt(settings.communityCreationFee)
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
    upload.any(), // Handle multipart/form-data
    createCourse
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
        const communityCourse = await CommunityCourse.findByIdAndDelete(
            communityCourse._id
        );

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

// endpoint to withdraw community balance
router.put("/withdraw/:communityId", async (req, res) => {
    try {
        const { communityId } = req.params;
        const userId = req.userId; // From auth middleware

        // 1. Verify community ownership
        const community = await Community.findOne({
            _id: communityId,
            createdBy: userId,
        });

        if (!community) {
            return res.status(403).json("You don't own this community");
        }

        // 2. Check available balance
        if (community.balance <= 0) {
            return res.status(400).json("No balance available for withdrawal");
        }

        const withdrawalAmount = community.balance;

        // 3. Update balances
        await Promise.all([
            Community.updateOne({ _id: communityId }, { $set: { balance: 0 } }),
            UsersModel.findByIdAndUpdate(userId, {
                $inc: { balance: withdrawalAmount },
            }),
        ]);

        // 4. Create notification using your hook
        await createNotification(
            userId,
            `You've successfully withdrawn $${withdrawalAmount.toFixed(
                2
            )} from ${community.name}`
        );

        res.status(200).json(`Successful`);
    } catch (error) {
        console.error("Withdrawal error:", error);
        res.status(500).json("Withdrawal failed");
    }
});

// Endpoint to delete a community message
router.delete("/:communityId/delete-message/:messageId", async (req, res) => {
    const { communityId, messageId } = req.params;
    try {
        // Find the CommunityMessage document for the community
        const communityMessage = await CommunityMessage.findOne({
            communityId,
        });

        if (!communityMessage) {
            return res.status(404).json("Community messages not found");
        }

        // Check if the message exists
        const messageExists = communityMessage.messages.some(
            (msg) => msg._id.toString() === messageId
        );
        if (!messageExists) {
            return res.status(404).json("Message not found");
        }

        // Delete the message using $pull
        const result = await CommunityMessage.updateOne(
            { communityId },
            { $pull: { messages: { _id: messageId } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(500).json("Failed to delete message");
        }

        res.status(200).json("Message deleted successfully");
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json("Failed to delete message");
    }
});

module.exports = { Creator: router };
