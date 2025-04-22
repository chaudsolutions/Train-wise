const express = require("express");
const Category = require("../Models/Category");
const Payment = require("../Models/Payment");
const Community = require("../Models/Community");
const UsersModel = require("../Models/Users");
const { createNotification } = require("../utils/notifications");

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
            .select(
                "name description category createdBy logo bannerImage subscriptionFee members createdAt"
            )
            .lean();

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

        // Filter users by role
        const adminRoles = leanUsers.filter((u) => u.role === "admin");
        const creatorRoles = leanUsers.filter((u) => u.role === "creator");
        const userRoles = leanUsers.filter((u) => u.role === "user");

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
        };

        res.status(200).json(analytics);
    } catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).send("Internal server error.");
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

module.exports = { Admin: router };
