const express = require("express");
const UsersModel = require("../Models/Users");

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

module.exports = { User: router };
