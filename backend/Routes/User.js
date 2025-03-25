const express = require("express");
const UsersModel = require("../Models/Users");
const Community = require("../Models/Community");
const CommunityCourse = require("../Models/CommunityCourse");

const router = express.Router();

// Server route to fetch user details
router.get("/data", async (req, res) => {
    try {
        const userId = req.userId;
        // Retrieve the user's details from the database using the decoded user ID
        const user = await UsersModel.findById(userId).sort({ createdAt: -1 });

        if (!user) {
            return res.status(403).send("User not found.");
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

// endpoint to join community
router.post("/joinCommunity/:communityId", async (req, res) => {
    const userId = req.userId;
    const { communityId } = req.params;

    try {
        // find user
        const user = await UsersModel.findById(userId);
        // Retrieve the community details from the database using the community ID
        const community = await Community.findById(communityId);
        if (!community || !user) {
            return res.status(404).send("not found.");
        }

        // Check if user is already a member of the community
        const isMember =
            community.members.some(
                (community) => community.userId.toString() === user.id
            ) || community.createdBy.toString() === user.id;

        if (isMember) {
            return res.status(403).send("User already a member.");
        }

        // Add the user to the community members array
        community.members.push({
            userId: user._id,
            membership: true,
            membershipExpiration:
                community.subscriptionFee > 0
                    ? new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000) // Add 30 days
                    : null,
        });

        // Save the updated community details
        await community.save();

        res.status(200).json("Success");
    } catch (error) {
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

// server route to verify community membership
router.get("/verify-membership/:communityId", async (req, res) => {
    try {
        const userId = req.userId;
        const { communityId } = req.params;

        // Retrieve the user and community from the database
        const user = await UsersModel.findById(userId);
        const community = await Community.findById(communityId);

        if (!user || !community) {
            return res.status(403).send("User or community not found.");
        }

        // Check if the user is the creator of the community
        const isCreator = community.createdBy.toString() === user.id;

        // Find the user in the community members array
        const userMembership = community.members.find(
            (member) => member.userId.toString() === user.id
        );

        // Check if the user is a member and their membership is active
        let isMember = false;
        if (userMembership) {
            isMember = userMembership.membership === true;

            // For paid communities, check if the membership has expired
            if (community.subscriptionFee > 0) {
                const currentTime = new Date();
                const membershipExpiration = new Date(
                    userMembership.membershipExpiration
                );

                if (membershipExpiration < currentTime) {
                    isMember = false; // Membership has expired
                }
            }
        }

        // Return the membership status
        res.status(200).json(isMember || isCreator);
    } catch (error) {
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

// endpoint to get courses for community
router.get("/courses/community/:communityId", async (req, res) => {
    const userId = req.userId;
    try {
        const { communityId } = req.params;

        const community = await Community.findById(communityId);
        const user = await UsersModel.findById(userId);
        const coursesObj = await CommunityCourse.findOne({
            communityId: community.id,
        });

        if (!community) {
            return res.status(404).json("Community not found.");
        }
        if (!user) {
            return res.status(403).json("User not found.");
        }

        // Check if user is a member of the specified community
        const isMember = community.members.some(
            (member) => member.userId.toString() === user.id
        );
        // check if user might be creator of community
        const isCreator = community.createdBy.toString() === user.id;

        if (!isMember && !isCreator) {
            return res
                .status(403)
                .json("User not authorized to access this resource.");
        }

        res.status(200).json(coursesObj);
    } catch (error) {
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

// endpoint to get single course for community
router.get("/course/community/:communityId/:courseId", async (req, res) => {
    const userId = req.userId;
    const { communityId, courseId } = req.params;

    try {
        const community = await Community.findById(communityId);
        const user = await UsersModel.findById(userId);

        const CommunityCoursesObj = await CommunityCourse.findOne({
            communityId: community.id,
        });

        if (!community) {
            return res.status(404).json("Community not found.");
        }
        if (!user) {
            return res.status(403).json("User not found.");
        }

        // find course inside the community courses obj
        const course = CommunityCoursesObj.courses.find(
            (c) => c._id.toString() === courseId
        );

        if (!course) {
            return res.status(404).json("Course not found.");
        }

        res.status(200).json(course);
    } catch (error) {
        res.status(500).send("Internal server error.");
        console.log(error);
    }
});

// endpoint to mark a video as watched
router.put(
    "/community/:communityId/course/:courseId/:video",
    async (req, res) => {
        const userId = req.userId;
        const { communityId, courseId, video } = req.params;

        try {
            const community = await Community.findById(communityId);
            const user = await UsersModel.findById(userId);

            // Find the course in CommunityCourse
            const communityCourses = await CommunityCourse.findOne({
                communityId: community._id,
            });

            if (!communityCourses) {
                return res.status(404).json("Community courses not found.");
            }

            const courseExists = communityCourses.courses.some(
                (c) => c._id.toString() === courseId
            );

            if (!courseExists) {
                return res.status(404).json("Course not found.");
            }

            // Find or create the watched course entry
            let watchedCourse = user.coursesWatched.find(
                (c) => c.courseId.toString() === courseId
            );

            if (watchedCourse) {
                // Add video if not already watched
                if (!watchedCourse.videos.includes(video)) {
                    watchedCourse.videos.push(video);
                }
            } else {
                // Create new watched course entry
                user.coursesWatched.push({
                    courseId,
                    videos: [video],
                });
            }

            await user.save();

            res.status(200).json("Video marked as watched.");
        } catch (error) {
            res.status(500).send("Internal server error.");
            console.log(error);
        }
    }
);

module.exports = { User: router };
