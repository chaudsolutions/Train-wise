const mongoose = require("mongoose");

const coursesSchema = new mongoose.Schema(
    {
        name: { type: String },
        duration: { type: Number },
        summary: { type: String },
        lessons: [
            {
                type: { type: String },
                content: { type: String },
                summary: { type: String },
            },
        ],
    },
    { timestamps: true }
);

const communityCourseSchema = new mongoose.Schema(
    {
        communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
        courses: [coursesSchema],
    },
    { timestamps: true }
);

// Create the Community Course model
const CommunityCourse = mongoose.model(
    "CommunityCourse",
    communityCourseSchema
);

module.exports = CommunityCourse;
