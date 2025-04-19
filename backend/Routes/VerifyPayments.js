const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

module.exports = { VerifyPayments: router };
