const mongoose = require("mongoose");

const paymentDetailsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        methodType: {
            type: String,
            enum: ["bank", "paypal", "crypto", "other"],
            required: true,
        },
        // Bank Details
        bankName: { type: String },
        accountNumber: { type: String },
        accountName: { type: String },
        accountRouting: { type: String },
        // PayPal
        paypalEmail: { type: String },
        // Crypto
        cryptoWalletAddress: { type: String },
        cryptoType: { type: String },
        // Verification
        verified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("PaymentDetails", paymentDetailsSchema);
