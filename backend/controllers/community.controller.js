const Community = require("../Models/Community");
const CommunityCourse = require("../Models/CommunityCourse");
const { createNotification } = require("../utils/notifications");
const { deleteFromS3ByUrl } = require("../utils/s3bucket");

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
                                await deleteFromS3ByUrl(lesson.content);
                            }
                        })
                    );
                }
            );
            await Promise.all(deleteLessonVideos);

            // Now delete the community course
            await CommunityCourse.findByIdAndDelete(communityCourse._id);
        }

        await Promise.all([
            Community.findByIdAndDelete(communityId), // Delete community
            deleteFromS3ByUrl(community.logo),
            deleteFromS3ByUrl(community.bannerImage),
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

        res.status(200).json("Community deleted successfully");
    } catch (error) {
        console.error("Error deleting community:", error);
        res.status(500).json(error);
    }
};

module.exports = { deleteCommunity };
