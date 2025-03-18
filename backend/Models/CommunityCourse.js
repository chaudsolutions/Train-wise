const mongoose = require("mongoose");

// define courses schema
const coursesSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        duration: { type: Number, required: true },
        videos: [],
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
            ref: "User",
            required: true,
        },
        courses: [coursesSchema],
    },
    {
        timestamps: true,
    }
);

// Create the Community Course model
const CommunityCourse = mongoose.model("CommunityCourse", communitySchema);

module.exports = CommunityCourse;
