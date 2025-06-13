const mongoose = require("mongoose");

const errorLogSchema = new mongoose.Schema(
    {
        timestamp: { type: Date },
        userAgent: { type: String },
        url: { type: String },
        type: { type: String },
        attempts: { type: Number },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the User model (if you have one)
        },
        error: {
            name: String,
            message: String,
            stack: String,
        },
        context: {
            // Flexible structure for contextual data
            action: String,
            component: String,
            customData: mongoose.Schema.Types.Mixed,
        },
        additionalInfo: mongoose.Schema.Types.Mixed,
        status: {
            type: String,
            enum: ["fixed", "pending", "ignored"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
).index({
    name: 1,
    type: 1,
    createdAt: -1,
    "context.userId": 1,
});

const ErrorLog = mongoose.model("ErrorLog", errorLogSchema);

module.exports = ErrorLog;
