const express = require("express");
const Category = require("../Models/Category");
const Payment = require("../Models/Payment");
const Community = require("../Models/Community");
const UsersModel = require("../Models/Users");

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
        // get all data required for analytics from DB

        const payments = await Payment.find({ status: "succeeded" });
        const users = await UsersModel.find({});
        const communities = await Community.find({});

        // build payments analytics
        // get filtered payments
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

        // build communities analytics
        // filter communities
        const paidCommunities = communities.filter(
            (c) => c.subscriptionFee > 0
        );
        const freeCommunities = communities.filter(
            (c) => c.subscriptionFee === 0
        );

        // build users analytics
        // filter users
        const adminRoles = users.filter((u) => u.role === "admin");
        const creatorRoles = users.filter((u) => u.role === "creator");
        const userRoles = users.filter((u) => u.role === "user");

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
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

module.exports = { Admin: router };
