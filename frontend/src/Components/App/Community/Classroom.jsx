import { useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    LinearProgress,
    Divider,
    Chip,
    Collapse,
    Button,
    Icon,
} from "@mui/material";
import {
    PlayCircle,
    ArrowBack,
    ArrowForward,
    CheckCircle,
    YouTube,
    PictureAsPdf,
    Description,
    Info,
    KeyboardArrowDown,
    KeyboardArrowUp,
} from "@mui/icons-material";
import axios from "axios";
import toast from "react-hot-toast";
import { useReactRouter } from "../../Hooks/useReactRouter";
import {
    useCommunitySingleCourseData,
    useUserData,
} from "../../Hooks/useQueryFetch/useQueryData";
import { serVer, useToken } from "../../Hooks/useVariable";
import PageLoader from "../../Animations/PageLoader";
import useResponsive from "../../Hooks/useResponsive";

const Classroom = () => {
    const { token } = useToken();
    const { isMobile } = useResponsive();
    const { useParams } = useReactRouter();
    const { communityId, courseId } = useParams();
    const { singleCourseData, isSingleCourseLoading } =
        useCommunitySingleCourseData({ communityId, courseId });

    const { userData, isUserDataLoading, refetchUserData } = useUserData();
    const { lessons, duration, name, summary } = singleCourseData || {};
    const { coursesWatched } = userData || {};
    const currentCourse = coursesWatched?.find(
        (course) => course?.courseId === courseId
    );

    const [selectedVideo, setSelectedVideo] = useState(0);
    const [showLessonSummary, setShowLessonSummary] = useState(false);

    const toggleSummary = () => setShowLessonSummary(!showLessonSummary);

    // Create display lessons array with summary first
    const displayLessons = [
        { type: "summary", content: summary, summary },
        ...(lessons || []),
    ];

    const handleContextMenu = (e) => {
        e.preventDefault();
    };

    const getYouTubeEmbedUrl = (url) => {
        const videoId = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    const handleLessonComplete = async () => {
        // Only handle completion for actual lessons (index > 0)
        if (selectedVideo === 0) return;
        if (currentCourse?.videos?.includes((selectedVideo - 1).toString()))
            return;

        try {
            await axios.put(
                `${serVer}/user/community/${communityId}/course/${courseId}/${
                    selectedVideo - 1
                }`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Lesson marked as completed");
            refetchUserData();
        } catch (error) {
            console.error("Error marking lesson as completed:", error);
        }
    };

    if (isSingleCourseLoading || isUserDataLoading) {
        return <PageLoader />;
    }

    const currentLesson = displayLessons[selectedVideo];
    const completionPercentage = currentCourse?.videos
        ? (currentCourse.videos.length / lessons?.length) * 100
        : 0;

    return (
        <Box
            sx={{
                maxWidth: 1440,
                mx: "auto",
                p: 3,
                bgcolor: "background.default",
                minHeight: "100vh",
            }}>
            {/* Header Section */}
            <Card
                sx={{
                    mb: 3,
                    bgcolor: "primary.main",
                    boxShadow: 3,
                    borderRadius: 2,
                }}>
                <CardContent>
                    <Typography variant="h4" gutterBottom color="common.white">
                        {name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Chip label={`${duration} week(s)`} color="secondary" />
                        <Box sx={{ flexGrow: 1 }}>
                            <LinearProgress
                                variant="determinate"
                                value={completionPercentage}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: "rgba(255, 255, 255, 0.3)",
                                    "& .MuiLinearProgress-bar": {
                                        bgcolor: "secondary.main",
                                    },
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{ mt: 1, color: "common.white" }}>
                                {Math.round(completionPercentage)}% Complete
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Main Content */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 3,
                }}>
                {/* Lesson Player Section */}
                <Box sx={{ flex: 2 }}>
                    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                        <Box
                            sx={{
                                position: "relative",
                                paddingTop:
                                    currentLesson?.type === "pdf" ||
                                    currentLesson?.type === "summary"
                                        ? 0
                                        : "56.25%",
                                bgcolor: "common.black",
                                height:
                                    currentLesson?.type === "pdf"
                                        ? 800
                                        : "auto",
                            }}>
                            {currentLesson?.type === "summary" && (
                                <Box
                                    sx={{
                                        p: 4,
                                        height: "100%",
                                        overflowY: "auto",
                                        bgcolor: "background.paper",
                                    }}>
                                    <Typography variant="h4" gutterBottom>
                                        Course Overview
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        whiteSpace="pre-wrap"
                                        sx={{ color: "text.secondary" }}>
                                        {currentLesson?.summary}
                                    </Typography>
                                </Box>
                            )}

                            {currentLesson?.type === "video" && (
                                <video
                                    controls
                                    key={selectedVideo}
                                    controlsList="nodownload"
                                    disablePictureInPicture
                                    onContextMenu={handleContextMenu}
                                    onEnded={handleLessonComplete}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                    }}>
                                    <source
                                        src={currentLesson?.content}
                                        type="video/mp4"
                                    />
                                    Your browser does not support the video tag.
                                </video>
                            )}

                            {currentLesson?.type === "youtube" && (
                                <iframe
                                    src={getYouTubeEmbedUrl(
                                        currentLesson?.content
                                    )}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                    }}
                                />
                            )}

                            {currentLesson?.type === "pdf" && (
                                <Box
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}>
                                    <Box sx={{ flex: 1 }}>
                                        <object
                                            data={currentLesson?.content}
                                            type="application/pdf"
                                            width="100%"
                                            height="100%">
                                            <Box
                                                sx={{
                                                    p: 3,
                                                    color: "text.primary",
                                                }}>
                                                <Typography>
                                                    Unable to display PDF.{" "}
                                                    <a
                                                        href={
                                                            currentLesson?.content
                                                        }
                                                        style={{
                                                            color: "secondary.main",
                                                        }}>
                                                        Download
                                                    </a>{" "}
                                                    instead.
                                                </Typography>
                                            </Box>
                                        </object>
                                    </Box>
                                    <Box
                                        sx={{
                                            p: 3,
                                            bgcolor: "background.paper",
                                            borderTop: "1px solid",
                                            borderColor: "divider",
                                            overflowY: "auto",
                                            maxHeight: 300,
                                        }}>
                                        <Typography variant="h6" gutterBottom>
                                            Lesson Summary
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            whiteSpace="pre-wrap"
                                            sx={{ color: "text.secondary" }}>
                                            {currentLesson?.summary}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        <Box m={2}>
                            {/* Summary Toggle Button */}
                            {(currentLesson?.type === "video" ||
                                currentLesson?.type === "youtube") && (
                                <Button
                                    variant="contained"
                                    onClick={toggleSummary}
                                    sx={{
                                        gap: 1,
                                        bgcolor: "background.paper",
                                        color: "text.primary",
                                        "&:hover": {
                                            bgcolor: "action.hover",
                                        },
                                    }}>
                                    <Info fontSize="small" />
                                    {showLessonSummary
                                        ? "Hide Summary"
                                        : "Show Summary"}
                                    <Icon
                                        component={
                                            showLessonSummary
                                                ? KeyboardArrowUp
                                                : KeyboardArrowDown
                                        }
                                    />
                                </Button>
                            )}

                            {/* Summary Panel */}
                            <Collapse
                                in={
                                    showLessonSummary && currentLesson?.summary
                                }>
                                <Box
                                    sx={{
                                        bgcolor: "background.paper",
                                        boxShadow: 3,
                                        maxHeight: "40vh",
                                        overflowY: "auto",
                                        p: 2,
                                    }}>
                                    <Typography variant="h6">
                                        Lesson Summary
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        whiteSpace="pre-wrap"
                                        sx={{ color: "text.secondary", mt: 1 }}>
                                        {currentLesson?.summary}
                                    </Typography>
                                </Box>
                            </Collapse>
                        </Box>

                        {/* Lesson Navigation */}
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                p: 2,
                                bgcolor: "background.paper",
                                borderTop: "1px solid",
                                borderColor: "divider",
                            }}>
                            <IconButton
                                disabled={selectedVideo === 0}
                                onClick={() =>
                                    setSelectedVideo((prev) => prev - 1)
                                }
                                color="primary"
                                sx={{ fontWeight: 600 }}>
                                <ArrowBack />
                                {!isMobile && (
                                    <Typography variant="button" sx={{ mr: 1 }}>
                                        Previous
                                    </Typography>
                                )}
                            </IconButton>

                            <Typography
                                variant="subtitle1"
                                fontSize=".9rem"
                                sx={{ mt: 0.5 }}>
                                Lesson {selectedVideo + 1} of{" "}
                                {displayLessons?.length}
                            </Typography>

                            <IconButton
                                disabled={
                                    selectedVideo === displayLessons?.length - 1
                                }
                                onClick={() =>
                                    setSelectedVideo((prev) => prev + 1)
                                }
                                color="primary"
                                sx={{ fontWeight: 600 }}>
                                {!isMobile && (
                                    <Typography variant="button" sx={{ mr: 1 }}>
                                        Next
                                    </Typography>
                                )}
                                <ArrowForward />
                            </IconButton>
                        </Box>
                    </Card>
                </Box>

                {/* Lessons List Sidebar */}
                <Box sx={{ flex: 1, maxWidth: { md: 400 } }}>
                    <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                        <CardContent sx={{ p: 0 }}>
                            <Typography
                                variant="h6"
                                sx={{ p: 2, pb: 1, fontWeight: 600 }}>
                                Course Content
                            </Typography>
                            <Divider />

                            <List dense sx={{ p: 1 }}>
                                {displayLessons?.map((lesson, displayIndex) => (
                                    <ListItem
                                        key={displayIndex}
                                        button
                                        selected={
                                            selectedVideo === displayIndex
                                        }
                                        onClick={() =>
                                            setSelectedVideo(displayIndex)
                                        }
                                        sx={{
                                            borderRadius: 1,
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            bgcolor:
                                                selectedVideo === displayIndex
                                                    ? "action.hover"
                                                    : "",
                                            borderLeft:
                                                selectedVideo === displayIndex
                                                    ? "4px solid"
                                                    : "",
                                            borderColor:
                                                selectedVideo === displayIndex
                                                    ? "primary.main"
                                                    : "",
                                            "&.Mui-selected": {
                                                bgcolor: "primary.light",
                                                borderLeft: "4px solid",
                                                borderColor: "primary.main",
                                            },
                                            "&:hover": {
                                                bgcolor: "action.hover",
                                            },
                                        }}>
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            {displayIndex === 0 ? (
                                                <Description color="info" />
                                            ) : currentCourse?.videos?.includes(
                                                  (displayIndex - 1).toString()
                                              ) ? (
                                                <CheckCircle color="success" />
                                            ) : lesson.type === "video" ? (
                                                <PlayCircle color="warning" />
                                            ) : lesson.type === "youtube" ? (
                                                <YouTube color="error" />
                                            ) : (
                                                <PictureAsPdf color="error" />
                                            )}
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 500,
                                                        color:
                                                            selectedVideo ===
                                                            displayIndex
                                                                ? "primary.main"
                                                                : "inherit",
                                                    }}>
                                                    Lesson {displayIndex + 1}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography
                                                    variant="caption"
                                                    noWrap
                                                    sx={{
                                                        color:
                                                            selectedVideo ===
                                                            displayIndex
                                                                ? "primary.main"
                                                                : "text.secondary",
                                                    }}>
                                                    {displayIndex === 0
                                                        ? "Course Overview"
                                                        : lesson.summary.split(
                                                              "\n"
                                                          )[0]}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};

export default Classroom;
