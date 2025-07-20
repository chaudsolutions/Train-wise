const pdf = require("pdf-parse");
const { uploadToCloudinary } = require("../utils/uploadMedia");
const UsersModel = require("../Models/Users");
const CommunityCourse = require("../Models/CommunityCourse");
const Community = require("../Models/Community");
const { deleteCloudinaryImage } = require("../utils/cloudinary");

const createCourse = async (req, res) => {
    try {
        const userId = req.userId;
        const { communityId } = req.params;
        const files = req.files;
        const body = req.body;

        // Validate permissions
        const user = await UsersModel.findById(userId);
        const community = await Community.findById(communityId);
        if (!community || community.createdBy.toString() !== user.id) {
            return res.status(403).json("Unauthorized to create course");
        }

        // Parse PDF from buffer
        const parsePDFBuffer = async (buffer) => {
            try {
                const data = await pdf(buffer);
                return data.text;
            } catch (error) {
                console.error("PDF parsing failed:", error);
                throw new Error("Failed to extract text from PDF");
            }
        };

        // Process course summary
        let summary;
        const summaryPdfFile = files.find((f) => f.fieldname === "summaryPdf");
        if (summaryPdfFile) {
            summary = await parsePDFBuffer(summaryPdfFile.buffer);
        } else if (body.summaryText) {
            summary = body.summaryText;
        }

        // Process lessons
        const lessonCount = parseInt(body.lessonCount);
        let lessons = [];
        let videoFiles = [];
        let totalVideoSizeGB = 0;

        // Step 1: Calculate total video size
        for (let i = 0; i < lessonCount; i++) {
            if (body[`lessonType_${i}`] === "video") {
                const videoFile = files.find(
                    (f) => f.fieldname === `lessonVideo_${i}`
                );

                if (!videoFile) {
                    throw new Error(`Missing video for lesson ${i + 1}`);
                }

                const videoSizeGB = videoFile.size / 1024 ** 3;
                totalVideoSizeGB += videoSizeGB;
                videoFiles.push({
                    index: i,
                    file: videoFile,
                    sizeGB: videoSizeGB,
                });
            }
        }

        // Step 2: Check storage against total video size
        const remainingStorage =
            community.cloudStorageLimit - community.cloudStorageUsed;
        if (totalVideoSizeGB > remainingStorage) {
            return res.status(400).json(`Insufficient storage`);
        }

        // Step 3: Upload all videos if storage is sufficient
        const uploadedVideos = [];
        try {
            // Upload all videos in parallel
            const uploadPromises = videoFiles.map((video) =>
                uploadToCloudinary(
                    video.file.buffer,
                    video.file.originalname,
                    "video"
                ).then((result) => ({
                    index: video.index,
                    public_id: result.public_id,
                    url: result.secure_url,
                    sizeGB: video.sizeGB,
                }))
            );

            const uploadResults = await Promise.all(uploadPromises);
            uploadedVideos.push(...uploadResults);
        } catch (uploadError) {
            // Cleanup any partially uploaded videos
            await Promise.all(
                uploadedVideos.map((video) =>
                    deleteCloudinaryImage(video.public_id)
                )
            );
            throw new Error(`Video upload failed: ${uploadError.message}`);
        }

        // Step 4: Update storage usage
        community.cloudStorageUsed += totalVideoSizeGB;
        await community.save();

        // Step 5: Process all lessons with video URLs
        try {
            for (let i = 0; i < lessonCount; i++) {
                const lessonType = body[`lessonType_${i}`];
                const summaryMode = body[`lessonSummaryMode_${i}`];

                let content;
                switch (lessonType) {
                    case "video": {
                        const video = uploadedVideos.find((v) => v.index === i);
                        if (!video)
                            throw new Error(
                                `Missing uploaded video for lesson ${i + 1}`
                            );
                        content = video.url;
                        break;
                    }
                    case "youtube":
                        content = body[`lessonUrl_${i}`];
                        if (!content)
                            throw new Error(
                                `Missing YouTube URL for lesson ${i + 1}`
                            );
                        break;
                    case "pdf": {
                        const pdfFile = files.find(
                            (f) => f.fieldname === `lessonPdf_${i}`
                        );
                        if (!pdfFile)
                            throw new Error(`Missing PDF for lesson ${i + 1}`);
                        content = await parsePDFBuffer(pdfFile.buffer);
                        break;
                    }
                    default:
                        throw new Error(
                            `Invalid lesson type for lesson ${i + 1}`
                        );
                }

                // Process lesson summary (now optional)
                let lessonSummary = null;
                if (summaryMode === "pdf") {
                    const summaryFile = files.find(
                        (f) => f.fieldname === `lessonSummaryPdf_${i}`
                    );
                    if (summaryFile) {
                        lessonSummary = await parsePDFBuffer(
                            summaryFile.buffer
                        );
                    }
                } else {
                    lessonSummary = body[`lessonSummaryText_${i}`] || null;
                }

                lessons.push({
                    type: lessonType,
                    content,
                    summary: lessonSummary,
                });
            }

            // Create course object
            const newCourse = {
                name: body.name,
                duration: body.duration,
                summary,
                lessons,
            };

            // Update community course
            await CommunityCourse.findOneAndUpdate(
                { communityId },
                { $push: { courses: newCourse } },
                { upsert: true, new: true }
            );

            res.status(201).json("Course created successfully");
        } catch (processingError) {
            // Cleanup videos if lesson processing fails
            await Promise.all(
                uploadedVideos.map((video) =>
                    deleteCloudinaryImage(video.public_id)
                )
            );

            // Revert storage usage
            community.cloudStorageUsed -= totalVideoSizeGB;
            await community.save();

            throw processingError;
        }
    } catch (error) {
        console.error("Course creation error:", error);
        res.status(500).json(error.message || "Internal Server Error");
    }
};

module.exports = { createCourse };
