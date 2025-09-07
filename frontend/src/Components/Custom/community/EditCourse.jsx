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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import WarningIcon from "@mui/icons-material/Warning";
import axios from "axios";
import toast from "react-hot-toast";
import { serVer, useToken } from "../../Hooks/useVariable";
import { useCommunityCoursesData } from "../../Hooks/useQueryFetch/useQueryData";
import { useNavigate } from "react-router-dom";

const EditCourse = ({ communityId, courseData, refetch }) => {
    const { token } = useToken();
    const [loading, setLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [lessonToDelete, setLessonToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(""); // "course" or "lesson"

    const navigate = useNavigate();

    const { refetchCourses } = useCommunityCoursesData({
        id: communityId,
    });

    if (!courseData) {
        return (
            <Card>
                <CardContent>
                    <Typography>Course data not available</Typography>
                </CardContent>
            </Card>
        );
    }

    const { _id: courseId, name, duration, lessons = [] } = courseData;

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

    return (
        <Box>
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

            {/* Lessons List */}
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
