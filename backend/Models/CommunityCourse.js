const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
    {
        type: { type: String },
        content: { type: String },
        summary: { type: String },
        summaryPdfUrl: { type: String }, // Add this field for lesson PDF summaries
    },
    { timestamps: true }
);

const courseSchema = new mongoose.Schema(
    {
        name: { type: String },
        duration: { type: Number },
        summary: { type: String },
        summaryPdfUrl: { type: String }, // Add this field for course PDF summary
        lessons: [lessonSchema],
    },
    { timestamps: true }
);

const communityCourseSchema = new mongoose.Schema(
    {
        communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
        courses: [courseSchema],
    },
    { timestamps: true }
);

// Create the Community Course model
const CommunityCourse = mongoose.model(
    "CommunityCourse",
    communityCourseSchema
);

module.exports = CommunityCourse;
