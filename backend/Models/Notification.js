const mongoose = require("mongoose");

const notificationsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: [true, "User ID is required"],
        },
        message: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

// Create the Notifications model
const Notification = mongoose.model(
    "Notification",
    notificationsSchema.index({ userId: 1, createdAt: -1 })
);

module.exports = Notification;
