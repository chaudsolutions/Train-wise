const express = require("express");
const Community = require("../Models/Community.js");

const router = express.Router();

// server get communities
router.get("/communities", async (req, res) => {
    try {
        //   get communities
        const communities = await Community.find({});

        if (!communities) return res.status(404).json("Community not found.");

        res.status(200).json(communities);
    } catch (error) {
        res.status(400).json("Communities not found.");
        console.error(error);
    }
});

// server get community by id
router.get("/communities/:id", async (req, res) => {
    const { id } = req.params;
    try {
        //   get community by id
        const community = await Community.findById(id);

        if (!community) return res.status(404).json("Community not found.");

        res.status(200).json(community);
    } catch (error) {
        res.status(400).json("Community not found.");
        console.error(error);
    }
});

module.exports = { Api: router };
