const express = require("express");
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
                // If no paymentId, community fee must be free or user must be admin or creator
                if (
                    creator.role === "user" &&
                    parseInt(settings.communityCreationFee) > 0
                ) {
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
                creatorName: creator.name,
                canExplore: true,
            };
            if (paymentId) {
                communityData.paymentId = paymentId;
                // add 1yr to date
                const currentDate = new Date();
                currentDate.setFullYear(currentDate.getFullYear() + 1);
                communityData.renewalDate = currentDate;
            }

            const community = await Community.create(communityData);

            // If payment was made, store payment details
            if (paymentId) {
                const paymentIntent = await stripe.paymentIntents.retrieve(
                    paymentId
                );

                await Promise.all([
                    Payment.create({
                        paymentId,
                        amount: paymentIntent.amount / 100, // Convert cents to dollars
                        currency: paymentIntent.currency,
                        userId,
                        communityId: community._id,
                        paymentType: "community_creation",
                        status: paymentIntent.status,
                        subscriptionPeriod: "yearly",
                    }),
                    // Notify payment success
                    createNotification(
                        userId,
                        `Payment of $${
                            paymentIntent.amount / 100
                        } for community ${name} creation succeeded`
                    ),
                ]);
            }

            await Promise.all([
                // Create community course object
                CommunityCourse.create({
                    communityId: community._id,
                    courses: [],
                }),
                // Create community messages object
                CommunityMessage.create({
                    communityId: community._id,
                    messages: [],
                }),
                // Notify community creation
                createNotification(
                    userId,
                    `You Created the community "${name}"`
                ),
            ]);

            res.status(200).json(community);
        } catch (error) {
            console.error("Error creating community:", error);
            res.status(500).json(error);
        }
    }
);

// endpoint to create a community course
router.post(
    "/createCourse/:communityId",
    upload.any(), // Handle multipart/form-data
    createCourse
);

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

// endpoint to search for a community member
router.put("/search-member/:communityId", async (req, res) => {
    try {
        const { communityId } = req.params;
        const { email } = req.body;

        // find community
        const community = await Community.findById(communityId);

        if (!community) {
            return res.status(404).json("Community not found");
        }

        // find user
        const user = await UsersModel.findOne({ email })
            .select("id name email avatar")
            .lean();

        if (!user) {
            return res.status(404).json("User doesn't exist");
        }

        const isCreator = community.createdBy.toString() === user.id;

        if (isCreator) {
            return res
                .status(403)
                .json(
                    "You cannot add yourself as a member of your own community"
                );
        }

        // check if user exists in community
        const isMember = community.members.some(
            (member) => member.userId.toString() === user.id
        );

        if (isMember) {
            return res
                .status(403)
                .json("User is already a member of this community");
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error searching for members:", error);
        res.status(500).json("Failed to search for members");
    }
});

// endpoint to add a member to the community
router.put("/add-member/:communityId", async (req, res) => {
    try {
        const { communityId } = req.params;
        const { userId } = req.body;

        // find community
        const community = await Community.findById(communityId);

        if (!community) {
            return res.status(404).json("Community not found");
        }

        // find user
        const user = await UsersModel.findById(userId);

        if (!user) {
            return res.status(404).json("User doesn't exist");
        }

        const isCreator = community.createdBy.toString() === user.id;

        if (isCreator) {
            return res
                .status(403)
                .json(
                    "You cannot add yourself as a member of your own community"
                );
        }

        // check if user exists in community
        const isMember = community.members.some(
            (member) => member.userId.toString() === user.id
        );

        if (isMember) {
            return res
                .status(403)
                .json("User is already a member of this community");
        }

        // add user to community
        community.members.push({
            userId: user.id,
            status: "active",
            currentPeriodEnd:
                community.subscriptionFee === 0
                    ? null
                    : Date.now() + 1000 * 60 * 60 * 24 * 30,
            subscriptionPeriod:
                community.subscriptionFee === 0 ? null : "monthly",
        });

        await Promise.all([
            community.save(),
            createNotification(
                community.createdBy,
                `You have added ${user.name} to your community ${community.name}`
            ),
            createNotification(
                user.id,
                `You have been added to the community ${community.name} by the creator`
            ),
        ]);

        res.status(200).json("Member added successfully");
    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).json("Failed to add member");
    }
});

// endpoint to verify storage payment and add storage to community
router.put("/storage-upgrade/:communityId", async (req, res) => {
    try {
        const { communityId } = req.params;
        const { storage, price, paymentId } = req.body;

        if (!paymentId) {
            return res.status(400).json("Payment is required");
        }

        // If paymentId is provided, verify payment
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

        if (
            paymentIntent.status !== "succeeded" ||
            paymentIntent.amount !== parseInt(price)
        ) {
            return res.status(400).json("Invalid or unverified payment");
        }

        // find community
        const community = await Community.findById(communityId);

        if (!community) {
            return res.status(404).json("Community not found");
        }

        const [creator, admin] = await Promise.all([
            UsersModel.findById(community.createdBy),
            UsersModel.findOne({ role: "admin" }),
        ]);

        if (!creator) {
            return res.status(404).json("creator doesn't exist");
        }

        // add new storage to community storage
        community.cloudStorageLimit += storage;

        await Promise.all([
            community.save(),
            createNotification(
                community.createdBy,
                `You have upgraded your community ${community.name} storage to ${community.cloudStorageLimit}GB`
            ),
            createNotification(
                admin.id,
                `${community.name} creator, ${creator.name} have upgraded their community storage to ${community.cloudStorageLimit}GB`
            ),
        ]);

        res.status(200).json("Storage upgraded successfully");
    } catch (error) {
        console.error("Error searching for members:", error);
        res.status(500).json("Failed to search for members");
    }
});

module.exports = { Creator: router };
