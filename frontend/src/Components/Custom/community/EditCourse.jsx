import { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Divider,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Grid,
    FormControlLabel,
    Radio,
    RadioGroup,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import toast from "react-hot-toast";
import { serVer, useToken } from "../../Hooks/useVariable";
import { useCommunityCoursesData } from "../../Hooks/useQueryFetch/useQueryData";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";

const EditCourse = ({ communityId, courseData, refetch }) => {
    const { token } = useToken();
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(""); // "course" or "lesson"
    const [activeTab, setActiveTab] = useState(0); // 0: Delete, 1: Add Content

    const navigate = useNavigate();
    const { refetchCourses } = useCommunityCoursesData({ id: communityId });

    // Form for adding new content
    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            contentType: "lesson", // "summary" or "lesson"
            summaryType: "text", // "text" or "pdf"
            summaryText: "",
            lessonType: "video", // "video", "youtube", "pdf"
            lessonUrl: "",
            lessonSummary: "",
            lessonIndex: 0,
        },
    });

    const watchContentType = watch("contentType");
    const watchSummaryType = watch("summaryType");
    const watchLessonType = watch("lessonType");

    if (!courseData) {
        return (
            <Card>
                <CardContent>
                    <Typography>Course data not available</Typography>
                </CardContent>
            </Card>
        );
    }

    const {
        _id: courseId,
        name,
        duration,
        lessons = [],
        summary,
        summaryPdfUrl,
    } = courseData;

    console.log(courseData);

    const handleDeleteCourse = async () => {
        setLoading(true);
        try {
            await axios.delete(
                `${serVer}/creator/community-course/${communityId}/${courseId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Course deleted successfully");
            setDeleteDialogOpen(false);
            refetchCourses();
            navigate(`/community/access/${communityId}?tab=classroom`);
        } catch (error) {
            toast.error(error.response?.data || "Failed to delete course");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLesson = async (lessonIndex) => {
        setLoading(true);
        try {
            await axios.delete(
                `${serVer}/creator/community-course/${communityId}/${courseId}/lesson/${lessonIndex}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Lesson deleted successfully");
            setDeleteDialogOpen(false);
            refetch();
        } catch (error) {
            toast.error(error.response?.data || "Failed to delete lesson");
        } finally {
            setLoading(false);
        }
    };

    const handleAddContent = async (data) => {
        setLoading(true);
        try {
            if (data.contentType === "summary") {
                // Handle summary update
                const formData = new FormData();
                if (data.summaryType === "text") {
                    formData.append("summaryText", data.summaryText);
                } else if (data.summaryType === "pdf" && data.summaryPdf) {
                    formData.append("summaryPdf", data.summaryPdf[0]);
                }

                console.log({ formData });

                await axios.put(
                    `${serVer}/creator/community-course/${communityId}/${courseId}/summary`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                toast.success("Course summary updated successfully");
            } else if (data.contentType === "lesson") {
                // Handle lesson addition
                const formData = new FormData();
                formData.append("lessonType", data.lessonType);
                formData.append("lessonIndex", data.lessonIndex);

                if (data.lessonType === "youtube") {
                    formData.append("lessonUrl", data.lessonUrl);
                } else if (data.lessonType === "video" && data.lessonVideo) {
                    formData.append("lessonVideo", data.lessonVideo[0]);
                } else if (data.lessonType === "pdf" && data.lessonPdf) {
                    formData.append("lessonPdf", data.lessonPdf[0]);
                }

                if (data.lessonSummary) {
                    formData.append("lessonSummary", data.lessonSummary);
                }

                await axios.post(
                    `${serVer}/creator/community-course/${communityId}/${courseId}/lesson`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                toast.success("Lesson added successfully");
            }

            reset();
            refetch();
        } catch (error) {
            toast.error(error.response?.data || "Failed to add content");
        } finally {
            setLoading(false);
        }
    };

    const openDeleteDialog = (type, lessonIndex = null) => {
        setDeleteType(type);
        setLessonToDelete(lessonIndex);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setLessonToDelete(null);
        setDeleteType("");
    };

    const confirmDelete = () => {
        if (deleteType === "course") {
            handleDeleteCourse();
        } else if (deleteType === "lesson" && lessonToDelete !== null) {
            handleDeleteLesson(lessonToDelete);
        }
    };

    const getLessonTypeIcon = (type) => {
        switch (type) {
            case "video":
                return "🎬";
            case "youtube":
                return "📺";
            case "pdf":
                return "📄";
            default:
                return "📝";
        }
    };

    // Generate index options for lessons (0 to lessons.length)
    const indexOptions = Array.from(
        { length: lessons.length + 1 },
        (_, i) => i
    );

    return (
        <Box>
            {/* Tabs */}
            <Card sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    centered
                    sx={{
                        "& .MuiTab-root": {
                            fontWeight: 600,
                            fontSize: "1rem",
                        },
                    }}>
                    <Tab icon={<DeleteIcon />} label="Manage Content" />
                    <Tab icon={<AddIcon />} label="Add Content" />
                </Tabs>
            </Card>

            {/* Course Header */}
            <Card sx={{ mb: 3, bgcolor: "warning.light" }}>
                <CardContent>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center">
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                {name}
                            </Typography>
                            <Chip
                                label={`${duration} week(s) • ${lessons.length} lessons`}
                                color="primary"
                            />
                            {summaryPdfUrl && (
                                <Chip
                                    label="Has PDF Summary"
                                    color="success"
                                    sx={{ ml: 1 }}
                                />
                            )}
                        </Box>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => openDeleteDialog("course")}
                            disabled={loading}>
                            Delete Course
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Tab Content */}
            {activeTab === 0 ? (
                /* Delete Tab Content */
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Course Lessons ({lessons.length})
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {lessons.length === 0 ? (
                            <Typography
                                color="text.secondary"
                                sx={{ py: 3, textAlign: "center" }}>
                                No lessons in this course
                            </Typography>
                        ) : (
                            <List>
                                {lessons.map((lesson, index) => (
                                    <ListItem
                                        key={index}
                                        sx={{
                                            border: "1px solid",
                                            borderColor: "divider",
                                            borderRadius: 1,
                                            mb: 1,
                                            bgcolor: "background.paper",
                                        }}>
                                        <Box sx={{ mr: 2 }}>
                                            <Typography variant="h6">
                                                {getLessonTypeIcon(lesson.type)}
                                            </Typography>
                                        </Box>

                                        <ListItemText
                                            primary={
                                                <Box>
                                                    <Typography variant="subtitle1">
                                                        Lesson {index + 1}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary">
                                                        Type: {lesson.type}
                                                    </Typography>
                                                    {lesson.summary && (
                                                        <Typography
                                                            variant="caption"
                                                            display="block">
                                                            {lesson.summary.substring(
                                                                0,
                                                                100
                                                            )}
                                                            ...
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />

                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                color="error"
                                                onClick={() =>
                                                    openDeleteDialog(
                                                        "lesson",
                                                        index
                                                    )
                                                }
                                                disabled={loading}
                                                sx={{ ml: 1 }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>
            ) : (
                /* Add Content Tab Content */
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Add New Content
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <form onSubmit={handleSubmit(handleAddContent)}>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <Controller
                                    name="contentType"
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup {...field} row>
                                            <FormControlLabel
                                                value="summary"
                                                control={<Radio />}
                                                label="Update Course Summary"
                                            />
                                            <FormControlLabel
                                                value="lesson"
                                                control={<Radio />}
                                                label="Add New Lesson"
                                            />
                                        </RadioGroup>
                                    )}
                                />
                            </FormControl>

                            {watchContentType === "summary" && (
                                <Box>
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <Controller
                                            name="summaryType"
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup {...field} row>
                                                    <FormControlLabel
                                                        value="text"
                                                        control={<Radio />}
                                                        label="Text Summary"
                                                    />
                                                    <FormControlLabel
                                                        value="pdf"
                                                        control={<Radio />}
                                                        label="PDF Summary"
                                                    />
                                                </RadioGroup>
                                            )}
                                        />
                                    </FormControl>

                                    {watchSummaryType === "text" ? (
                                        <Controller
                                            name="summaryText"
                                            control={control}
                                            rules={{
                                                required:
                                                    "Summary text is required",
                                            }}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="Course Summary"
                                                    multiline
                                                    rows={1}
                                                    fullWidth
                                                    error={!!errors.summaryText}
                                                    helperText={
                                                        errors.summaryText
                                                            ?.message
                                                    }
                                                    sx={{ mb: 3 }}
                                                />
                                            )}
                                        />
                                    ) : (
                                        <Controller
                                            name="summaryPdf"
                                            control={control}
                                            rules={{
                                                required:
                                                    "PDF file is required",
                                            }}
                                            render={({
                                                field: { onChange, ...field },
                                            }) => (
                                                <Button
                                                    variant="outlined"
                                                    component="label"
                                                    fullWidth
                                                    sx={{ mb: 3 }}>
                                                    Upload PDF Summary
                                                    <input
                                                        {...field}
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={(e) =>
                                                            onChange(
                                                                e.target.files
                                                            )
                                                        }
                                                        hidden
                                                    />
                                                </Button>
                                            )}
                                        />
                                    )}
                                </Box>
                            )}

                            {watchContentType === "lesson" && (
                                <Box>
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Controller
                                                name="lessonType"
                                                control={control}
                                                render={({ field }) => (
                                                    <FormControl fullWidth>
                                                        <InputLabel>
                                                            Lesson Type
                                                        </InputLabel>
                                                        <Select
                                                            {...field}
                                                            label="Lesson Type">
                                                            <MenuItem value="video">
                                                                Video File
                                                            </MenuItem>
                                                            <MenuItem value="youtube">
                                                                YouTube Video
                                                            </MenuItem>
                                                            <MenuItem value="pdf">
                                                                PDF Document
                                                            </MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                )}
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Controller
                                                name="lessonIndex"
                                                control={control}
                                                render={({ field }) => (
                                                    <FormControl fullWidth>
                                                        <InputLabel>
                                                            Insert Position
                                                        </InputLabel>
                                                        <Select
                                                            {...field}
                                                            label="Insert Position">
                                                            {indexOptions.map(
                                                                (index) => (
                                                                    <MenuItem
                                                                        key={
                                                                            index
                                                                        }
                                                                        value={
                                                                            index
                                                                        }>
                                                                        {index ===
                                                                        0
                                                                            ? "First position"
                                                                            : index ===
                                                                              lessons.length
                                                                            ? "Last position"
                                                                            : `After lesson ${index}`}
                                                                    </MenuItem>
                                                                )
                                                            )}
                                                        </Select>
                                                        <FormHelperText>
                                                            Choose where to
                                                            insert the new
                                                            lesson
                                                        </FormHelperText>
                                                    </FormControl>
                                                )}
                                            />
                                        </Grid>
                                    </Grid>

                                    {watchLessonType === "youtube" && (
                                        <Controller
                                            name="lessonUrl"
                                            control={control}
                                            rules={{
                                                required:
                                                    "YouTube URL is required",
                                            }}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    label="YouTube URL"
                                                    fullWidth
                                                    sx={{ mt: 3 }}
                                                    error={!!errors.lessonUrl}
                                                    helperText={
                                                        errors.lessonUrl
                                                            ?.message
                                                    }
                                                />
                                            )}
                                        />
                                    )}

                                    {(watchLessonType === "video" ||
                                        watchLessonType === "pdf") && (
                                        <Controller
                                            name={
                                                watchLessonType === "video"
                                                    ? "lessonVideo"
                                                    : "lessonPdf"
                                            }
                                            control={control}
                                            rules={{
                                                required: "File is required",
                                            }}
                                            render={({
                                                field: { onChange, ...field },
                                            }) => (
                                                <Button
                                                    variant="outlined"
                                                    component="label"
                                                    fullWidth
                                                    sx={{ mt: 3 }}>
                                                    Upload{" "}
                                                    {watchLessonType === "video"
                                                        ? "Video File"
                                                        : "PDF Document"}
                                                    <input
                                                        {...field}
                                                        type="file"
                                                        accept={
                                                            watchLessonType ===
                                                            "video"
                                                                ? "video/*"
                                                                : ".pdf"
                                                        }
                                                        onChange={(e) =>
                                                            onChange(
                                                                e.target.files
                                                            )
                                                        }
                                                        hidden
                                                    />
                                                </Button>
                                            )}
                                        />
                                    )}

                                    <Controller
                                        name="lessonSummary"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Lesson Summary (Optional)"
                                                multiline
                                                rows={1}
                                                fullWidth
                                                sx={{ mt: 3 }}
                                            />
                                        )}
                                    />
                                </Box>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={
                                    loading ? (
                                        <CircularProgress size={20} />
                                    ) : (
                                        <AddIcon />
                                    )
                                }
                                disabled={loading}
                                sx={{ mt: 3 }}>
                                {loading
                                    ? "Adding..."
                                    : `Add ${
                                          watchContentType === "summary"
                                              ? "Summary"
                                              : "Lesson"
                                      }`}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
                maxWidth="sm"
                fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center">
                        <WarningIcon color="error" sx={{ mr: 1 }} />
                        Confirm Delete
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {deleteType === "course" ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            <Typography variant="body1" fontWeight="bold">
                                Are you sure you want to delete the entire
                                course?
                            </Typography>
                            <Typography variant="body2">
                                This action cannot be undone. All lessons and
                                course data will be permanently deleted.
                            </Typography>
                        </Alert>
                    ) : (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography variant="body1" fontWeight="bold">
                                Delete Lesson{" "}
                                {lessonToDelete !== null
                                    ? lessonToDelete + 1
                                    : ""}
                                ?
                            </Typography>
                            <Typography variant="body2">
                                This lesson will be removed from the course.
                                This action cannot be undone.
                            </Typography>
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        color="error"
                        variant="contained"
                        disabled={loading}
                        startIcon={
                            loading ? (
                                <CircularProgress size={16} />
                            ) : (
                                <DeleteIcon />
                            )
                        }>
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EditCourse;
