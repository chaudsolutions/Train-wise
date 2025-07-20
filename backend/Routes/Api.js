const express = require("express");
const mongoose = require("mongoose");

const Community = require("../Models/Community.js");
const CommunityMessage = require("../Models/CommunityMessage.js");
const Category = require("../Models/Category.js");
const Settings = require("../Models/Settings.js");
const ErrorLog = require("../Models/ErrorLog.js");
const { verifyToken } = require("../utils/verifyJWT.js");
const CommunityCalendar = require("../Models/CommunityCalendar.js");

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

// endpoint to get random communities
router.get("/communities/random", async (req, res) => {
    try {
        //   get random communities
        const communities = await Community.aggregate([
            { $sample: { size: 5 } },
        ]);

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
        const community = await Community.findById(id)
            .populate("createdBy", "name avatar") // Populate creator name
            .populate("members.userId", "name avatar") // Populate member names and id
            .populate("reports.userId", "name avatar reason") // Populate member names and id
            .lean();

        if (!community) return res.status(404).json("Community not found.");

        // Send response with community
        res.status(200).json(community);
    } catch (error) {
        res.status(400).json("Community not found.");
        console.error(error);
    }
});

// server get all categories
router.get("/all-categories", async (req, res) => {
    try {
        //   get categories
        const categories = await Category.find({}).sort({ createdAt: -1 });

        if (!categories) return res.status(404).json("Categories not found.");

        res.status(200).json(categories);
    } catch (error) {
        res.status(400).json("Internal Server Error.");
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

        // Set up MongoDB change stream for CommunityMessage
        const changeStream = CommunityMessage.watch(
            [
                {
                    $match: {
                        "fullDocument.communityId": new mongoose.Types.ObjectId(
                            communityId
                        ),
                    },
                },
            ],
            { fullDocument: "updateLookup" }
        );

        changeStream.on("change", async (change) => {
            try {
                if (change.operationType === "update" && change.fullDocument) {
                    // Fetch the updated document with populated sender
                    const updatedDoc = await CommunityMessage.findOne({
                        communityId: new mongoose.Types.ObjectId(communityId),
                    }).populate("messages.sender", "name avatar");

                    if (!updatedDoc) {
                        console.error("Updated document not found");
                        return;
                    }

                    // Check for new messages
                    if (
                        updatedDoc.messages.length >
                        communityMessage.messages.length
                    ) {
                        const newMessages = updatedDoc.messages.slice(
                            communityMessage.messages.length
                        );
                        communityMessage = updatedDoc;
                        newMessages.forEach((message) => {
                            res.write(
                                `event: newMessage\ndata: ${JSON.stringify(
                                    message
                                )}\n\n`
                            );
                        });
                    }

                    // Check for deleted messages
                    if (
                        updatedDoc.messages.length <
                        communityMessage.messages.length
                    ) {
                        const oldMessageIds = communityMessage.messages.map(
                            (msg) => msg._id.toString()
                        );
                        const newMessageIds = updatedDoc.messages.map((msg) =>
                            msg._id.toString()
                        );
                        const deletedMessageIds = oldMessageIds.filter(
                            (id) => !newMessageIds.includes(id)
                        );

                        communityMessage = updatedDoc;
                        deletedMessageIds.forEach((messageId) => {
                            res.write(
                                `event: deleteMessage\ndata: ${JSON.stringify({
                                    _id: messageId,
                                })}\n\n`
                            );
                        });
                    }
                }
            } catch (error) {
                console.error("Change stream error:", error);
            }
        });

        changeStream.on("error", (error) => {
            console.error("Change stream failed:", error);
            changeStream.close();
            res.write(
                `event: error\ndata: ${JSON.stringify({
                    message: "Stream error",
                })}\n\n`
            );
        });

        // Poll for online status changes
        let lastOnlineUsers = JSON.stringify(getOnlineUsers());
        const onlineStatusPoll = setInterval(async () => {
            await community.populate(
                "members.userId",
                "name avatar onlineStatus"
            );
            const currentOnlineUsers = getOnlineUsers();
            const currentOnlineUsersStr = JSON.stringify(currentOnlineUsers);
            if (currentOnlineUsersStr !== lastOnlineUsers) {
                lastOnlineUsers = currentOnlineUsersStr;
                res.write(
                    `event: onlineUsers\ndata: ${JSON.stringify(
                        currentOnlineUsers
                    )}\n\n`
                );
            }
        }, 5000);

        // Handle client disconnect
        req.on("close", () => {
            changeStream.close();
            clearInterval(onlineStatusPoll);
            res.end();
            console.log("SSE client disconnected");
        });
    } catch (error) {
        console.error("SSE error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// SSE endpoint for real-time calendar event messages
router.get(
    "/community-calendar/:communityId/events/:eventId/stream/:userId",
    async (req, res) => {
        const { communityId, eventId, userId } = req.params;

        try {
            // Verify community exists and user has access
            const community = await Community.findById(communityId).populate(
                "members.userId",
                "name avatar onlineStatus"
            );

            if (!community) {
                return res.status(404).json("Community not found");
            }

            // Check if user is member or creator
            const isMember =
                community.members.some(
                    (member) =>
                        member.userId._id.toString() === userId.toString()
                ) || community.createdBy.toString() === userId.toString();

            if (!isMember) {
                return res.status(403).json("Not authorized");
            }

            // Set SSE headers
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            res.flushHeaders();

            // Find the calendar and specific event
            let calendar = await CommunityCalendar.findOne({
                communityId: community._id,
            }).populate(
                "events.memberId events.messages.sender",
                "name avatar"
            );

            if (!calendar) {
                calendar = new CommunityCalendar({
                    communityId: community._id,
                    events: [],
                });
                await calendar.save();
            }

            // Find or create the specific event
            let event = calendar.events.id(eventId);
            if (!event) {
                return res.status(404).json("Event not found");
            }

            // Function to get online users for this event
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
                    messages: event.messages,
                    onlineUsers: getOnlineUsers(),
                })}\n\n`
            );

            // Set up MongoDB change stream for CommunityCalendar
            const changeStream = CommunityCalendar.watch(
                [
                    {
                        $match: {
                            "fullDocument.communityId":
                                new mongoose.Types.ObjectId(communityId),
                            "fullDocument.events._id":
                                new mongoose.Types.ObjectId(eventId),
                        },
                    },
                ],
                { fullDocument: "updateLookup" }
            );

            changeStream.on("change", async (change) => {
                try {
                    if (
                        change.operationType === "update" &&
                        change.fullDocument
                    ) {
                        // Find the updated event
                        const updatedCalendar = await CommunityCalendar.findOne(
                            {
                                communityId: community._id,
                            }
                        ).populate(
                            "events.memberId events.messages.sender",
                            "name avatar"
                        );

                        if (!updatedCalendar) {
                            console.error("Updated calendar not found");
                            return;
                        }

                        const updatedEvent = updatedCalendar.events.id(eventId);
                        if (!updatedEvent) {
                            console.error(
                                "Event not found in updated calendar"
                            );
                            return;
                        }

                        // Check for new messages
                        if (
                            updatedEvent.messages.length > event.messages.length
                        ) {
                            const newMessages = updatedEvent.messages.slice(
                                event.messages.length
                            );
                            event = updatedEvent;
                            newMessages.forEach((message) => {
                                res.write(
                                    `event: newMessage\ndata: ${JSON.stringify(
                                        message
                                    )}\n\n`
                                );
                            });
                        }

                        // Check for deleted messages
                        if (
                            updatedEvent.messages.length < event.messages.length
                        ) {
                            const oldMessageIds = event.messages.map((msg) =>
                                msg._id.toString()
                            );
                            const newMessageIds = updatedEvent.messages.map(
                                (msg) => msg._id.toString()
                            );
                            const deletedMessageIds = oldMessageIds.filter(
                                (id) => !newMessageIds.includes(id)
                            );

                            event = updatedEvent;
                            deletedMessageIds.forEach((messageId) => {
                                res.write(
                                    `event: deleteMessage\ndata: ${JSON.stringify(
                                        {
                                            _id: messageId,
                                        }
                                    )}\n\n`
                                );
                            });
                        }

                        // Check for event status changes
                        if (updatedEvent.status !== event.status) {
                            res.write(
                                `event: statusChange\ndata: ${JSON.stringify({
                                    status: updatedEvent.status,
                                })}\n\n`
                            );
                            event.status = updatedEvent.status;
                        }
                    }
                } catch (error) {
                    console.error("Change stream error:", error);
                }
            });

            changeStream.on("error", (error) => {
                console.error("Change stream failed:", error);
                changeStream.close();
                res.write(
                    `event: error\ndata: ${JSON.stringify({
                        message: "Stream error",
                    })}\n\n`
                );
            });

            // Poll for online status changes
            let lastOnlineUsers = JSON.stringify(getOnlineUsers());
            const onlineStatusPoll = setInterval(async () => {
                await community.populate(
                    "members.userId",
                    "name avatar onlineStatus"
                );
                const currentOnlineUsers = getOnlineUsers();
                const currentOnlineUsersStr =
                    JSON.stringify(currentOnlineUsers);
                if (currentOnlineUsersStr !== lastOnlineUsers) {
                    lastOnlineUsers = currentOnlineUsersStr;
                    res.write(
                        `event: onlineUsers\ndata: ${JSON.stringify(
                            currentOnlineUsers
                        )}\n\n`
                    );
                }
            }, 5000);

            // Handle client disconnect
            req.on("close", () => {
                changeStream.close();
                clearInterval(onlineStatusPoll);
                res.end();
                console.log("SSE client disconnected");
            });
        } catch (error) {
            console.error("SSE error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Get current settings
router.get("/settings", async (req, res) => {
    try {
        const settings = await Settings.findOne().lean();

        if (!settings) {
            return res.status(404).json("Settings not found");
        }

        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json("Error fetching settings");
        console.log(error);
    }
});

router.post("/log-error", async (req, res) => {
    const {
        timestamp,
        userAgent,
        url,
        type,
        error,
        context,
        errorInfo,
        userToken,
        attempts,
    } = req.body;

    try {
        let userId = undefined;
        if (userToken) {
            const decoded = await verifyToken(userToken);
            userId = decoded._id;
        }

        await ErrorLog.create({
            timestamp: new Date(timestamp),
            userAgent,
            url,
            type,
            userId,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
            context: context || {},
            additionalInfo: errorInfo,
            attempts,
        });

        res.status(200).json("Error logged");
    } catch (error) {
        console.error("Failed to log error:", error);
        res.status(500).json("Failed to log error");
    }
});

router.patch("/update-log-error/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updatedLog = await ErrorLog.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        if (!updatedLog) {
            return res.status(404).json("Error log not found");
        }
        res.status(200).json("Status updated");
    } catch (error) {
        console.error("Failed to update error status:", error);
        res.status(500).json("Failed to update error status");
    }
});

module.exports = { Api: router };
