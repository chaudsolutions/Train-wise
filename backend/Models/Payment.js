const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    paymentId: { type: String, required: true, unique: true }, // Stripe payment intent ID
    amount: { type: Number, required: true }, // Amount in dollars
    currency: { type: String, required: true }, // e.g., 'usd'
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, // Who paid
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community" }, // Linked community (optional)
    paymentType: { type: String, required: true }, // e.g., 'community_creation'
    status: { type: String, required: true }, // e.g., 'succeeded', 'failed'
    createdAt: { type: Date, default: Date.now }, // Timestamp
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
