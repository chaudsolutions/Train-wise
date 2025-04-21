const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Community = require("../Models/Community");
const UsersModel = require("../Models/Users");

const router = express.Router();

// Create Payment Intent
router.post("/create-payment-intent", async (req, res) => {
    const userId = req.userId;
    try {
        // Validate input
        const { amount } = req.body;
        if (!amount || isNaN(amount)) {
            return res.status(400).json("Invalid amount");
        }

        // Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            metadata: {
                userId: userId.toString(),
                purpose: "community_creation",
            },
        });

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Payment intent error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 1. Stripe Subscription Creation (Payment Flow)
router.post("/create-subscription", async (req, res) => {
    const { communityId } = req.body;
    const userId = req.userId;

    try {
        const user = await UsersModel.findById(userId);
        const community = await Community.findById(communityId);

        // Validate inputs
        if (!community || community.subscriptionFee <= 0) {
            return res.status(400).json("Invalid community");
        }

        // Check for existing subscription
        const existingSub = await Community.findOne({
            _id: communityId,
            "members.userId": userId,
            "members.status": "active",
        });
        if (existingSub) return res.status(400).json("Already subscribed");

        // Create Stripe customer if needed
        if (!user.stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { userId: user._id.toString() },
            });
            user.stripeCustomerId = customer.id;
            await user.save();
        }

        // Create or reuse price
        let priceId = community.stripePriceId;
        if (!priceId) {
            const product = await stripe.products.create({
                name: `${community.name} Membership`,
                metadata: { communityId: community._id.toString() },
            });

            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: community.subscriptionFee * 100,
                currency: "usd",
                recurring: { interval: "month" },
            });

            community.stripeProductId = product.id;
            community.stripePriceId = price.id;
            await community.save();
            priceId = price.id;
        }

        // Create a SetupIntent for payment method setup
        const setupIntent = await stripe.setupIntents.create({
            customer: user.stripeCustomerId,
            payment_method_types: ["card"],
            usage: "off_session", // For recurring payments
        });

        console.log("SetupIntent:", setupIntent);
        console.log("Client Secret:", setupIntent.client_secret);

        res.json({
            clientSecret: setupIntent.client_secret,
            priceId, // Return priceId for use in subscription creation
        });
    } catch (error) {
        console.error("Subscription error:", error);
        res.status(500).json({
            error: "Failed to create subscription",
            details: error.message,
        });
    }
});

// finalize subscription
router.post("/finalize-subscription", async (req, res) => {
    const { communityId, paymentMethodId } = req.body;
    const userId = req.userId;

    try {
        const user = await UsersModel.findById(userId);
        const community = await Community.findById(communityId);

        // Validate inputs
        if (!community || !user.stripeCustomerId) {
            return res
                .status(400)
                .json({ error: "Invalid community or customer" });
        }

        // Attach payment method to customer
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: user.stripeCustomerId,
        });

        // Set payment method as default for the customer
        await stripe.customers.update(user.stripeCustomerId, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });

        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: user.stripeCustomerId,
            items: [{ price: community.stripePriceId }],
            payment_behavior: "default_incomplete",
            payment_settings: {
                save_default_payment_method: "on_subscription",
            },
            expand: ["latest_invoice.payment_intent"], // For immediate confirmation
        });

        // Calculate current period end (30 days from now)
        const currentPeriodEnd = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        );

        // Update community members
        await Community.updateOne(
            { _id: communityId },
            {
                $push: {
                    members: {
                        userId,
                        stripeCustomerId: user.stripeCustomerId,
                        stripeSubscriptionId: subscription.id,
                        status: "active",
                        currentPeriodEnd,
                    },
                },
            }
        );

        res.json({
            subscriptionId: subscription.id,
            clientSecret:
                subscription.latest_invoice.payment_intent?.client_secret, // For immediate payment confirmation, if needed
        });
    } catch (error) {
        console.error("Subscription error:", error);
        res.status(500).json({
            error: "Failed to create subscription",
            details: error.message,
        });
    }
});

// endpoint to cancel subscription
router.post("/cancel-subscription/:communityId", async (req, res) => {
    try {
        const user = await UsersModel.findById(req.userId);
        const sub = user.activeSubscriptions.find(
            (s) => s.communityId.toString() === req.params.communityId
        );

        await stripe.subscriptions.del(sub.subscriptionId);

        res.json("Subscription canceled");
    } catch (error) {
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

router.post("/retry-payment/:subscriptionId", async (req, res) => {
    const subscription = await stripe.subscriptions.retrieve(
        req.params.subscriptionId
    );

    const paymentIntent = await stripe.paymentIntents.retrieve(
        subscription.latest_invoice.payment_intent
    );

    res.json({ clientSecret: paymentIntent.client_secret });
});

module.exports = { VerifyPayments: router };
