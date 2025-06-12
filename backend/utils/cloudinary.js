const cloudinary = require("cloudinary").v2;

// Helper function to delete Cloudinary image
const deleteCloudinaryImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Error deleting Cloudinary image:", error);
    }
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicId = (url) => {
    if (!url) return null;
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    return filename.split(".")[0];
};

module.exports = {
    deleteCloudinaryImage,
    extractPublicId,
};
