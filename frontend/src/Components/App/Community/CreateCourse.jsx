import { useState } from "react";
import { useForm } from "react-hook-form";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText,
    Divider,
    Chip,
    LinearProgress,
} from "@mui/material";
import {
    AddCircleOutline,
    DeleteOutline,
    UploadFile,
    VideoFile,
} from "@mui/icons-material";
import { useReactRouter } from "../../Hooks/useReactRouter";
import { serVer, useToken } from "../../Hooks/useVariable";
import ButtonLoad from "../../Animations/ButtonLoad";
import axios from "axios";
import toast from "react-hot-toast";

const CreateCourse = () => {
    const { useParams, Link } = useReactRouter();
    const { communityId } = useParams();
    const { token } = useToken();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const [uploadProgress, setUploadProgress] = useState(0);
    const [summaryMode, setSummaryMode] = useState("pdf");
    const [lessons, setLessons] = useState([
        {
            type: "video",
            content: null,
            summaryMode: "pdf",
            summaryContent: null,
        },
    ]);

    // State for storing files
    const [files, setFiles] = useState({
        summaryPdf: null,
        lessonVideos: [],
        lessonPdfs: [],
        lessonSummaryPdfs: [],
    });

    const addLesson = () => {
        if (lessons.length < 10) {
            setLessons([
                ...lessons,
                {
                    type: "video",
                    content: null,
                    summaryMode: "pdf",
                    summaryContent: null,
                },
            ]);
            // Initialize file states for new lesson
            setFiles((prev) => ({
                ...prev,
                lessonVideos: [...prev.lessonVideos, null],
                lessonPdfs: [...prev.lessonPdfs, null],
                lessonSummaryPdfs: [...prev.lessonSummaryPdfs, null],
            }));
        }
    };

    const removeLesson = (index) => {
        if (lessons.length > 1) {
            const updated = lessons.filter((_, i) => i !== index);
            setLessons(updated);
            // Remove corresponding file states
            setFiles((prev) => ({
                ...prev,
                lessonVideos: prev.lessonVideos.filter((_, i) => i !== index),
                lessonPdfs: prev.lessonPdfs.filter((_, i) => i !== index),
                lessonSummaryPdfs: prev.lessonSummaryPdfs.filter(
                    (_, i) => i !== index
                ),
            }));
        }
    };

    const handleFileUpload = (type, index, file) => {
        switch (type) {
            case "summaryPdf":
                setFiles((prev) => ({ ...prev, summaryPdf: file }));
                break;
            case "lessonVideo":
                setFiles((prev) => {
                    const newVideos = [...prev.lessonVideos];
                    newVideos[index] = file;
                    return { ...prev, lessonVideos: newVideos };
                });
                break;
            case "lessonPdf":
                setFiles((prev) => {
                    const newPdfs = [...prev.lessonPdfs];
                    newPdfs[index] = file;
                    return { ...prev, lessonPdfs: newPdfs };
                });
                break;
            case "lessonSummaryPdf":
                setFiles((prev) => {
                    const newSummaryPdfs = [...prev.lessonSummaryPdfs];
                    newSummaryPdfs[index] = file;
                    return { ...prev, lessonSummaryPdfs: newSummaryPdfs };
                });
                break;
        }
    };

    const onSubmit = async (data) => {
        const formData = new FormData();
        setUploadProgress(0);

        try {
            // Add course metadata
            formData.append("name", data.name);
            formData.append("duration", data.duration);
            formData.append("summaryMode", summaryMode);
            formData.append("lessonCount", lessons.length);

            // Handle course summary
            if (summaryMode === "pdf") {
                if (files.summaryPdf) {
                    formData.append("summaryPdf", files.summaryPdf);
                }
            } else {
                formData.append("summaryText", data.summaryText);
            }

            // Handle lessons
            // Handle lessons
            lessons.forEach((lesson, index) => {
                formData.append(`lessonType_${index}`, lesson.type);
                formData.append(
                    `lessonSummaryMode_${index}`,
                    lesson.summaryMode
                );

                switch (lesson.type) {
                    case "video":
                        if (files.lessonVideos[index]) {
                            formData.append(
                                `lessonVideo_${index}`,
                                files.lessonVideos[index]
                            );
                        }
                        break;
                    case "youtube":
                        formData.append(
                            `lessonUrl_${index}`,
                            data[`lessonUrl_${index}`]
                        );
                        break;
                    case "pdf":
                        if (files.lessonPdfs[index]) {
                            formData.append(
                                `lessonPdf_${index}`,
                                files.lessonPdfs[index]
                            );
                        }
                        break;
                }

                if (lesson.summaryMode === "pdf") {
                    if (files.lessonSummaryPdfs[index]) {
                        formData.append(
                            `lessonSummaryPdf_${index}`,
                            files.lessonSummaryPdfs[index]
                        );
                    }
                } else {
                    formData.append(
                        `lessonSummaryText_${index}`,
                        data[`lessonSummaryText_${index}`]
                    );
                }
            });

            const response = await axios.post(
                `${serVer}/creator/createCourse/${communityId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) /
                                (progressEvent.total || 1)
                        );
                        setUploadProgress(percentCompleted);
                    },
                }
            );

            toast.success(response.data);
        } catch (error) {
            console.error("Error creating course:", error);
            toast.error(error.response?.data || "Failed to create course");
            setUploadProgress(0);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                    Create New Course
                </Typography>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Course Name Field */}
                    <TextField
                        fullWidth
                        label="Course Name"
                        {...register("name", {
                            required: "Course name is required",
                        })}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        sx={{ mb: 3 }}
                    />

                    {/* Duration Field */}
                    <FormControl
                        fullWidth
                        sx={{ mb: 3 }}
                        error={!!errors.duration}>
                        <InputLabel>Duration</InputLabel>
                        <Select
                            {...register("duration", {
                                required: "Duration is required",
                            })}
                            label="Duration"
                            defaultValue="">
                            <MenuItem value="" disabled>
                                Select duration
                            </MenuItem>
                            <MenuItem value="1">1 Week</MenuItem>
                            <MenuItem value="2">2 Weeks</MenuItem>
                            <MenuItem value="4">4 Weeks</MenuItem>
                        </Select>
                        <FormHelperText>
                            {errors.duration?.message}
                        </FormHelperText>
                    </FormControl>

                    {/* Course Summary Section */}
                    <Box sx={{ mb: 3 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 2,
                            }}>
                            <Typography variant="subtitle1">
                                Course Summary
                            </Typography>
                            <Chip
                                label={summaryMode.toUpperCase()}
                                onClick={() =>
                                    setSummaryMode((prev) =>
                                        prev === "pdf" ? "text" : "pdf"
                                    )
                                }
                                color="primary"
                                size="small"
                                variant="outlined"
                            />
                        </Box>

                        {summaryMode === "pdf" ? (
                            <FormControl fullWidth error={!!errors.summaryPdf}>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    hidden
                                    id="summaryPdf"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        handleFileUpload(
                                            "summaryPdf",
                                            null,
                                            file
                                        );
                                    }}
                                />
                                <label htmlFor="summaryPdf">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<UploadFile />}
                                        fullWidth>
                                        {files.summaryPdf?.name?.slice(0, 15) ||
                                            "Upload Summary PDF"}
                                    </Button>
                                </label>
                                {!files.summaryPdf && (
                                    <FormHelperText error>
                                        PDF is required
                                    </FormHelperText>
                                )}
                            </FormControl>
                        ) : (
                            <TextField
                                fullWidth
                                multiline
                                rows={1}
                                {...register("summaryText", {
                                    required: "Summary text is required",
                                })}
                                error={!!errors.summaryText}
                                helperText={errors.summaryText?.message}
                                placeholder="Enter course summary..."
                            />
                        )}
                    </Box>

                    {/* Lessons Section */}
                    <Divider sx={{ my: 4 }} />
                    <Typography variant="h6" gutterBottom>
                        Course Lessons
                    </Typography>

                    {lessons.map((lesson, index) => (
                        <Box
                            key={index}
                            sx={{ mb: 4, border: 1, p: 2, borderRadius: 1 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 2,
                                }}>
                                <Typography variant="subtitle1">
                                    Lesson {index + 1}
                                </Typography>
                                {lessons.length > 1 && (
                                    <IconButton
                                        onClick={() => removeLesson(index)}>
                                        <DeleteOutline color="error" />
                                    </IconButton>
                                )}
                            </Box>
                            {/* Lesson Type Selection */}
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Lesson Type</InputLabel>
                                <Select
                                    value={lesson.type}
                                    onChange={(e) => {
                                        const updated = [...lessons];
                                        updated[index].type = e.target.value;
                                        setLessons(updated);
                                    }}
                                    label="Lesson Type">
                                    <MenuItem value="video">
                                        Video Upload
                                    </MenuItem>
                                    <MenuItem value="youtube">
                                        YouTube Link
                                    </MenuItem>
                                    <MenuItem value="pdf">PDF Content</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Lesson Content */}
                            {lesson.type === "video" && (
                                <FormControl
                                    fullWidth
                                    error={!files.lessonVideos[index]}>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        hidden
                                        id={`lessonVideo_${index}`}
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            handleFileUpload(
                                                "lessonVideo",
                                                index,
                                                file
                                            );
                                        }}
                                    />
                                    <label htmlFor={`lessonVideo_${index}`}>
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={<VideoFile />}
                                            fullWidth>
                                            {files.lessonVideos[
                                                index
                                            ]?.name?.slice(0, 15) ||
                                                "Upload Lesson Video"}
                                        </Button>
                                    </label>
                                    {!files.lessonVideos[index] && (
                                        <FormHelperText error>
                                            Video is required
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            )}

                            {lesson.type === "youtube" && (
                                <TextField
                                    fullWidth
                                    label="YouTube Video URL"
                                    {...register(`lessonUrl_${index}`, {
                                        required: "URL is required",
                                        pattern: {
                                            value: /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/,
                                            message: "Invalid YouTube URL",
                                        },
                                    })}
                                    error={!!errors[`lessonUrl_${index}`]}
                                    helperText={
                                        errors[`lessonUrl_${index}`]?.message
                                    }
                                />
                            )}

                            {lesson.type === "pdf" && (
                                <FormControl
                                    fullWidth
                                    error={!files.lessonPdfs[index]}>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        hidden
                                        id={`lessonPdf_${index}`}
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            handleFileUpload(
                                                "lessonPdf",
                                                index,
                                                file
                                            );
                                        }}
                                    />
                                    <label htmlFor={`lessonPdf_${index}`}>
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={<UploadFile />}
                                            fullWidth>
                                            {files.lessonPdfs[
                                                index
                                            ]?.name?.slice(0, 15) ||
                                                "Upload Lesson PDF"}
                                        </Button>
                                    </label>
                                    {!files.lessonPdfs[index] && (
                                        <FormHelperText error>
                                            PDF is required
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            )}

                            {/* Lesson Summary */}
                            <Box sx={{ mt: 2 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mb: 2,
                                    }}>
                                    <Typography variant="body2">
                                        Lesson Summary
                                    </Typography>
                                    <Chip
                                        label={lesson.summaryMode.toUpperCase()}
                                        onClick={() => {
                                            const updated = [...lessons];
                                            updated[index].summaryMode =
                                                updated[index].summaryMode ===
                                                "pdf"
                                                    ? "text"
                                                    : "pdf";
                                            setLessons(updated);
                                        }}
                                        color="secondary"
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>

                                {lesson.summaryMode === "pdf" ? (
                                    <FormControl
                                        fullWidth
                                        error={!files.lessonSummaryPdfs[index]}>
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            hidden
                                            id={`lessonSummaryPdf_${index}`}
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                handleFileUpload(
                                                    "lessonSummaryPdf",
                                                    index,
                                                    file
                                                );
                                            }}
                                        />
                                        <label
                                            htmlFor={`lessonSummaryPdf_${index}`}>
                                            <Button
                                                variant="outlined"
                                                component="span"
                                                startIcon={<UploadFile />}
                                                fullWidth>
                                                {files.lessonSummaryPdfs[
                                                    index
                                                ]?.name?.slice(0, 15) ||
                                                    "Upload Summary PDF"}
                                            </Button>
                                        </label>
                                        {!files.lessonSummaryPdfs[index] && (
                                            <FormHelperText error>
                                                Summary PDF is required
                                            </FormHelperText>
                                        )}
                                    </FormControl>
                                ) : (
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={1}
                                        {...register(
                                            `lessonSummaryText_${index}`,
                                            {
                                                required:
                                                    "Summary text is required",
                                            }
                                        )}
                                        error={
                                            !!errors[
                                                `lessonSummaryText_${index}`
                                            ]
                                        }
                                        helperText={
                                            errors[`lessonSummaryText_${index}`]
                                                ?.message
                                        }
                                        placeholder="Enter lesson summary..."
                                    />
                                )}
                            </Box>
                        </Box>
                    ))}

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 3,
                        }}>
                        <Button
                            variant="outlined"
                            onClick={addLesson}
                            disabled={lessons.length >= 10}
                            startIcon={<AddCircleOutline />}>
                            Add Lesson ({10 - lessons.length} remaining)
                        </Button>
                    </Box>

                    <Box sx={{ mt: 4, textAlign: "center" }}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={isSubmitting}
                            sx={{
                                position: "relative",
                                overflow: "hidden",
                                minWidth: 200,
                                transition: "all 0.3s ease",
                            }}>
                            <Box
                                sx={{
                                    position: "relative",
                                    zIndex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}>
                                {isSubmitting ? (
                                    <>
                                        <ButtonLoad />
                                        <span>{uploadProgress}%</span>
                                    </>
                                ) : (
                                    "Create Course"
                                )}
                            </Box>
                            {isSubmitting && (
                                <LinearProgress
                                    variant={
                                        uploadProgress === 100
                                            ? "indeterminate"
                                            : "determinate"
                                    }
                                    value={uploadProgress}
                                    sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: "100%",
                                        opacity: 0.3,
                                    }}
                                />
                            )}
                        </Button>
                    </Box>
                </form>
            </Paper>

            <Box display="flex" justifyContent="center" mt={8}>
                <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    component={Link}
                    to={`/community/access/${communityId}`}>
                    Go Back to Community
                </Button>
            </Box>
        </Box>
    );
};

export default CreateCourse;
