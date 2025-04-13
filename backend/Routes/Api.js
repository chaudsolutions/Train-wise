const express = require("express");

const Community = require("../Models/Community.js");
const UsersModel = require("../Models/Users.js");
const CommunityMessage = require("../Models/CommunityMessage.js");

const router = express.Router();

// server get communities
router.get("/communities", async (req, res) => {
    try {
        //   get communities
        const communities = await Community.find({}).sort({ createdAt: -1 });

        if (!communities) return res.status(404).json("Community not found.");

        res.status(200).json(communities);
    } catch (error) {
        res.status(400).json("Communities not found.");
        console.error(error);
    }
});

// server get community by id
router.get("/community/:id", async (req, res) => {
    const { id } = req.params;
    try {
        //   get community by id
        const community = await Community.findById(id);

        if (!community) return res.status(404).json("Community not found.");

        // find creator name
        const creator = await UsersModel.findById(community.createdBy);

        // Send response with community and creator name
        res.status(200).json({
            community,
            creatorName: creator.name,
        });
    } catch (error) {
        res.status(400).json("Community not found.");
        console.error(error);
    }
});

// SSE endpoint for real-time messages
router.get("/communities/:communityId/messages/stream", async (req, res) => {
    const { communityId } = req.params;

    try {
        const community = await Community.findById(communityId).populate(
            "members.userId",
            "name avatar onlineStatus"
        );

        if (!community) {
            return res.status(404).json("Community not found");
        }

        // Set SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        // Find or create community message document
        let communityMessage = await CommunityMessage.findOne({
            communityId: community._id,
        }).populate("messages.sender", "name avatar");

        if (!communityMessage) {
            communityMessage = new CommunityMessage({
                communityId: community._id,
                messages: [],
            });
            await communityMessage.save();
        }

        // Function to get online users
        const getOnlineUsers = () => {
            return community.members
                .filter((member) => member.userId?.onlineStatus)
                .map((member) => ({
                    id: member.userId._id,
                    name: member.userId.name,
                    avatar: member.userId.avatar,
                }));
        };

        // Send initial data (messages + online users)
        res.write(
            `event: initial\ndata: ${JSON.stringify({
                messages: communityMessage.messages,
                onlineUsers: getOnlineUsers(),
            })}\n\n`
        );

        // Watch for changes (using polling)
        const pollInterval = setInterval(async () => {
            // Check for new messages
            const updatedMessages = await CommunityMessage.findOne({
                communityId: community._id,
            }).populate("messages.sender", "name avatar");

            if (
                updatedMessages.messages.length >
                communityMessage.messages.length
            ) {
                const newMessages = updatedMessages.messages.slice(
                    communityMessage.messages.length
                );
                communityMessage = updatedMessages;
                newMessages.forEach((message) => {
                    res.write(
                        `event: newMessage\ndata: ${JSON.stringify(
                            message
                        )}\n\n`
                    );
                });
            }

            // Check for online status changes
            await community.populate(
                "members.userId",
                "name avatar onlineStatus"
            );
            const currentOnlineUsers = getOnlineUsers();
            if (
                JSON.stringify(currentOnlineUsers) !==
                JSON.stringify(getOnlineUsers())
            ) {
                res.write(
                    `event: onlineUsers\ndata: ${JSON.stringify(
                        currentOnlineUsers
                    )}\n\n`
                );
            }
        }, 1000); // Poll every second

        // Handle client disconnect
        req.on("close", () => {
            clearInterval(pollInterval);
            res.end();
        });
    } catch (error) {
        console.error("SSE error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = { Api: router };
