const express = require("express");
const sanitizeHtml = require("sanitize-html");

const Category = require("../Models/Category");
const Payment = require("../Models/Payment");
const Community = require("../Models/Community");
const UsersModel = require("../Models/Users");
const { createNotification } = require("../utils/notifications");
const Withdrawal = require("../Models/Withdrawal");
const Settings = require("../Models/Settings");
const {
    extractPublicId,
    deleteCloudinaryImage,
} = require("../utils/cloudinary");
const { upload, uploadToCloudinary } = require("../utils/uploadMedia");
const { deleteCommunity } = require("../controllers/community.controller");
const CommunityCourse = require("../Models/CommunityCourse");
const CommunityMessage = require("../Models/CommunityMessage");

const router = express.Router();

// endpoint to post a new category
router.post("/new-category", async (req, res) => {
    const { icon, name } = req.body;
    try {
        await Category.create({
            name,
            icon,
        });

        res.status(200).json("New Category Added");
    } catch (error) {
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

// endpoint to delete a category
router.delete("/category/:categoryId", async (req, res) => {
    const { categoryId } = req.params;
    try {
        // find category
        // Find and delete the category
        const category = await Category.findByIdAndDelete(categoryId);

        // Check if category exists
        if (!category) {
            return res.status(404).json("Category not found");
        }

        // Respond with success message
        res.status(200).json("Category deleted successfully");
    } catch (error) {
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

// endpoint to create admin dashboard analytics
router.get("/dashboard/analytics", async (req, res) => {
    try {
        // Fetch payments and communities
        const payments = await Payment.find({ status: "succeeded" });
        const communities = await Community.find({})
            .sort({ createdAt: -1 })
            .select(
                "name description balance category createdBy logo bannerImage subscriptionFee members reports createdAt"
            )
            .populate("createdBy", "name") // Populate createdBy with name field
            .lean();

        // Fetch withdrawals with user and payment details
        const withdrawals = await Withdrawal.aggregate([
            // Populate userId with name and email
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId",
                },
            },
            { $unwind: "$userId" },
            // Populate paymentDetails
            {
                $lookup: {
                    from: "paymentdetails",
                    localField: "userId._id",
                    foreignField: "userId",
                    as: "paymentDetails",
                },
            },
            // Unwind paymentDetails (optional, may be empty)
            {
                $unwind: {
                    path: "$paymentDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // Project relevant fields
            {
                $project: {
                    _id: 1,
                    userId: {
                        _id: "$userId._id",
                        name: "$userId.name",
                        email: "$userId.email",
                    },
                    amount: 1,
                    status: 1,
                    adminNote: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    paymentDetails: {
                        $cond: {
                            if: { $eq: ["$paymentDetails", null] },
                            then: null,
                            else: {
                                methodType: "$paymentDetails.methodType",
                                bankName: "$paymentDetails.bankName",
                                accountNumber: "$paymentDetails.accountNumber",
                                accountName: "$paymentDetails.accountName",
                                accountRouting:
                                    "$paymentDetails.accountRouting",
                                paypalEmail: "$paymentDetails.paypalEmail",
                                cryptoWalletAddress:
                                    "$paymentDetails.cryptoWalletAddress",
                                cryptoType: "$paymentDetails.cryptoType",
                                verified: "$paymentDetails.verified",
                            },
                        },
                    },
                },
            },
            // Sort by createdAt descending
            { $sort: { createdAt: -1 } },
        ]);

        // Fetch users with their communities using aggregation
        const users = await UsersModel.aggregate([
            // Lookup communities created by the user
            {
                $lookup: {
                    from: "communities",
                    localField: "_id",
                    foreignField: "createdBy",
                    as: "communitiesCreated",
                },
            },
            // Lookup communities where the user is a member
            {
                $lookup: {
                    from: "communities",
                    let: { userId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ["$$userId", "$members.userId"] },
                            },
                        },
                        {
                            $project: {
                                name: 1,
                                description: 1,
                                category: 1,
                                createdBy: 1,
                                logo: 1,
                                bannerImage: 1,
                                subscriptionFee: 1,
                                members: 1,
                                createdAt: 1,
                            },
                        },
                    ],
                    as: "communitiesJoined",
                },
            },
            // Project and format community data
            {
                $project: {
                    name: 1,
                    email: 1,
                    role: 1,
                    avatar: 1,
                    communitiesCreated: {
                        $map: {
                            input: "$communitiesCreated",
                            as: "c",
                            in: {
                                _id: "$$c._id",
                                name: "$$c.name",
                                description: "$$c.description",
                                category: "$$c.category",
                                createdBy: "$$c.createdBy",
                                logo: "$$c.logo",
                                bannerImage: "$$c.bannerImage",
                                subscriptionFee: "$$c.subscriptionFee",
                                members: "$$c.members",
                                createdAt: "$$c.createdAt",
                                role: "owner",
                                memberSince: "$$c.createdAt",
                            },
                        },
                    },
                    communitiesJoined: {
                        $map: {
                            input: "$communitiesJoined",
                            as: "c",
                            in: {
                                _id: "$$c._id",
                                name: "$$c.name",
                                description: "$$c.description",
                                category: "$$c.category",
                                createdBy: "$$c.createdBy",
                                logo: "$$c.logo",
                                bannerImage: "$$c.bannerImage",
                                subscriptionFee: "$$c.subscriptionFee",
                                members: "$$c.members",
                                createdAt: "$$c.createdAt",
                                role: "member",
                                memberSince: {
                                    $let: {
                                        vars: {
                                            member: {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: "$$c.members",
                                                            as: "m",
                                                            cond: {
                                                                $eq: [
                                                                    "$$m.userId",
                                                                    "$_id",
                                                                ],
                                                            },
                                                        },
                                                    },
                                                    0,
                                                ],
                                            },
                                        },
                                        in: "$$member.createdAt",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ]).exec();

        // Convert aggregation result to lean-like objects
        const leanUsers = users.map((user) => ({
            ...user,
            communitiesCreated: user.communitiesCreated || [],
            communitiesJoined: user.communitiesJoined || [],
        }));

        // Build payments analytics
        const communityCreationPayments = payments.filter(
            (p) => p.paymentType === "community_creation"
        );
        const communitySubscriptionPayments = payments.filter(
            (p) => p.paymentType === "community_subscription"
        );
        const totalRevenue = payments.reduce(
            (sum, payment) => sum + payment.amount,
            0
        );
        const communityCreationRevenue = communityCreationPayments.reduce(
            (sum, payment) => sum + payment.amount,
            0
        );
        const communitySubscriptionRevenue =
            communitySubscriptionPayments.reduce(
                (sum, payment) => sum + payment.amount,
                0
            );

        // Build communities analytics
        const paidCommunities = communities.filter(
            (c) => c.subscriptionFee > 0
        );
        const freeCommunities = communities.filter(
            (c) => c.subscriptionFee === 0
        );

        // Build withdrawals analytics
        const pendingWithdrawals = withdrawals.filter(
            (w) => w.status === "pending"
        );
        const approvedWithdrawals = withdrawals.filter(
            (w) => w.status === "approved"
        );
        const rejectedWithdrawals = withdrawals.filter(
            (w) => w.status === "rejected"
        );
        const confirmedWithdrawals = withdrawals.filter(
            (w) => w.status === "confirmed"
        );

        // Filter users by role
        const adminRoles = leanUsers.filter((u) => u.role === "admin");
        const creatorRoles = leanUsers.filter((u) => u.role === "creator");
        const userRoles = leanUsers.filter((u) => u.role === "user");

        // get settings
        const settings = await Settings.findOne().lean();
        const communityCreationFee = settings.communityCreationFee / 100;
        const withdrawalLimit = settings.withdrawalLimit;

        const analytics = {
            revenue: {
                totalRevenue,
                communityCreationRevenue,
                communitySubscriptionRevenue,
            },
            communities: {
                communities,
                paidCommunities,
                freeCommunities,
            },
            users: {
                users,
                adminRoles,
                creatorRoles,
                userRoles,
            },
            withdrawals: {
                withdrawals,
                pendingWithdrawals,
                approvedWithdrawals,
                rejectedWithdrawals,
                confirmedWithdrawals,
            },
            settings: {
                communityCreationFee,
                withdrawalLimit,
            },
        };

        res.status(200).json(analytics);
    } catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).send("Internal server error.");
    }
});

// Update settings
router.put("/settings", async (req, res) => {
    try {
        const updateData = {
            $set: req.body,
        };

        // save the creation fee in cents for stripe
        await Settings.findOneAndUpdate({}, updateData, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
        });

        res.json("Settings Updated");
    } catch (error) {
        res.status(400).json({
            message: error.message || "Error updating settings",
        });
    }
});

// endpoint to fetch single user analytics
router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;

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

// Endpoint to change user role
router.put("/role-change/:userId", async (req, res) => {
    const { userId } = req.params;
    const { newRole } = req.body;
    const adminId = req.userId; // Admin performing the action

    // Validate newRole
    if (!["creator", "user"].includes(newRole)) {
        return res.status(400).json("Invalid role");
    }

    try {
        // Find admin
        const admin = await UsersModel.findById(adminId);
        if (!admin || admin.role !== "admin") {
            return res.status(403).json("Only admins can change roles");
        }

        // Find user
        const user = await UsersModel.findById(userId);
        if (!user) {
            return res.status(404).json("User not found");
        }

        // Prevent self-demotion
        if (userId === adminId && newRole !== "admin") {
            return res.status(400).json("Admins cannot demote themselves");
        }

        // Update role
        user.role = newRole;
        await user.save();

        // Notify user
        await createNotification(
            userId,
            `Your role was changed to ${
                newRole.charAt(0).toUpperCase() + newRole.slice(1)
            }`
        );

        // Notify admin
        await createNotification(
            adminId,
            `You changed ${user.name}'s role to ${
                newRole.charAt(0).toUpperCase() + newRole.slice(1)
            }`
        );

        res.status(200).json("Role updated successfully");
    } catch (error) {
        console.error("Error changing role:", error);
        res.status(500).json("Failed to change role");
    }
});

// Delete a community
router.delete("/community/:communityId", deleteCommunity);

// Admin approves/rejects withdrawal
router.put("/withdrawal/:id/:action", async (req, res) => {
    const { id, action } = req.params;
    const { adminNote } = req.body;
    const userId = req.userId;

    const status = action === "approve" ? "approved" : "rejected";

    try {
        const admin = await UsersModel.findById(userId);
        if (!admin || admin.role !== "admin") {
            return res
                .status(403)
                .json("Only admins can approve/reject withdrawals");
        }

        // Find withdrawal
        const withdrawal = await Withdrawal.findById(id).populate(
            "userId",
            "name email balance"
        );
        if (!withdrawal) {
            return res.status(404).json("Withdrawal not found");
        }

        // Check status
        if (withdrawal.status !== "pending") {
            return res.status(404).json("Withdrawal is not pending");
        }

        // Validate status transition
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json("Invalid status");
        }

        // Update withdrawal
        withdrawal.status = status;
        withdrawal.adminNote = sanitizeHtml(
            adminNote || withdrawal.adminNote || ""
        );

        if (status === "rejected") {
            // Return funds to user if rejected
            const user = await UsersModel.findById(withdrawal.userId._id);
            user.balance += withdrawal.amount;

            await Promise.all([user.save(), withdrawal.save()]);
        } else {
            await withdrawal.save();
        }

        // Create user notification
        const userNotificationMessage =
            status === "approved"
                ? `Your withdrawal of $${withdrawal.amount.toFixed(
                      2
                  )} was approved and will be processed shortly`
                : `Your withdrawal of $${withdrawal.amount.toFixed(
                      2
                  )} was rejected${adminNote ? `: ${adminNote}` : ""}`;

        await Promise.all([
            createNotification(withdrawal.userId._id, userNotificationMessage),
            createNotification(
                userId,
                `You ${status} a withdrawal of $${withdrawal.amount.toFixed(
                    2
                )} for ${withdrawal.userId.name}`
            ),
        ]);

        res.json(`Withdrawal ${status}`);
    } catch (error) {
        console.error("Admin withdrawal error:", error);
        res.status(500).json("Failed to process withdrawal");
    }
});

// Endpoint to edit community
router.put(
    "/edit-community/:communityId",
    upload.fields([
        { name: "bannerImage", maxCount: 1 },
        { name: "logo", maxCount: 1 },
    ]),
    async (req, res) => {
        const { communityId } = req.params;
        const { bannerImage, logo } = req.files;
        const { name, description, subscriptionFee, category, rules, visions } =
            req.body;

        try {
            // Find the community
            const community = await Community.findById(communityId);
            if (!community) {
                return res.status(404).json("Community not found");
            }

            // Prepare update fields
            const updateFields = {};

            // Handle text fields
            if (name) updateFields.name = name;
            if (description) updateFields.description = description;
            if (subscriptionFee)
                updateFields.subscriptionFee = parseFloat(subscriptionFee);
            if (category) updateFields.category = category;
            // if (canExplore !== undefined)
            //   updateFields.canExplore = canExplore === "true";

            // Handle rules (expecting an array)
            if (rules) {
                try {
                    updateFields.rules = Array.isArray(rules)
                        ? rules
                        : JSON.parse(rules);
                } catch (error) {
                    console.error("Error parsing rules:", error);
                    return res.status(400).json("Invalid rules format");
                }
            }

            // Handle visions (expecting an array)
            if (visions) {
                try {
                    updateFields.visions = Array.isArray(visions)
                        ? visions
                        : JSON.parse(visions);
                } catch (error) {
                    console.error("Error parsing visions:", error);
                    return res.status(400).json("Invalid visions format");
                }
            }

            // Handle banner image
            if (bannerImage) {
                try {
                    // Delete old banner image
                    const oldBannerPublicId = extractPublicId(
                        community.bannerImage
                    );
                    if (oldBannerPublicId) {
                        await deleteCloudinaryImage(oldBannerPublicId);
                    }

                    // Upload new banner image
                    const file = bannerImage[0];

                    const result = await uploadToCloudinary(
                        file.buffer,
                        file.originalname,
                        "image"
                    );

                    updateFields.bannerImage = result.secure_url;
                } catch (error) {
                    console.error("Error updating banner image:", error);
                    return res
                        .status(500)
                        .json({ error: "Error updating banner image" });
                }
            }

            // Handle logo
            if (logo) {
                try {
                    // Delete old logo
                    const oldLogoPublicId = extractPublicId(community.logo);
                    if (oldLogoPublicId) {
                        await deleteCloudinaryImage(oldLogoPublicId);
                    }

                    // Upload new logo
                    const file = logo[0];

                    const result = await uploadToCloudinary(
                        file.buffer,
                        file.originalname,
                        "image"
                    );

                    updateFields.logo = result.secure_url;
                } catch (error) {
                    console.error("Error updating logo:", error);
                    return res.status(500).json("Error updating logo");
                }
            }

            // Update community
            const updatedCommunity = await Community.findByIdAndUpdate(
                communityId,
                { $set: updateFields },
                { new: true, runValidators: true }
            );

            res.status(200).json(updatedCommunity);
        } catch (error) {
            console.error("Error updating community:", error);
            res.status(500).json("Internal server error");
        }
    }
);

// endpoint to search for user for community creation
router.put("/find-user-by-email", async (req, res) => {
    try {
        const { email } = req.body;

        // find user
        const user = await UsersModel.findOne({ email })
            .select("id name email avatar")
            .lean();

        if (!user) {
            return res.status(404).json("User doesn't exist");
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error searching for members:", error);
        res.status(500).json("Failed to search for members");
    }
});

// endpoint to create new community for a user
router.post(
    "/create-community-for-user",
    upload.fields([
        { name: "bannerImage", maxCount: 1 },
        { name: "logo", maxCount: 1 },
    ]),
    async (req, res) => {
        const adminId = req.userId;
        // Extract fields from the request body
        const {
            name,
            description,
            subscriptionFee,
            category,
            rules,
            visions,
            userId,
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
            !visions ||
            !userId
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

            // Upload banner and logo image to Cloudinary
            const [bannerImageResult, logoResult] = await Promise.all([
                uploadToCloudinary(
                    bannerImage.buffer,
                    bannerImage.originalname,
                    "image"
                ),
                uploadToCloudinary(logo.buffer, logo.originalname, "image"),
            ]);

            // add 1yr to date
            const currentDate = new Date();
            currentDate.setFullYear(currentDate.getFullYear() + 1);

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
                renewalDate: currentDate,
            };

            const community = await Community.create(communityData);

            await Promise.all([
                createNotification(
                    creator._id,
                    `Admin Created the community "${name}" for you`
                ),
                createNotification(
                    adminId,
                    `You Created the community "${name}" for ${creator.email}`
                ),

                // Create community course object
                await CommunityCourse.create({
                    communityId: community._id,
                    courses: [],
                }),

                // Create community messages object
                await CommunityMessage.create({
                    communityId: community._id,
                    messages: [],
                }),
            ]);

            res.status(200).json(community);
        } catch (error) {
            console.error("Error creating community:", error);
            res.status(500).json("Failed to create community");
        }
    }
);

module.exports = { Admin: router };
