const mongoose = require("mongoose");

// Define the Community Schema
const communitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Community name is required"],
            trim: true,
            unique: true, // Ensure community names are unique
            maxlength: [50, "Community name cannot exceed 50 characters"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        rules: {
            type: [String], // Array of strings for rules
            required: [true, "At least one rule is required"],
            validate: {
                validator: (rules) => rules.length === 3, // Ensure exactly 3 rules
                message: "Exactly 3 rules are required",
            },
        },
        visions: {
            type: [String], // Array of strings for visions
            required: [true, "At least one vision is required"],
            validate: {
                validator: (visions) => visions.length === 3, // Ensure exactly 3 visions
                message: "Exactly 3 visions are required",
            },
        },
        bannerImage: {
            type: String, // Store the file path or URL
            required: [true, "Banner image is required"],
        },
        logo: {
            type: String, // Store the file path or URL
            required: [true, "Logo is required"],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the User model (if you have one)
            required: [true, "Creator ID is required"],
        },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
    }
);

// Create the Community model
const Community = mongoose.model("Community", communitySchema);

module.exports = Community;
