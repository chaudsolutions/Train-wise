const express = require("express");
const UsersModel = require("../Models/Users");
const Community = require("../Models/Community");

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

// server route to verify community membership

router.get("/verify-membership/:communityId", async (req, res) => {
    try {
        const userId = req.userId;
        const { communityId } = req.params;

        // Retrieve the user's details from the database using the decoded user ID
        const user = await UsersModel.findById(userId);
        const community = await Community.findById(communityId);

        if (!user || !community) {
            return res.status(403).send("not found.");
        }

        // Check if the user is a member of the specified community
        const isMember = community.members.some(
            (community) => community.userId.toString() === user.id
        );

        // if isMember, check if user membership has not expired if its a paid community
        if (community.subscriptionFee > 0) {
            const currentTime = new Date();

            const isMembershipExpired = community.members.some(
                (community) =>
                    new Date(community.membershipExpiration) >=
                    new Date(currentTime)
            );

            if (isMembershipExpired) {
                return res.status(403).json("Membership has expired.");
            }
        }

        res.status(200).json({ isMember });
    } catch (error) {
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

module.exports = { User: router };
