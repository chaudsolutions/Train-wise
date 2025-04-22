const express = require("express");
const cloudinary = require("cloudinary").v2;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const UsersModel = require("../Models/Users");
const Community = require("../Models/Community");
const CommunityCourse = require("../Models/CommunityCourse");
const { upload, uploadToCloudinary } = require("../utils/uploadMedia");
const CommunityMessage = require("../Models/CommunityMessage");
const Payment = require("../Models/Payment");
const { createNotification } = require("../utils/notifications");
const Notification = require("../Models/Notification");

const router = express.Router();

// Server route to fetch user details
router.get("/data", async (req, res) => {
    try {
        const userId = req.userId;
        // Retrieve the user's details from the database using the decoded user ID
        const user = await UsersModel.findById(userId).sort({ createdAt: -1 });

        if (!user) {
            return res.status(403).send("User not found.");
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

// 2. Community Membership Endpoint (Joining Logic)
router.put("/joinCommunity/:communityId", async (req, res) => {
    const userId = req.userId;
    const { communityId } = req.params;
    const { subscriptionId } = req.body;

    try {
        const user = await UsersModel.findById(userId);
        const community = await Community.findById(communityId);

        if (!community || !user) {
            return res.status(404).send("Community or user not found");
        }

        // Check if already a member
        const isMember = community.members.some(
            (m) => m.userId.toString() === userId.toString()
        );
        if (isMember) {
            return res.status(200).json("Welcome Back");
        }

        // For paid communities, verify subscription
        if (community.subscriptionFee > 0) {
            if (!subscriptionId) {
                return res.status(400).json("Subscription required");
            }

            // Verify subscription is valid and belongs to user
            const subscription = await stripe.subscriptions.retrieve(
                subscriptionId
            );

            if (subscription.customer !== user.stripeCustomerId) {
                return res
                    .status(403)
                    .json("Subscription doesn't belong to user");
            }

            if (subscription.status !== "active") {
                return res.status(400).json("Subscription not active");
            }
        }

        // Add to community members
        // Add to community members
        const currentPeriodEnd =
            community.subscriptionFee > 0
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                : null;

        community.members.push({
            userId: user._id,
            stripeCustomerId: user.stripeCustomerId,
            stripeSubscriptionId: subscriptionId,
            status: "active",
            currentPeriodEnd,
        });

        await community.save();
        res.status(200).json("Successfully joined community");
    } catch (error) {
        console.error("Join error:", error);
        res.status(500).send("Internal server error");
    }
});

// endpoint to get communities user is part of
router.get("/analytics", async (req, res) => {
    const userId = req.userId;

    try {
        // Fetch user details
        const user = await UsersModel.findById(userId)
            .select("name email balance role avatar createdAt")
            .lean();
        if (!user) {
            return res.status(404).json("User not found");
        }

        // Fetch communities (created or joined)
        const userCommunities = await Community.find({
            $or: [{ createdBy: userId }, { "members.userId": userId }],
        })
            .select(
                "name description category createdBy logo bannerImage subscriptionFee members createdAt"
            )
            .lean();

        // Format communities with role and memberSince
        const formattedCommunities = userCommunities.map((community) => {
            const isOwner =
                community.createdBy.toString() === userId.toString();
            const memberSince = isOwner
                ? community.createdAt
                : community.members.find(
                      (m) => m.userId.toString() === userId.toString()
                  ).createdAt;
            return {
                ...community,
                role: isOwner ? "owner" : "member",
                memberSince,
            };
        });

        // Split communities
        const communitiesCreated = formattedCommunities.filter(
            (c) => c.role === "owner"
        );
        const communitiesJoined = formattedCommunities.filter(
            (c) => c.role === "member"
        );

        // Fetch financial data
        const payments = await Payment.find({ userId, status: "succeeded" });

        // Calculate amount spent on community creation
        const communityCreationSpent = payments
            .filter((p) => p.paymentType === "community_creation")
            .reduce((sum, p) => sum + p.amount, 0);

        // Calculate amount spent on community membership subscriptions
        const joinedCommunityIds = communitiesJoined.map((c) => c._id);
        const communityMembershipSpent = await Payment.aggregate([
            {
                $match: {
                    paymentType: "community_subscription",
                    userId: userId,
                    communityId: { $in: joinedCommunityIds },
                    status: "succeeded",
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ]);

        const totalMembershipSpent = communityMembershipSpent[0]?.total || 0;

        // Fetch subscription revenue from user's created communities
        const createdCommunityIds = communitiesCreated.map((c) => c._id);
        const subscriptionRevenue = await Payment.aggregate([
            {
                $match: {
                    paymentType: "community_subscription",
                    communityId: { $in: createdCommunityIds },
                    status: "succeeded",
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" },
                },
            },
        ]);

        const totalSubscriptionRevenue = subscriptionRevenue[0]?.total || 0;

        const analytics = {
            user,
            communities: {
                created: communitiesCreated,
                joined: communitiesJoined,
            },
            finances: {
                communityCreationSpent,
                subscriptionRevenue: totalSubscriptionRevenue,
                communityMembershipSpent: totalMembershipSpent,
            },
        };

        res.status(200).json(analytics);
    } catch (error) {
        console.error("Error fetching user analytics:", error);
        res.status(500).json("Internal server error");
    }
});

// server route to verify community membership
router.get("/verify-membership/:communityId", async (req, res) => {
    try {
        const userId = req.userId;
        const { communityId } = req.params;

        // Retrieve the user and community from the database
        const user = await UsersModel.findById(userId);
        const community = await Community.findById(communityId);

        if (!user || !community) {
            return res.status(403).send("User or community not found.");
        }

        // Find the user in the community members array
        const userMembership = community.members.find(
            (member) => member.userId.toString() === user.id
        );

        // Check if the user is a member and their membership is active
        let isMember = userMembership.membership;

        // Check if the user is the creator of the community
        const isCreator = community.createdBy.toString() === user.id;

        // For paid communities, check if the membership has expired
        if (community.subscriptionFee > 0) {
            console.log("here");
            const currentTime = new Date();
            const membershipExpiration = new Date(
                userMembership.membershipExpiration
            );

            if (membershipExpiration < currentTime) {
                isMember = false; // Membership has expired
            }
        }

        // Return the membership status
        res.status(200).json(isMember || isCreator);
    } catch (error) {
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

// endpoint to get courses for community
router.get("/courses/community/:communityId", async (req, res) => {
    const userId = req.userId;
    try {
        const { communityId } = req.params;

        const community = await Community.findById(communityId);
        const user = await UsersModel.findById(userId);
        const coursesObj = await CommunityCourse.findOne({
            communityId: community.id,
        });

        if (!community) {
            return res.status(404).json("Community not found.");
        }
        if (!user) {
            return res.status(403).json("User not found.");
        }

        // Check if user is a member of the specified community
        const isMember = community.members.some(
            (member) => member.userId.toString() === user.id
        );
        // check if user might be creator of community
        const isCreator = community.createdBy.toString() === user.id;

        if (!isMember && !isCreator) {
            return res
                .status(403)
                .json("User not authorized to access this resource.");
        }

        res.status(200).json(coursesObj);
    } catch (error) {
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

// endpoint to get single course for community
router.get("/course/community/:communityId/:courseId", async (req, res) => {
    const userId = req.userId;
    const { communityId, courseId } = req.params;

    try {
        const community = await Community.findById(communityId);
        const user = await UsersModel.findById(userId);

        const CommunityCoursesObj = await CommunityCourse.findOne({
            communityId: community.id,
        });

        if (!community) {
            return res.status(404).json("Community not found.");
        }
        if (!user) {
            return res.status(403).json("User not found.");
        }

        // find course inside the community courses obj
        const course = CommunityCoursesObj.courses.find(
            (c) => c._id.toString() === courseId
        );

        if (!course) {
            return res.status(404).json("Course not found.");
        }

        res.status(200).json(course);
    } catch (error) {
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

// endpoint to mark a video as watched
router.put(
    "/community/:communityId/course/:courseId/:video",
    async (req, res) => {
        const userId = req.userId;
        const { communityId, courseId, video } = req.params;

        try {
            const community = await Community.findById(communityId);
            const user = await UsersModel.findById(userId);

            // Find the course in CommunityCourse
            const communityCourses = await CommunityCourse.findOne({
                communityId: community._id,
            });

            if (!communityCourses) {
                return res.status(404).json("Community courses not found.");
            }

            const courseExists = communityCourses.courses.some(
                (c) => c._id.toString() === courseId
            );

            if (!courseExists) {
                return res.status(404).json("Course not found.");
            }

            // Find or create the watched course entry
            let watchedCourse = user.coursesWatched.find(
                (c) => c.courseId.toString() === courseId
            );

            if (watchedCourse) {
                // Add video if not already watched
                if (!watchedCourse.videos.includes(video)) {
                    watchedCourse.videos.push(video);
                }
            } else {
                // Create new watched course entry
                user.coursesWatched.push({
                    courseId,
                    videos: [video],
                });
            }

            await user.save();

            res.status(200).json("Video marked as watched.");
        } catch (error) {
            res.status(500).send("Internal server error.");
            console.log(error);
        }
    }
);

// endpoint to update profile pic
router.put("/upload-avatar", upload.single("avatar"), async (req, res) => {
    const userId = req.userId;

    try {
        // find user
        const user = await UsersModel.findById(userId);

        if (!user) {
            return res.status(404).json("User not found");
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json("No file uploaded");
        }

        // delete existing avatar if exists
        if (user.avatar) {
            try {
                const publicId = user.avatar
                    .split("/")
                    .slice(-2)
                    .join("/")
                    .split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (cloudinaryError) {
                console.error("Error deleting old avatar:", cloudinaryError);
                // Continue even if deletion fails - we don't want to block the upload
            }
        }

        // Upload new avatar to Cloudinary
        const avatarResult = await uploadToCloudinary(
            req.file.buffer, // Access buffer directly from req.file
            req.file.originalname,
            "image"
        );

        user.avatar = avatarResult.secure_url;

        await user.save();

        res.status(200).json("Profile Picture Updated");
    } catch (error) {
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

// toggle online status
router.put("/toggle-online-status", async (req, res) => {
    const userId = req.userId;
    const { status } = req.body;

    try {
        // find user
        const user = await UsersModel.findByIdAndUpdate(
            userId,
            { onlineStatus: status },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json("User not found");
        }

        res.status(200).json(
            `User is now ${user.onlineStatus ? "online" : "offline"}`
        );
    } catch (error) {
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

// Send message endpoint
router.put("/:communityId/send/messages", async (req, res) => {
    const { communityId } = req.params;
    const userId = req.userId;

    try {
        const { content } = req.body;
        const community = await Community.findById(communityId);

        if (!community) {
            return res.status(404).json("Community not found");
        }

        // check if admin
        const createdBy = community.createdBy.toString() === userId.toString();

        // Check if user is a member
        const isMember =
            community.members.some((m) => m.userId.equals(userId)) || createdBy;
        if (!isMember) {
            return res.status(403).json("Not a community member");
        }

        // Find community message document
        let communityMessage = await CommunityMessage.findOne({
            communityId: community._id,
        });

        // Add new message
        communityMessage.messages.push({
            sender: userId,
            content,
        });

        await communityMessage.save();

        // Populate sender info for response
        const savedMessage =
            communityMessage.messages[communityMessage.messages.length - 1];
        await CommunityMessage.populate(savedMessage, {
            path: "sender",
            select: "name avatar",
        });

        res.status(201).json(savedMessage);
    } catch (error) {
        res.status(500).json("Server error");
        console.log(error);
    }
});

// Example withdrawal endpoint
router.post("/withdraw/:amountToWithdraw", async (req, res) => {
    const userId = req.userId;
    const { amountToWithdraw } = req.params;

    const amount = parseFloat(amountToWithdraw);
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json("Invalid withdrawal amount");
    }

    try {
        const user = await UsersModel.findById(userId);
        if (!user) {
            return res.status(404).json("User not found");
        }

        if (user.balance < amount) {
            return res.status(400).json("Insufficient balance");
        }

        // Process withdrawal (e.g., via Stripe or other service)
        // Assume withdrawal logic here updates user.balance
        user.balance -= amount;
        await user.save();

        // Notify user
        await createNotification(
            userId,
            `You requested a withdrawal of $${amount.toFixed(2)}`
        );

        res.status(200).json("Withdrawal requested successfully");
    } catch (error) {
        console.error("Error processing withdrawal:", error);
        res.status(500).json("Failed to process withdrawal");
    }
});

// Get notifications for a user or admin
router.get("/notifications", async (req, res) => {
    const userId = req.userId;

    try {
        const user = await UsersModel.findById(userId);
        if (!user) {
            return res.status(404).json("User not found");
        }

        const notifications =
            user.role === "admin"
                ? await Notification.find()
                      .sort({ createdAt: -1 })
                      .populate("userId", "name email")
                : await Notification.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json("Failed to fetch notifications");
    }
});

module.exports = { User: router };
