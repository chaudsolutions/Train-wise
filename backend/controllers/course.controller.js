const pdf = require("pdf-parse");
const { uploadToCloudinary } = require("../utils/uploadMedia");
const UsersModel = require("../Models/Users");
const CommunityCourse = require("../Models/CommunityCourse");
const Community = require("../Models/Community");

const createCourse = async (req, res) => {
    try {
        console.log("1. Starting course creation");

        const userId = req.userId;
        const { communityId } = req.params;
        const files = req.files;
        const body = req.body;

        // Add debug logging for received fields
        console.log("Received fields:", Object.keys(body));
        console.log(
            "Files received:",
            files.map((f) => f.fieldname)
        );
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
                console.log("PDF text length:", data.text.length);
                console.log("First 200 characters:", data.text.slice(0, 200));
                return data.text;
            } catch (error) {
                console.error("PDF parsing failed:", error);
                throw new Error("Failed to extract text from PDF");
            }
        };

        console.log("2. Processing course summary");
        // Process course summary
        let summary;
        const summaryPdfFile = files.find((f) => f.fieldname === "summaryPdf");
        if (summaryPdfFile) {
            console.log("2a. Parsing summary PDF");
            summary = await parsePDFBuffer(summaryPdfFile.buffer);
            console.log("2b. Summary PDF parsed");
        } else if (body.summaryText) {
            summary = body.summaryText;
        }

        console.log("3. Processing lessons");
        // Process lessons
        const lessons = [];
        const lessonCount = parseInt(body.lessonCount);

        for (let i = 0; i < lessonCount; i++) {
            console.log(`4. Processing lesson ${i}`);
            const lessonType = body[`lessonType_${i}`]; // Changed to flat field name
            const summaryMode = body[`lessonSummaryMode_${i}`]; // Changed to flat field name

            console.log(`Lesson ${i} type: ${lessonType}`); // Add this line

            // Process lesson content
            let content;
            switch (lessonType) {
                case "video": {
                    console.log(`4a. Uploading video for lesson ${i}`);
                    const videoFile = files.find(
                        (f) => f.fieldname === `lessonVideo_${i}`
                    );

                    if (!videoFile)
                        throw new Error(`Missing video for lesson ${i + 1}`);
                    const videoResult = await uploadToCloudinary(
                        videoFile.buffer,
                        videoFile.originalname,
                        "video"
                    );
                    content = videoResult.secure_url;
                    console.log(`4b. Video uploaded for lesson ${i}`);
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
                    console.log(`4c. Parsing PDF for lesson ${i}`);
                    if (!pdfFile)
                        throw new Error(`Missing PDF for lesson ${i + 1}`);
                    content = await parsePDFBuffer(pdfFile.buffer);
                    console.log(`4d. PDF parsed for lesson ${i}`);
                    break;
                }
                default:
                    throw new Error(`Invalid lesson type for lesson ${i + 1}`);
            }

            console.log(`5. Processing summary for lesson ${i}`);
            // Process lesson summary
            let lessonSummary;
            if (summaryMode === "pdf") {
                const summaryFile = files.find(
                    (f) => f.fieldname === `lessonSummaryPdf_${i}`
                );
                if (!summaryFile)
                    throw new Error(`Missing summary PDF for lesson ${i + 1}`);
                lessonSummary = await parsePDFBuffer(summaryFile.buffer);
            } else {
                lessonSummary = body[`lessonSummaryText_${i}`];
                if (!lessonSummary)
                    throw new Error(`Missing summary text for lesson ${i + 1}`);
            }

            lessons.push({
                type: lessonType,
                content,
                summary: lessonSummary,
            });
        }

        console.log("6. Creating course object");
        // Create course object
        const newCourse = {
            name: body.name,
            duration: body.duration,
            summary,
            lessons,
            createdAt: new Date(),
        };

        console.log("7. Updating database");
        // Update community course
        await CommunityCourse.findOneAndUpdate(
            { communityId },
            { $push: { courses: newCourse } },
            { upsert: true, new: true }
        );

        console.log("8. Database updated");

        res.status(201).json("Course created successfully");
    } catch (error) {
        console.error("Course creation error:", error);
        res.status(500).json("Internal Server Error");
    }
};

module.exports = { createCourse };
