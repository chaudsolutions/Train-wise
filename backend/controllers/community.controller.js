const Community = require("../Models/Community");
const CommunityCourse = require("../Models/CommunityCourse");
const {
    extractPublicId,
    deleteCloudinaryImage,
} = require("../utils/cloudinary");
const { createNotification } = require("../utils/notifications");

const deleteCommunity = async (req, res) => {
    const { communityId } = req.params;
    const adminId = req.userId;

    try {
        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json("Community not found");
        }

        // Find and delete related community courses
        const communityCourse = await CommunityCourse.findOne({ communityId });
        if (communityCourse) {
            // Delete lesson videos first
            const deleteLessonVideos = communityCourse.courses.map(
                async (course) => {
                    const lessons = course.lessons || []; // Fallback to empty array if undefined
                    return Promise.all(
                        lessons.map(async (lesson) => {
                            if (lesson.type === "video") {
                                const publicId = extractPublicId(
                                    lesson.content
                                );
                                if (publicId) {
                                    await deleteCloudinaryImage(publicId);
                                }
                            }
                        })
                    );
                }
            );
            await Promise.all(deleteLessonVideos);

            // Now delete the community course
            await CommunityCourse.findByIdAndDelete(communityCourse._id);
        }

        const logoId = extractPublicId(community.logo);
        const bannerImage = extractPublicId(community.bannerImage);

        await Promise.all([
            Community.findByIdAndDelete(communityId), // Delete community
            deleteCloudinaryImage(logoId),
            deleteCloudinaryImage(bannerImage),
            // Notify creator
            createNotification(
                community.createdBy,
                `Your community "${community.name}" was deleted by an admin`
            ),

            // Notify admin
            createNotification(
                adminId,
                `You deleted the community "${community.name}"`
            ),
        ]);

        res.status(200).json({ message: "Community deleted successfully" });
    } catch (error) {
        console.error("Error deleting community:", error.message, error.stack);
        res.status(500).json({
            message: "Failed to delete community",
            error: error.message,
        });
    }
};

module.exports = { deleteCommunity };
