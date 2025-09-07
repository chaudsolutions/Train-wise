const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Community = require("../Models/Community");
const UsersModel = require("../Models/Users");
const CommunityCourse = require("../Models/CommunityCourse");
const CommunityMessage = require("../Models/CommunityMessage");
const Payment = require("../Models/Payment");
const { createNotification } = require("../utils/notifications");
const { createCourse } = require("../controllers/course.controller");
const Settings = require("../Models/Settings");
const CommunityCalendar = require("../Models/CommunityCalendar");
const {
    upload,
    uploadToS3,
    deleteFromS3ByUrl,
    getFileSizeFromS3,
} = require("../utils/s3bucket");

const router = express.Router();

// Endpoint to create a community
router.post(
    "/create-community",
    upload.fields([
        { name: "bannerImage", maxCount: 1 },
        { name: "logo", maxCount: 1 },
    ]),
    async (req, res) => {
        const userId = req.userId;
        // Extract fields from the request body
        const {
            name,
            description,
            subscriptionFee,
            category,
            rules,
            visions,
            paymentId,
        } = req.body;

        const bannerImage = req.files["bannerImage"]?.[0];
        const logo = req.files["logo"]?.[0];

        // Validate required fields
        if (
            !name ||
            !description ||
            !subscriptionFee ||
            !category ||
            !rules ||
            !visions
        ) {
            return res.status(400).json("All fields are required");
        }

        if (!bannerImage || !logo) {
            return res.status(400).json("Banner image and logo are required");
        }

        try {
            // Find user
            const creator = await UsersModel.findById(userId);
            if (!creator) {
                return res.status(404).json("User not found");
            }

            const settings = await Settings.findOne().lean();

            // Check payment or role
            if (!paymentId) {
                // If no paymentId, community fee must be free or user must be admin or creator
                if (
                    creator.role === "user" &&
                    parseInt(settings.communityCreationFee) > 0
                ) {
                    return res
                        .status(403)
                        .json("Payment required for regular users");
                }
            } else {
                // If paymentId is provided, verify payment
                const paymentIntent = await stripe.paymentIntents.retrieve(
                    paymentId
                );
                if (
                    paymentIntent.status !== "succeeded" ||
                    paymentIntent.amount !==
                        parseInt(settings.communityCreationFee)
                ) {
                    return res
                        .status(400)
                        .json("Invalid or unverified payment");
                }
            }

            // Upload banner image to S3 Bucket
            const bannerImageBuffer = bannerImage.buffer;
            const bannerImageName = bannerImage.originalname;
            const bannerImageResult = await uploadToS3(
                bannerImageBuffer,
                bannerImageName,
                "image"
            );

            // Upload logo to S3 Bucket
            const logoBuffer = logo.buffer;
            const logoName = logo.originalname;
            const logoResult = await uploadToS3(logoBuffer, logoName, "image");

            // Create the community
            const communityData = {
                name,
                description,
                rules,
                visions,
                subscriptionFee: parseFloat(subscriptionFee),
                category,
                bannerImage: bannerImageResult.url,
                logo: logoResult.url,
                createdBy: creator._id,
                creatorName: creator.name,
                canExplore: true,
            };
            if (paymentId) {
                communityData.paymentId = paymentId;
                // add 1yr to date
                const currentDate = new Date();
                currentDate.setFullYear(currentDate.getFullYear() + 1);
                communityData.renewalDate = currentDate;
            }

            const community = await Community.create(communityData);

            // If payment was made, store payment details
            if (paymentId) {
                const paymentIntent = await stripe.paymentIntents.retrieve(
                    paymentId
                );

                await Promise.all([
                    Payment.create({
                        paymentId,
                        amount: paymentIntent.amount / 100, // Convert cents to dollars
                        currency: paymentIntent.currency,
                        userId,
                        communityId: community._id,
                        paymentType: "community_creation",
                        status: paymentIntent.status,
                        subscriptionPeriod: "yearly",
                    }),
                    // Notify payment success
                    createNotification(
                        userId,
                        `Payment of $${
                            paymentIntent.amount / 100
                        } for community ${name} creation succeeded`
                    ),
                ]);
            }

            await Promise.all([
                // Create community course object
                CommunityCourse.create({
                    communityId: community._id,
                    courses: [],
                }),
                // Create community messages object
                CommunityMessage.create({
                    communityId: community._id,
                    messages: [],
                }),
                // Notify community creation
                createNotification(
                    userId,
                    `You Created the community "${name}"`
                ),
            ]);

            res.status(200).json(community);
        } catch (error) {
            console.error("Error creating community:", error);
            res.status(500).json(error);
        }
    }
);

// endpoint to create a community course
router.post(
    "/createCourse/:communityId",
    upload.any(), // Handle multipart/form-data
    createCourse
);

// endpoint to withdraw community balance
router.put("/withdraw/:communityId", async (req, res) => {
    try {
        const { communityId } = req.params;
        const userId = req.userId; // From auth middleware

        // 1. Verify community ownership
        const community = await Community.findOne({
            _id: communityId,
            createdBy: userId,
        });

        if (!community) {
            return res.status(403).json("You don't own this community");
        }

        // 2. Check available balance
        if (community.balance <= 0) {
            return res.status(400).json("No balance available for withdrawal");
        }

        const withdrawalAmount = community.balance;

        // 3. Update balances
        await Promise.all([
            Community.updateOne({ _id: communityId }, { $set: { balance: 0 } }),
            UsersModel.findByIdAndUpdate(userId, {
                $inc: { balance: withdrawalAmount },
            }),
        ]);

        // 4. Create notification using your hook
        await createNotification(
            userId,
            `You've successfully withdrawn $${withdrawalAmount.toFixed(
                2
            )} from ${community.name}`
        );

        res.status(200).json(`Successful`);
    } catch (error) {
        console.error("Withdrawal error:", error);
        res.status(500).json("Withdrawal failed");
    }
});

// Endpoint to delete a community message
router.delete("/:communityId/delete-message/:messageId", async (req, res) => {
    const { communityId, messageId } = req.params;
    try {
        // Find the CommunityMessage document for the community
        const communityMessage = await CommunityMessage.findOne({
            communityId,
        });

        if (!communityMessage) {
            return res.status(404).json("Community messages not found");
        }

        // Check if the message exists
        const messageExists = communityMessage.messages.some(
            (msg) => msg._id.toString() === messageId
        );
        if (!messageExists) {
            return res.status(404).json("Message not found");
        }

        // Delete the message using $pull
        const result = await CommunityMessage.updateOne(
            { communityId },
            { $pull: { messages: { _id: messageId } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(500).json("Failed to delete message");
        }

        res.status(200).json("Message deleted successfully");
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json("Failed to delete message");
    }
});

// endpoint to search for a community member
router.put("/search-member/:communityId", async (req, res) => {
    try {
        const { communityId } = req.params;
        const { email } = req.body;

        // find community
        const community = await Community.findById(communityId);

        if (!community) {
            return res.status(404).json("Community not found");
        }

        // find user
        const user = await UsersModel.findOne({ email })
            .select("id name email avatar")
            .lean();

        if (!user) {
            return res.status(404).json("User doesn't exist");
        }

        const isCreator = community.createdBy.toString() === user.id;

        if (isCreator) {
            return res
                .status(403)
                .json(
                    "You cannot add yourself as a member of your own community"
                );
        }

        // check if user exists in community
        const isMember = community.members.some(
            (member) => member.userId.toString() === user.id
        );

        if (isMember) {
            return res
                .status(403)
                .json("User is already a member of this community");
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error searching for members:", error);
        res.status(500).json("Failed to search for members");
    }
});

// endpoint to add a member to the community
router.put("/add-member/:communityId", async (req, res) => {
    try {
        const { communityId } = req.params;
        const { userId } = req.body;

        // find community
        const community = await Community.findById(communityId);

        if (!community) {
            return res.status(404).json("Community not found");
        }

        // find user
        const user = await UsersModel.findById(userId);

        if (!user) {
            return res.status(404).json("User doesn't exist");
        }

        const isCreator = community.createdBy.toString() === user.id;

        if (isCreator) {
            return res
                .status(403)
                .json(
                    "You cannot add yourself as a member of your own community"
                );
        }

        // check if user exists in community
        const isMember = community.members.some(
            (member) => member.userId.toString() === user.id
        );

        if (isMember) {
            return res
                .status(403)
                .json("User is already a member of this community");
        }

        // add user to community
        community.members.push({
            userId: user.id,
            status: "active",
            currentPeriodEnd:
                community.subscriptionFee === 0
                    ? null
                    : Date.now() + 1000 * 60 * 60 * 24 * 30,
            subscriptionPeriod:
                community.subscriptionFee === 0 ? null : "monthly",
        });

        await Promise.all([
            community.save(),
            createNotification(
                community.createdBy,
                `You have added ${user.name} to your community ${community.name}`
            ),
            createNotification(
                user.id,
                `You have been added to the community ${community.name} by the creator`
            ),
        ]);

        res.status(200).json("Member added successfully");
    } catch (error) {
        console.error("Error adding member:", error);
        res.status(500).json("Failed to add member");
    }
});

// endpoint to verify storage payment and add storage to community
router.put("/storage-upgrade/:communityId", async (req, res) => {
    try {
        const { communityId } = req.params;
        const { storage, price, paymentId } = req.body;

        if (!paymentId) {
            return res.status(400).json("Payment is required");
        }

        // If paymentId is provided, verify payment
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

        if (
            paymentIntent.status !== "succeeded" ||
            paymentIntent.amount !== parseInt(price)
        ) {
            return res.status(400).json("Invalid or unverified payment");
        }

        // find community
        const community = await Community.findById(communityId);

        if (!community) {
            return res.status(404).json("Community not found");
        }

        const [creator, admin] = await Promise.all([
            UsersModel.findById(community.createdBy),
            UsersModel.findOne({ role: "admin" }),
        ]);

        if (!creator) {
            return res.status(404).json("creator doesn't exist");
        }

        // add new storage to community storage
        community.cloudStorageLimit += storage;

        await Promise.all([
            community.save(),
            createNotification(
                community.createdBy,
                `You have upgraded your community ${community.name} storage to ${community.cloudStorageLimit}GB`
            ),
            createNotification(
                admin.id,
                `${community.name} creator, ${creator.name} have upgraded their community storage to ${community.cloudStorageLimit}GB`
            ),
        ]);

        res.status(200).json("Storage upgraded successfully");
    } catch (error) {
        console.error("Error searching for members:", error);
        res.status(500).json("Failed to search for members");
    }
});

// endpoint to update event status
router.put("/community-calendar/events/:eventId/status", async (req, res) => {
    try {
        const { status } = req.body;
        const eventId = req.params.eventId;

        const calendar = await CommunityCalendar.findOne({
            "events._id": eventId,
        });

        if (!calendar) {
            return res.status(404).json("Calendar not found");
        }

        const event = calendar.events.id(eventId);
        event.status = status;
        await calendar.save();

        res.status(200).json(event);
    } catch (error) {
        console.error("Error updating event status:", error);
        res.status(500).json("Failed to update event status");
    }
});

// Delete entire course
router.delete("/community-course/:communityId/:courseId", async (req, res) => {
    try {
        const { communityId, courseId } = req.params;
        const userId = req.userId;

        const user = await UsersModel.findById(userId);
        if (!user) {
            return res.status(404).json("User not found");
        }

        // Verify user is the community creator
        const community = await Community.findById(communityId);

        if (!community || community.createdBy.toString() !== user.id) {
            return res.status(403).json("Unauthorized to delete course");
        }

        // Find the course to get file URLs before deletion
        const communityCourse = await CommunityCourse.findOne({ communityId });
        if (!communityCourse) {
            return res.status(404).json("Course not found");
        }

        const course = communityCourse.courses.id(courseId);
        if (!course) {
            return res.status(404).json("Course not found");
        }

        // Collect all S3 files to delete
        const filesToDelete = [];
        let totalSizeToFree = 0;

        // Add course summary PDF if exists
        if (course.summaryPdfUrl) {
            filesToDelete.push(course.summaryPdfUrl);
            const size = await getFileSizeFromS3(course.summaryPdfUrl);
            totalSizeToFree += size;
        }

        // Add lesson files
        for (const lesson of course.lessons) {
            if (lesson.type === "video" || lesson.type === "pdf") {
                filesToDelete.push(lesson.content);
                const size = await getFileSizeFromS3(lesson.content);
                totalSizeToFree += size;
            }
            if (lesson.summaryPdfUrl) {
                filesToDelete.push(lesson.summaryPdfUrl);
                const size = await getFileSizeFromS3(lesson.summaryPdfUrl);
                totalSizeToFree += size;
            }
        }

        console.log(`Total storage to free: ${totalSizeToFree.toFixed(4)} GB`);

        // Delete files from S3
        try {
            await Promise.all(
                filesToDelete.map((url) => deleteFromS3ByUrl(url))
            );
            console.log(`Deleted ${filesToDelete.length} files from S3`);
        } catch (s3Error) {
            console.error("Error deleting files from S3:", s3Error);
            // Continue with course deletion even if S3 deletion fails
        }

        // Remove the course from the database
        await CommunityCourse.findOneAndUpdate(
            { communityId },
            { $pull: { courses: { _id: courseId } } }
        );

        // Update community storage usage
        if (totalSizeToFree > 0) {
            const newStorageUsed = Math.max(
                0,
                community.cloudStorageUsed - totalSizeToFree
            );
            await Community.findByIdAndUpdate(communityId, {
                cloudStorageUsed: parseFloat(newStorageUsed.toFixed(4)),
            });
            console.log(
                `Updated community storage: Freed ${totalSizeToFree.toFixed(
                    4
                )} GB`
            );
        }

        res.status(200).json("Course deleted successfully");
    } catch (error) {
        console.error("Error deleting course", error);
        res.status(500).json("Failed to delete course");
    }
});

// Delete specific lesson from course
router.delete(
    "/community-course/:communityId/:courseId/lesson/:lessonIndex",
    async (req, res) => {
        try {
            const { communityId, courseId, lessonIndex } = req.params;
            const userId = req.userId;
            const index = parseInt(lessonIndex);

            const user = await UsersModel.findById(userId);
            if (!user) {
                return res.status(404).json("User not found");
            }
            // Verify user is the community creator
            const community = await Community.findById(communityId);

            if (!community || community.createdBy.toString() !== user.id) {
                return res.status(403).json("Unauthorized to delete lesson");
            }

            // Find the course
            const communityCourse = await CommunityCourse.findOne({
                communityId,
            });
            if (!communityCourse) {
                return res.status(404).json("Course not found");
            }

            const course = communityCourse.courses.id(courseId);
            if (!course) {
                return res.status(404).json("Course not found");
            }

            if (index < 0 || index >= course.lessons.length) {
                return res.status(400).json("Invalid lesson index");
            }

            const lesson = course.lessons[index];

            // Collect S3 files to delete for this lesson
            const filesToDelete = [];
            let totalSizeToFree = 0;

            if (lesson.type === "video" || lesson.type === "pdf") {
                filesToDelete.push(lesson.content);
                const size = await getFileSizeFromS3(lesson.content);
                totalSizeToFree += size;
            }
            if (lesson.summaryPdfUrl) {
                filesToDelete.push(lesson.summaryPdfUrl);
                const size = await getFileSizeFromS3(lesson.summaryPdfUrl);
                totalSizeToFree += size;
            }

            console.log(
                `Storage to free from lesson: ${totalSizeToFree.toFixed(4)} GB`
            );

            // Delete files from S3
            try {
                await Promise.all(
                    filesToDelete.map((url) => deleteFromS3ByUrl(url))
                );
                console.log(
                    `Deleted ${filesToDelete.length} lesson files from S3`
                );
            } catch (s3Error) {
                console.error("Error deleting lesson files from S3:", s3Error);
                // Continue with lesson deletion even if S3 deletion fails
            }

            // Remove the lesson from the array
            course.lessons.splice(index, 1);

            await communityCourse.save();

            // Update community storage usage
            if (totalSizeToFree > 0) {
                const newStorageUsed = Math.max(
                    0,
                    community.cloudStorageUsed - totalSizeToFree
                );
                await Community.findByIdAndUpdate(communityId, {
                    cloudStorageUsed: parseFloat(newStorageUsed.toFixed(4)),
                });
                console.log(
                    `Updated community storage: Freed ${totalSizeToFree.toFixed(
                        4
                    )} GB`
                );
            }

            res.status(200).json("Lesson deleted successfully");
        } catch (error) {
            console.error("Error deleting lesson", error);
            res.status(500).json("Failed to delete lesson");
        }
    }
);

// Update course summary
router.put(
    "/community-course/:communityId/:courseId/summary",
    upload.single("summaryPdf"),
    async (req, res) => {
        try {
            const { communityId, courseId } = req.params;
            const userId = req.userId;
            const summaryPdf = req.file;
            const body = req.body;

            console.log(body);

            const user = await UsersModel.findById(userId);
            if (!user) {
                return res.status(404).json("User not found");
            }

            // Verify user is the community creator
            const community = await Community.findById(communityId);
            if (!community || community.createdBy.toString() !== user.id) {
                return res.status(403).json("Unauthorized to update course");
            }

            const communityCourse = await CommunityCourse.findOne({
                communityId,
            });
            if (!communityCourse) {
                return res.status(404).json("Course not found");
            }

            const course = communityCourse.courses.id(courseId);
            if (!course) {
                return res.status(404).json("Course not found");
            }

            // Handle text summary
            if (body.summaryText) {
                course.summary = body.summaryText;
                course.summaryPdfUrl = null; // Remove PDF if switching to text
            }

            // Handle PDF summary
            if (summaryPdf) {
                const result = await uploadToS3(
                    summaryPdf.buffer,
                    summaryPdf.originalname,
                    summaryPdf.mimetype
                );
                course.summaryPdfUrl = result.url;
                course.summary = null; // Remove text if switching to PDF
            }

            await communityCourse.save();
            res.status(200).json("Course summary updated successfully");
        } catch (error) {
            console.error("Error updating course summary", error);
            res.status(500).json("Failed to update course summary");
        }
    }
);

// Add new lesson at specific position
router.post(
    "/community-course/:communityId/:courseId/lesson",
    upload.fields([
        { name: "lessonVideo", maxCount: 1 },
        { name: "lessonPdf", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const { communityId, courseId } = req.params;
            const userId = req.userId;
            const files = req.files;
            const body = req.body;

            const user = await UsersModel.findById(userId);
            if (!user) {
                return res.status(404).json("User not found");
            }

            // Verify user is the community creator
            const community = await Community.findById(communityId);
            if (!community || community.createdBy.toString() !== user.id) {
                return res.status(403).json("Unauthorized to add lesson");
            }

            const communityCourse = await CommunityCourse.findOne({
                communityId,
            });
            if (!communityCourse) {
                return res.status(404).json("Course not found");
            }

            const course = communityCourse.courses.id(courseId);
            if (!course) {
                return res.status(404).json("Course not found");
            }

            const lessonIndex = parseInt(body.lessonIndex);
            const newLesson = {
                type: body.lessonType,
                summary: body.lessonSummary || null,
            };

            // Handle different lesson types
            if (body.lessonType === "youtube") {
                newLesson.content = body.lessonUrl;
            } else if (body.lessonType === "video" && files.lessonVideo) {
                const videoFile = files.lessonVideo[0];
                const result = await uploadToS3(
                    videoFile.buffer,
                    videoFile.originalname,
                    videoFile.mimetype
                );
                newLesson.content = result.url;
            } else if (body.lessonType === "pdf" && files.lessonPdf) {
                const pdfFile = files.lessonPdf[0];
                const result = await uploadToS3(
                    pdfFile.buffer,
                    pdfFile.originalname,
                    pdfFile.mimetype
                );
                newLesson.content = result.url;
            } else {
                return res.status(400).json("Invalid lesson data");
            }

            // Insert lesson at specified position
            course.lessons.splice(lessonIndex, 0, newLesson);
            await communityCourse.save();

            res.status(201).json("Lesson added successfully");
        } catch (error) {
            console.error("Error adding lesson", error);
            res.status(500).json("Failed to add lesson");
        }
    }
);

module.exports = { Creator: router };
