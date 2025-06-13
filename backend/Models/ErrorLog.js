const mongoose = require("mongoose");

const errorLogSchema = new mongoose.Schema(
    {
        timestamp: Date,
        userAgent: String,
        url: String,
        type: String,
        attempts: Number,
        userId: mongoose.Schema.Types.ObjectId,
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
