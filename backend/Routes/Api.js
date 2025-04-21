const express = require("express");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Community = require("../Models/Community.js");
const UsersModel = require("../Models/Users.js");
const CommunityMessage = require("../Models/CommunityMessage.js");
const Category = require("../Models/Category.js");

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

// Stripe webhook endpoint
router.post(
    "/stripe-webhook",
    bodyParser.raw({ type: "application/json" }),
    async (req, res) => {
        const sig = req.headers["stripe-signature"];

        try {
            const event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );

            switch (event.type) {
                case "invoice.paid":
                    await handleInvoicePaid(event.data.object);
                    break;
                case "invoice.payment_failed":
                    await handlePaymentFailed(event.data.object);
                    break;
                case "customer.subscription.deleted":
                    await handleSubscriptionDeleted(event.data.object);
                    break;
            }

            res.json({ received: true });
        } catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }
);

async function handleInvoicePaid(invoice) {
    const subscription = invoice.subscription;
    const periodEnd = new Date(invoice.period_end * 1000);

    // Update user's subscription
    await UsersModel.updateOne(
        { "activeSubscriptions.subscriptionId": subscription },
        {
            $set: {
                "activeSubscriptions.$.currentPeriodEnd": periodEnd,
                "activeSubscriptions.$.status": "active",
            },
        }
    );

    // Update community membership
    await Community.updateOne(
        { "members.stripeSubscriptionId": subscription },
        {
            $set: {
                "members.$.currentPeriodEnd": periodEnd,
                "members.$.status": "active",
            },
        }
    );
}

async function handlePaymentFailed(invoice) {
    const subscription = invoice.subscription;

    await UsersModel.updateOne(
        { "activeSubscriptions.subscriptionId": subscription },
        { $set: { "activeSubscriptions.$.status": "past_due" } }
    );

    await Community.updateOne(
        { "members.stripeSubscriptionId": subscription },
        { $set: { "members.$.status": "past_due" } }
    );
}

async function handleSubscriptionDeleted(subscription) {
    await UsersModel.updateOne(
        { "activeSubscriptions.subscriptionId": subscription.id },
        { $set: { "activeSubscriptions.$.status": "canceled" } }
    );

    await Community.updateOne(
        { "members.stripeSubscriptionId": subscription.id },
        { $set: { "members.$.status": "canceled" } }
    );
}

module.exports = { Api: router };
