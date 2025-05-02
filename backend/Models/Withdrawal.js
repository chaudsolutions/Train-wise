const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0.01,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "confirmed"],
            default: "pending",
        },
        adminNote: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
