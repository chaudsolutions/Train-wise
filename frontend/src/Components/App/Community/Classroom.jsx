import { useEffect, useState } from "react";
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
    Grid,
    CircularProgress,
} from "@mui/material";
import Info from "@mui/icons-material/Info";
import PlayCircle from "@mui/icons-material/PlayCircle";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowForward from "@mui/icons-material/ArrowForward";
import YouTube from "@mui/icons-material/YouTube";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import Description from "@mui/icons-material/Description";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Download from "@mui/icons-material/Download";
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
import { useSearchParams } from "react-router-dom";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";
import GoBack from "../../Custom/Buttons/GoBack";

// PDF Viewer Component
const PDFViewer = ({ pdfUrl, title, height = "100%" }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    if (error) {
        return (
            <Box
                sx={{
                    p: 3,
                    textAlign: "center",
                    bgcolor: "background.paper",
                    height,
                }}>
                <Typography color="error" gutterBottom>
                    Failed to load PDF
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => window.open(pdfUrl, "_blank")}
                    startIcon={<Download />}>
                    Download PDF
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ height, display: "flex", flexDirection: "column" }}>
            {/* PDF Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                }}>
                <Typography variant="h6">{title || "PDF Document"}</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => window.open(pdfUrl, "_blank")}
                    startIcon={<Download />}>
                    Download
                </Button>
            </Box>

            {/* PDF Content */}
            <Box sx={{ flex: 1, bgcolor: "grey.100", position: "relative" }}>
                {loading && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "rgba(255, 255, 255, 0.8)",
                            zIndex: 1,
                        }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Loading PDF...</Typography>
                    </Box>
                )}

                <iframe
                    src={pdfUrl}
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                    }}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                        setLoading(false);
                        setError(true);
                    }}
                    title={title || "PDF Document"}
                />
            </Box>
        </Box>
    );
};

const Classroom = () => {
    const { width, height } = useWindowSize();
    const [hasCelebrated, setHasCelebrated] = useState(false);
    const { token } = useToken();
    const { isMobile } = useResponsive();
    const { useParams } = useReactRouter();
    const [searchParams, setSearchParams] = useSearchParams();
    const { communityId, courseId } = useParams();
    const { singleCourseData, isSingleCourseLoading } =
        useCommunitySingleCourseData({ communityId, courseId });

    const { userData, isUserDataLoading, refetchUserData } = useUserData();
    const { lessons, duration, name, summary, summaryPdfUrl } =
        singleCourseData || {};
    const { coursesWatched } = userData || {};
    const currentCourse = coursesWatched?.find(
        (course) => course?.courseId === courseId
    );

    const [selectedLesson, setSelectedLesson] = useState(0);
    const [showLessonSummary, setShowLessonSummary] = useState(false);

    const toggleSummary = () => setShowLessonSummary((prev) => !prev);

    // Create display lessons array with summary first
    const displayLessons = [
        {
            type: "summary",
            content: summary,
            summary,
            summaryPdfUrl: summaryPdfUrl,
        },
        ...(lessons || []),
    ];

    const currentLesson = displayLessons[selectedLesson];
    const completionPercentage = currentCourse?.lessons
        ? (currentCourse.lessons.length / lessons?.length) * 100
        : 0;

    const { startDate } = currentCourse || {};

    // Calculate lessons per week
    const lessonsPerWeek = lessons?.length
        ? Math.ceil(lessons.length / duration)
        : 0;

    useEffect(() => {
        if (searchParams.get("lesson")) {
            setSelectedLesson(parseInt(searchParams.get("lesson")));
        }
    }, [searchParams]);

    // Add this useEffect for confetti control
    useEffect(() => {
        if (completionPercentage >= 100 && !hasCelebrated) {
            setHasCelebrated(true);
        }
    }, [completionPercentage, hasCelebrated]);

    const handleContextMenu = (e) => {
        e.preventDefault();
    };

    const getYouTubeEmbedUrl = (url) => {
        const videoId = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    };

    useEffect(() => {
        // Only handle actual lessons (index > 0)
        if (selectedLesson === 0) return;

        const lessonIndex = selectedLesson - 1;

        // Check if lesson is already completed
        if (currentCourse?.lessons?.includes(lessonIndex.toString())) return;

        const markLessonAsWatched = async () => {
            try {
                await axios.put(
                    `${serVer}/user/mark-watched/${communityId}/course/${courseId}/${lessonIndex}`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success("Lesson marked as completed");
                refetchUserData();
            } catch (error) {
                toast.error(error.response?.data || "Failed to mark lesson");
            }
        };

        markLessonAsWatched();
    }, [
        selectedLesson,
        currentCourse,
        communityId,
        courseId,
        token,
        refetchUserData,
    ]);

    // Calculate current week
    const getCurrentWeek = () => {
        if (!startDate) return 1;

        const now = new Date();
        const diffTime = Math.abs(now - startDate);
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
        return Math.min(diffWeeks, duration);
    };

    const currentWeek = getCurrentWeek();

    // Function to determine if lesson is locked
    const isLessonLocked = (displayIndex) => {
        if (displayIndex === 0) return false; // Summary is always unlocked

        const lessonIndex = displayIndex - 1;
        const lessonWeek = Math.ceil((lessonIndex + 1) / lessonsPerWeek);

        return lessonWeek > currentWeek;
    };

    if (isSingleCourseLoading || isUserDataLoading) {
        return <PageLoader />;
    }

    return (
        <Box
            sx={{
                maxWidth: 1440,
                mx: "auto",
                p: 3,
                bgcolor: "background.default",
                minHeight: "100vh",
            }}>
            <GoBack />

            {/* confetti */}
            {completionPercentage >= 100 && (
                <ReactConfetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={500}
                    initialVelocityY={15}
                    tweenDuration={10000}
                    gravity={0.2}
                    colors={[
                        "#41b6e6", // Blue
                        "#ff585d", // Red
                        "#2dde98", // Green
                        "#ffd300", // Yellow
                    ]}
                    style={{ position: "fixed" }}
                />
            )}

            {/* Header Section */}
            <Card
                sx={{
                    mb: 3,
                    bgcolor: "primary.main",
                    boxShadow: 3,
                    borderRadius: 2,
                }}>
                <CardContent>
                    {completionPercentage >= 100 && (
                        <Typography
                            variant="h5"
                            textAlign="center"
                            sx={{
                                color: "common.white",
                                animation: "pulse 2s infinite",
                                "@keyframes pulse": {
                                    "0%": { opacity: 1 },
                                    "50%": { opacity: 0.6 },
                                    "100%": { opacity: 1 },
                                },
                            }}>
                            🎉 Course Completed! 🎉
                        </Typography>
                    )}
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
                                    currentLesson?.type === "pdf" ||
                                    currentLesson?.type === "summary"
                                        ? 600
                                        : "auto",
                            }}>
                            {currentLesson?.type === "summary" && (
                                <Box
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        bgcolor: "background.paper",
                                    }}>
                                    {currentLesson?.summaryPdfUrl ? (
                                        <PDFViewer
                                            pdfUrl={currentLesson.summaryPdfUrl}
                                            title="Course Overview PDF"
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                p: 4,
                                                height: "100%",
                                                overflowY: "auto",
                                            }}>
                                            <Typography
                                                variant="h4"
                                                gutterBottom>
                                                Course Overview
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                whiteSpace="pre-wrap"
                                                sx={{
                                                    color: "text.secondary",
                                                }}>
                                                {currentLesson?.summary ||
                                                    "No course overview available"}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}

                            {currentLesson?.type === "video" && (
                                <video
                                    controls
                                    key={selectedLesson}
                                    controlsList="nodownload"
                                    disablePictureInPicture
                                    onContextMenu={handleContextMenu}
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
                                <PDFViewer
                                    pdfUrl={currentLesson?.content}
                                    title={`Lesson ${selectedLesson} PDF`}
                                />
                            )}
                        </Box>

                        <Box m={2}>
                            {/* Summary Toggle Button - Show if there's any summary content */}
                            {currentLesson?.type !== "summary" &&
                                (currentLesson?.summary ||
                                    currentLesson?.summaryPdfUrl) && (
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

                            {/* Summary Panel - Show PDF or text summary */}
                            {(currentLesson?.summary ||
                                currentLesson?.summaryPdfUrl) && (
                                <Collapse in={showLessonSummary}>
                                    <Box
                                        sx={{
                                            bgcolor: "background.paper",
                                            boxShadow: 3,
                                            maxHeight: "40vh",
                                            overflow: "hidden",
                                        }}>
                                        {currentLesson?.summaryPdfUrl ? (
                                            <PDFViewer
                                                pdfUrl={
                                                    currentLesson.summaryPdfUrl
                                                }
                                                title="Lesson Summary PDF"
                                                height="300px"
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    maxHeight: "300px",
                                                    overflowY: "auto",
                                                }}>
                                                <Typography variant="h6">
                                                    Lesson Summary
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    whiteSpace="pre-wrap"
                                                    sx={{
                                                        color: "text.secondary",
                                                        mt: 1,
                                                    }}>
                                                    {currentLesson?.summary}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Collapse>
                            )}
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
                                disabled={selectedLesson === 0}
                                onClick={() => {
                                    setSelectedLesson((prev) => prev - 1);
                                    setSearchParams({
                                        lesson: selectedLesson - 1,
                                    });
                                }}
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
                                Lesson {selectedLesson + 1} of{" "}
                                {displayLessons?.length}
                            </Typography>

                            <IconButton
                                disabled={
                                    selectedLesson ===
                                    displayLessons?.length - 1
                                }
                                onClick={() => {
                                    setSelectedLesson((prev) => prev + 1);
                                    setSearchParams({
                                        lesson: selectedLesson + 1,
                                    });
                                }}
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
                                {displayLessons?.map((lesson, displayIndex) => {
                                    const lessonIndex = displayIndex - 1;
                                    const isCompleted =
                                        currentCourse?.lessons?.includes(
                                            lessonIndex.toString()
                                        );
                                    const isLocked =
                                        isLessonLocked(displayIndex);
                                    const isCurrent =
                                        selectedLesson === displayIndex;

                                    return (
                                        <ListItem
                                            key={displayIndex}
                                            button
                                            selected={
                                                selectedLesson === displayIndex
                                            }
                                            onClick={() => {
                                                if (!isLocked) {
                                                    setSelectedLesson(
                                                        displayIndex
                                                    );
                                                    setSearchParams({
                                                        lesson: displayIndex,
                                                    });
                                                }
                                            }}
                                            disabled={isLocked}
                                            sx={{
                                                borderRadius: 1,
                                                cursor: isLocked
                                                    ? "not-allowed"
                                                    : "pointer",
                                                transition: "all 0.2s",
                                                bgcolor: isCurrent
                                                    ? "action.hover"
                                                    : "",
                                                borderLeft: isCurrent
                                                    ? "4px solid"
                                                    : "",
                                                borderColor: isCurrent
                                                    ? "primary.main"
                                                    : "",
                                                opacity: isLocked ? 0.6 : 1,
                                                "&.Mui-selected": {
                                                    bgcolor: "primary.light",
                                                    borderLeft: "4px solid",
                                                    borderColor: "primary.main",
                                                },
                                                "&:hover": {
                                                    bgcolor: isLocked
                                                        ? "inherit"
                                                        : "action.hover",
                                                },
                                            }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                {isLocked ? (
                                                    <LockIcon color="disabled" />
                                                ) : displayIndex === 0 ? (
                                                    <Description color="info" />
                                                ) : lesson.type === "video" ? (
                                                    <PlayCircle
                                                        color={
                                                            isCurrent
                                                                ? "primary"
                                                                : "action"
                                                        }
                                                    />
                                                ) : lesson.type ===
                                                  "youtube" ? (
                                                    <YouTube color="error" />
                                                ) : (
                                                    <PictureAsPdf color="error" />
                                                )}
                                            </ListItemIcon>

                                            <ListItemText
                                                primary={
                                                    <Grid
                                                        container
                                                        alignItems="center"
                                                        spacing={2}>
                                                        <Grid size={6}>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    color: isCurrent
                                                                        ? "primary.main"
                                                                        : "inherit",
                                                                }}>
                                                                Lesson{" "}
                                                                {displayIndex +
                                                                    1}
                                                            </Typography>
                                                        </Grid>

                                                        <Grid size={5}>
                                                            <Chip
                                                                label={`Week ${Math.ceil(
                                                                    displayIndex /
                                                                        lessonsPerWeek
                                                                )}`}
                                                                size="small"
                                                                sx={{ ml: 1 }}
                                                            />
                                                        </Grid>

                                                        <Grid size={1}>
                                                            {isCompleted && (
                                                                <CheckCircle
                                                                    color="success"
                                                                    fontSize="small"
                                                                />
                                                            )}
                                                        </Grid>
                                                    </Grid>
                                                }
                                                secondary={
                                                    isLocked ? (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary">
                                                            Available in week{" "}
                                                            {Math.ceil(
                                                                displayIndex /
                                                                    lessonsPerWeek
                                                            )}
                                                        </Typography>
                                                    ) : (
                                                        <Typography
                                                            variant="caption"
                                                            noWrap
                                                            sx={{
                                                                color: isCurrent
                                                                    ? "primary.main"
                                                                    : "text.secondary",
                                                            }}>
                                                            {displayIndex === 0
                                                                ? "Course Overview"
                                                                : // Handle lessons without summaries
                                                                lesson.summary ||
                                                                  lesson.summaryPdfUrl
                                                                ? "Has summary content"
                                                                : "No summary available"}
                                                        </Typography>
                                                    )
                                                }
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};

export default Classroom;
