const mongoose = require("mongoose");

// define messages schema
const messagesSchema = new mongoose.Schema(
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
    },
    {
        timestamps: true,
    }
);

// Define the Community Course Schema
const communitySchema = new mongoose.Schema(
    {
        communityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
            required: true,
        },
        messages: [messagesSchema],
    },
    {
        timestamps: true,
    }
);

// Indexes for faster querying
communitySchema.index({ communityId: 1, createdAt: -1 }); // For fetching community messages
communitySchema.index({ sender: 1 }); // For finding user's messages

const CommunityMessage = mongoose.model("CommunityMessage", communitySchema);

module.exports = CommunityMessage;
