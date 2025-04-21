const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        icon: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

// Create the Category model
const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
