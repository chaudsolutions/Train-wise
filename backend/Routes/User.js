const express = require("express");
const cloudinary = require("cloudinary").v2;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const UsersModel = require("../Models/Users");
const Community = require("../Models/Community");
const CommunityCourse = require("../Models/CommunityCourse");
const { upload, uploadToCloudinary } = require("../utils/uploadMedia");
const CommunityMessage = require("../Models/CommunityMessage");
const { createNotification } = require("../utils/notifications");
const Notification = require("../Models/Notification");
const Withdrawal = require("../Models/Withdrawal");
const Payment = require("../Models/Payment");
const PaymentDetails = require("../Models/PaymentDetails");

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
    const { subscriptionId } = req.body; // Actually paymentIntent.id

    try {
        const user = await UsersModel.findById(userId);
        const community = await Community.findById(communityId);

        if (!community || !user) {
            return res.status(404).json("Community or user not found");
        }

        if (!community.canExplore) {
            return res
                .status(403)
                .json("This community is not accepting new members for now");
        }

        if (
            user.role === "admin" ||
            community.createdBy.toString() === userId.toString()
        ) {
            return res.status(200).json("Welcome Admin");
        }

        // Check for existing membership
        const existingMembership = community.members.find(
            (m) => m.userId.toString() === userId.toString()
        );
        const isExistingMember = !!existingMembership;

        if (isExistingMember) {
            return res.status(200).json("Welcome Back");
        }

        // Handle free communities
        if (community.subscriptionFee === 0) {
            // Add as new member for free community
            community.members.push({
                userId: user._id,
                status: "active",
            });

            await createNotification(
                userId,
                `You joined the free community ${community.name}`
            );

            await community.save();
            return res.status(200).json("Successfully joined free community");
        }

        // PAID COMMUNITIES BELOW THIS POINT
        // Payment verification is required for paid communities
        if (!subscriptionId) {
            return res.status(400).json("Payment required for this community");
        }

        // Verify PaymentIntent
        const paymentIntent = await stripe.paymentIntents.retrieve(
            subscriptionId
        );

        if (paymentIntent.customer !== user.stripeCustomerId) {
            return res.status(403).json("Payment doesn't belong to user");
        }

        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json("Payment not successful");
        }

        // Calculate subscription period based on amount
        const amountPaid = paymentIntent.amount / 100; // Convert to dollars
        const monthlyFee = community.subscriptionFee;
        const yearlyFee = monthlyFee * 12;

        // Determine period based on payment amount
        const tolerance = 0.01; // Allow for floating-point precision issues
        let subscriptionPeriod;
        let periodDays;
        let periodText;

        if (Math.abs(amountPaid - monthlyFee) < tolerance) {
            subscriptionPeriod = "monthly";
            periodDays = 30;
            periodText = "month";
        } else if (Math.abs(amountPaid - yearlyFee) < tolerance) {
            subscriptionPeriod = "yearly";
            periodDays = 365;
            periodText = "year";
        } else {
            return res.status(400).json({
                message: `Invalid payment amount. Expected $${monthlyFee} or $${yearlyFee}`,
                paidAmount: amountPaid,
            });
        }

        const currentPeriodEnd = new Date(
            Date.now() + periodDays * 24 * 60 * 60 * 1000
        );

        // Save payment record
        await Payment.create({
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount / 100, // Convert cents to dollars
            currency: paymentIntent.currency,
            userId,
            communityId: community._id,
            paymentType: "community_subscription",
            status: paymentIntent.status,
            subscriptionPeriod,
        });

        // Notify payment success
        await createNotification(
            userId,
            `Payment for $${amountPaid} for ${periodText}ly access to ${
                community.name
            } ${isExistingMember ? "renewal" : "subscription"}`
        );

        // Update or create membership
        if (isExistingMember) {
            // Renew existing subscription
            existingMembership.status = "active";
            existingMembership.stripeSubscriptionId = subscriptionId;
            existingMembership.currentPeriodEnd = currentPeriodEnd;
            existingMembership.subscriptionPeriod = subscriptionPeriod;

            await createNotification(
                userId,
                `Renewed subscription for ${community.name} - $${
                    paymentIntent.amount / 100
                }`
            );
        } else {
            // Create new membership
            community.members.push({
                userId: user._id,
                stripeCustomerId: user.stripeCustomerId,
                stripeSubscriptionId: subscriptionId,
                status: "active",
                currentPeriodEnd,
                subscriptionPeriod,
            });

            await createNotification(
                userId,
                `Joined ${community.name} with ${subscriptionPeriod} plan - $${amountPaid}`
            );
        }

        await community.save();

        res.status(200).json(
            isExistingMember
                ? `Subscription renewed successfully for ${subscriptionPeriod} period`
                : `Successfully joined community with ${subscriptionPeriod} subscription`
        );
    } catch (error) {
        console.error("Join error:", error);
        res.status(500).json("Internal server error");
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
        const community = await Community.findById(communityId).lean();

        if (!user || !community) {
            return res.status(403).send("User or community not found.");
        }

        let membership = null;
        if (
            user.role === "admin" ||
            community.createdBy.toString() === user.id
        ) {
            membership = { status: "active" };
        } else {
            // Find the user in the community members array
            let userMembership = community.members.find(
                (member) => member.userId.toString() === user.id
            );

            membership = {
                ...userMembership,
                communitySubFee: community.subscriptionFee,
            };
        }

        // Return the membership status
        res.status(200).json(membership);
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

        if (!isMember && !isCreator && user.role !== "admin") {
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
    "/mark-watched/:communityId/course/:courseId/:lessonIndex",
    async (req, res) => {
        const userId = req.userId;
        const { communityId, courseId, lessonIndex } = req.params;

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
                if (!watchedCourse.lessons.includes(lessonIndex)) {
                    watchedCourse.lessons.push(lessonIndex);
                }
            } else {
                // Create new watched course entry
                user.coursesWatched.push({
                    courseId,
                    lessons: [lessonIndex],
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
router.put("/withdraw/:amountToWithdraw", async (req, res) => {
    const userId = req.userId;
    const { amountToWithdraw } = req.params;

    const amount = parseFloat(amountToWithdraw);
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json("Invalid withdrawal amount");
    }

    try {
        const user = await UsersModel.findById(userId);
        // find admin
        const admin = await UsersModel.findOne({ role: "admin" });
        if (!user) {
            return res.status(404).json("User not found");
        }

        if (user.balance < amount) {
            return res.status(400).json("Insufficient balance");
        }

        // 2. Deduct from user's balance and track pending withdrawal
        user.balance -= amount;
        await user.save();

        // 3. Create withdrawal record
        await Withdrawal.create([
            {
                userId,
                amount: amount,
                status: "pending",
            },
        ]);

        // 4. Create user notification
        await createNotification(
            userId,
            `Withdrawal request of $${amount.toFixed(
                2
            )} submitted for admin approval`
        );

        // create admin notification
        await createNotification(
            admin._id,
            `New Withdrawal request of $${amount.toFixed(2)}`
        );

        res.status(200).json("Withdrawal requested successfully");
    } catch (error) {
        console.error("Error processing withdrawal:", error);
        res.status(500).json("Failed to process withdrawal");
    }
});

// Get notifications for a user
router.get("/notifications", async (req, res) => {
    const userId = req.userId;

    try {
        const user = await UsersModel.findById(userId);
        if (!user) {
            return res.status(404).json("User not found");
        }

        const notifications = await Notification.find({ userId }).sort({
            createdAt: -1,
        });

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json("Failed to fetch notifications");
    }
});

// Get withdrawals for a user
router.get("/withdrawals", async (req, res) => {
    const userId = req.userId;

    try {
        const user = await UsersModel.findById(userId);
        if (!user) {
            return res.status(404).json("User not found");
        }

        // find withdrawals
        const withdrawals = await Withdrawal.find({ userId }).sort({
            createdAt: -1,
        });

        // find payment details also
        const paymentDetails = await PaymentDetails.findOne({ userId });

        res.status(200).json({ withdrawals, paymentDetails });
    } catch (error) {
        console.error("Error fetching withdrawals:", error);
        res.status(500).json("Failed to fetch withdrawals");
    }
});

// PUT /payment-details - Create or update payment details
router.put("/payment-details", async (req, res) => {
    try {
        const userId = req.userId;
        const { methodType, ...details } = req.body;

        // Validate required fields based on method type
        if (methodType === "bank" && !details.accountNumber) {
            return res
                .status(400)
                .json("Account number required for bank transfer");
        }
        if (methodType === "paypal" && !details.paypalEmail) {
            return res.status(400).json("PayPal email required");
        }
        if (
            methodType === "crypto" &&
            !details.cryptoWalletAddress &&
            !details.cryptoWalletName
        ) {
            return res.status(400).json("Wallet address required for crypto");
        }

        await PaymentDetails.findOneAndUpdate(
            { userId },
            {
                methodType,
                ...details,
                verified: false, // Reset verification when details change
            },
            {
                new: true,
                upsert: true, // Create if doesn't exist
            }
        );

        // Notify admin for verification
        await createNotification(userId, `You updated your payment details`);

        res.json("Success");
    } catch (error) {
        console.error("Payment details error:", error);
        res.status(500).json({ error: "Failed to update payment details" });
    }
});

// endpoint to cancel community subscription
router.put("/cancel-subscription/:communityId", async (req, res) => {
    const { communityId } = req.params;
    const userId = req.userId;

    try {
        const user = await UsersModel.findById(userId);

        if (!user) {
            return res.status(404).json("User not found");
        }

        const community = await Community.findById(communityId);

        if (!community) {
            return res.status(403).json("community not found");
        }

        // Find the user's membership
        const membership = community.members.find(
            (m) => m.userId.toString() === userId.toString()
        );

        if (!membership) {
            return res.status(404).json("Membership not found");
        }

        // Update membership status in database
        membership.status = "canceled";

        // Save the updated community
        await community.save();

        res.status(200).json("Subscription cancelled successfully");
    } catch (error) {
        console.error("Error cancelling subscription:", error);
        res.status(500).json("Failed to cancel subscription");
    }
});

// endpoint to report community
router.put("/report-community/:communityId", async (req, res) => {
    const { communityId } = req.params;
    const { reason } = req.body;
    const userId = req.userId;

    try {
        const user = await UsersModel.findById(userId);

        if (!user) {
            return res.status(404).json("User not found");
        }

        const community = await Community.findById(communityId);

        if (!community) {
            return res.status(403).json("community not found");
        }

        // Find the user's membership
        const membership = community.members.some(
            (m) => m.userId.toString() === userId.toString()
        );

        if (!membership) {
            return res.status(404).json("Only members can report");
        }

        // check reports if user has reported before
        const hasReported = community.reports.some(
            (report) => report.userId.toString() === userId.toString()
        );
        if (hasReported) {
            return res
                .status(403)
                .json("You have already reported this community");
        }

        community.reports.push({ userId, reason });
        await community.save();

        res.status(200).json("Report submitted successfully");
    } catch (error) {
        console.error("Error reporting community:", error);
        res.status(500).json("Failed to report community");
    }
});

module.exports = { User: router };
