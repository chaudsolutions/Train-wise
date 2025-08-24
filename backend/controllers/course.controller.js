const UsersModel = require("../Models/Users");
const CommunityCourse = require("../Models/CommunityCourse");
const Community = require("../Models/Community");
const { uploadToS3, deleteFromS3 } = require("../utils/s3bucket");

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

        // Process course summary - upload PDF to S3 if provided
        let summary = body.summaryText || null;
        let summaryPdfUrl = null;

        const summaryPdfFile = files.find((f) => f.fieldname === "summaryPdf");
        if (summaryPdfFile) {
            // Upload summary PDF to S3
            const summaryPdfResult = await uploadToS3(
                summaryPdfFile.buffer,
                summaryPdfFile.originalname,
                summaryPdfFile.mimetype
            );

            summaryPdfUrl = summaryPdfResult.url;
        }

        // Process lessons
        const lessonCount = parseInt(body.lessonCount);
        let lessons = [];
        let videoFiles = [];
        let pdfFiles = []; // Track PDF files for cleanup
        let totalVideoSizeGB = 0;
        let totalPdfSizeGB = 0;

        // Step 1: Calculate total file sizes
        for (let i = 0; i < lessonCount; i++) {
            const lessonType = body[`lessonType_${i}`];

            if (lessonType === "video") {
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
            } else if (lessonType === "pdf") {
                const pdfFile = files.find(
                    (f) => f.fieldname === `lessonPdf_${i}`
                );

                if (!pdfFile) {
                    throw new Error(`Missing PDF for lesson ${i + 1}`);
                }

                const pdfSizeGB = pdfFile.size / 1024 ** 3;
                totalPdfSizeGB += pdfSizeGB;
                pdfFiles.push({
                    index: i,
                    file: pdfFile,
                    sizeGB: pdfSizeGB,
                });
            }
        }

        // Step 2: Check storage against total file size (videos + PDFs)
        const totalFileSizeGB = totalVideoSizeGB + totalPdfSizeGB;
        const remainingStorage =
            community.cloudStorageLimit - community.cloudStorageUsed;
        if (totalFileSizeGB > remainingStorage) {
            return res.status(400).json(`Insufficient storage`);
        }

        // Step 3: Upload all videos and PDFs to S3
        const uploadedVideos = [];
        const uploadedPdfs = [];

        try {
            // Upload all videos in parallel
            const videoUploadPromises = videoFiles.map((video) =>
                uploadToS3(
                    video.file.buffer,
                    video.file.originalname,
                    video.file.mimetype
                ).then((result) => ({
                    index: video.index,
                    public_id: result.public_id,
                    url: result.url,
                    sizeGB: video.sizeGB,
                    key: result.key, // Assuming your uploadToS3 returns a key
                }))
            );

            // Upload all PDFs in parallel
            const pdfUploadPromises = pdfFiles.map((pdf) =>
                uploadToS3(
                    pdf.file.buffer,
                    pdf.file.originalname,
                    pdf.file.mimetype
                ).then((result) => ({
                    index: pdf.index,
                    public_id: result.public_id,
                    url: result.url,
                    sizeGB: pdf.sizeGB,
                    key: result.key,
                }))
            );

            const [videoResults, pdfResults] = await Promise.all([
                Promise.all(videoUploadPromises),
                Promise.all(pdfUploadPromises),
            ]);

            uploadedVideos.push(...videoResults);
            uploadedPdfs.push(...pdfResults);
        } catch (uploadError) {
            // Cleanup any partially uploaded files
            const cleanupPromises = [
                ...uploadedVideos.map((video) => deleteFromS3(video.key)),
                ...uploadedPdfs.map((pdf) => deleteFromS3(pdf.key)),
            ];
            await Promise.all(cleanupPromises);
            throw new Error(`File upload failed: ${uploadError.message}`);
        }

        // Step 4: Update storage usage
        community.cloudStorageUsed += totalFileSizeGB;
        await community.save();

        // Step 5: Process all lessons with file URLs
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
                        const pdf = uploadedPdfs.find((p) => p.index === i);
                        if (!pdf)
                            throw new Error(
                                `Missing uploaded PDF for lesson ${i + 1}`
                            );
                        content = pdf.url; // Store S3 URL instead of parsed text
                        break;
                    }
                    default:
                        throw new Error(
                            `Invalid lesson type for lesson ${i + 1}`
                        );
                }

                // Process lesson summary - upload PDF to S3 if provided
                let lessonSummary = body[`lessonSummaryText_${i}`] || null;
                let lessonSummaryPdfUrl = null;

                if (summaryMode === "pdf") {
                    const summaryFile = files.find(
                        (f) => f.fieldname === `lessonSummaryPdf_${i}`
                    );
                    if (summaryFile) {
                        // Upload lesson summary PDF to S3
                        const summaryResult = await uploadToS3(
                            summaryFile.buffer,
                            summaryFile.originalname,
                            summaryFile.mimetype
                        );
                        lessonSummaryPdfUrl = summaryResult.url;
                    }
                }

                lessons.push({
                    type: lessonType,
                    content,
                    summary: lessonSummary,
                    summaryPdfUrl: lessonSummaryPdfUrl, // Store S3 URL for PDF summary
                });
            }

            // Create course object
            const newCourse = {
                name: body.name,
                duration: body.duration,
                summary,
                summaryPdfUrl, // Store S3 URL for course summary PDF
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
            // Cleanup all uploaded files if lesson processing fails
            const cleanupPromises = [
                ...uploadedVideos.map((video) => deleteFromS3(video.key)),
                ...uploadedPdfs.map((pdf) => deleteFromS3(pdf.key)),
            ];

            if (summaryPdfUrl) {
                cleanupPromises.push(deleteFromS3(summaryPdfUrl));
            }

            await Promise.all(cleanupPromises);

            // Revert storage usage
            community.cloudStorageUsed -= totalFileSizeGB;
            await community.save();

            throw processingError;
        }
    } catch (error) {
        console.error("Course creation error:", error);
        res.status(500).json(error.message || "Internal Server Error");
    }
};

module.exports = { createCourse };
