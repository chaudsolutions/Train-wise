const express = require("express");
const UsersModel = require("../Models/Users");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Create Payment Intent
router.post("/create-payment-intent", async (req, res) => {
    const userId = req.userId;
    try {
        // Validate input
        const { amount, type } = req.body;
        if (!amount || isNaN(amount)) {
            return res.status(400).json("Invalid amount");
        }

        // Ensure user has stripeCustomerId
        const user = await UsersModel.findById(userId);
        if (!user) {
            return res.status(404).json("User not found");
        }
        if (!user.stripeCustomerId) {
            // Create customer if not exists
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: userId.toString() },
            });
            user.stripeCustomerId = customer.id;
            await user.save();
        }

        // Add this before creating payment intent
        if (user.stripeCustomerId) {
            await stripe.customers.update(user.stripeCustomerId, {
                metadata: {
                    ...user.stripeMetadata,
                    application: "Skillbay",
                },
                description: "Skillbay User",
            });
        }

        // Create Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: "usd",
            customer: user.stripeCustomerId, // Associate with Customer
            metadata: {
                userId: userId.toString(),
                purpose: type,
                application: "Skillbay",
            },
            payment_method_options: {
                card: {
                    request_three_d_secure: "any", // Recommended for compliance
                },
            },
            payment_method_types: ["card"],
            statement_descriptor_suffix: "Skillbay", // Appears on bank statements
            description: `Payment for ${type} on Skillbay`,
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
