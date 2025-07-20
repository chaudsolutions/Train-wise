const mongoose = require("mongoose");

const eventsSchema = new mongoose.Schema(
    {
        start: { type: Date, required: true },
        memberId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "closed"],
        },
        messages: [
            {
                sender: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                content: {
                    type: String,
                    required: true,
                    trim: true,
                    maxlength: 2000,
                },
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

const communityCalendarSchema = new mongoose.Schema(
    {
        communityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
            required: true,
        },
        events: [eventsSchema],
    },
    { timestamps: true }
);

module.exports = mongoose.model("CommunityCalendar", communityCalendarSchema);
