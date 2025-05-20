const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
    {
        communityCreationFee: {
            type: Number,
            required: true,
            min: 0,
        },
        withdrawalLimit: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
