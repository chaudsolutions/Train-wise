import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
    useTheme,
    IconButton,
    Paper,
    Button,
    LinearProgress,
    Grid,
    CardMedia,
    Card,
    CardContent,
    ListItemAvatar,
    Badge,
    Avatar,
    TextField,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContentText,
    DialogContent,
    DialogActions,
    Tooltip,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Menu,
    MenuItem,
    ListItemIcon,
    Tabs,
    Tab,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import BalanceIcon from "@mui/icons-material/AccountBalanceWallet";
import MembersIcon from "@mui/icons-material/People";
import EmailIcon from "@mui/icons-material/Email";
import CheckIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from "@mui/icons-material/Info";
import PlayIcon from "@mui/icons-material/PlayCircleOutline";
import SendIcon from "@mui/icons-material/Send";
import OnlineIcon from "@mui/icons-material/Circle";
import People from "@mui/icons-material/People";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import RejectedIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Schedule";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ClosedIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { format, isAfter, isBefore, isToday, parseISO } from "date-fns";
import { useReactRouter } from "../../Hooks/useReactRouter";
import CourseStockImg from "../../../assets/courseStock.png";
import { useEffect, useRef, useState } from "react";
import { serVer, useToken } from "../../Hooks/useVariable";
import axios from "axios";
import toast from "react-hot-toast";
import useResponsive from "../../Hooks/useResponsive";
import CloudStorage from "./CloudStorage";
import { useCommunityCalendarData } from "../../Hooks/useQueryFetch/useQueryData";
import { getToken } from "../../Hooks/useFetch";

export const CommunityOverview = ({ notifications, createdAt }) => {
    const theme = useTheme();

    const notNew = new Date(
        new Date(createdAt).getTime() + 7 * 24 * 60 * 60 * 1000
    ); // 7 days

    return (
        <Box sx={{ mt: 2 }}>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                }}>
                <Typography variant="h6" fontSize="1rem" fontWeight="bold">
                    Notifications
                </Typography>
            </Box>

            {/* Notifications List */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: "hidden",
                }}>
                <List disablePadding>
                    {/* Welcome Notification */}
                    <ListItem
                        sx={{
                            px: 3,
                            py: 2,
                            bgcolor: theme.palette.primary.light,
                            "&:hover": {
                                bgcolor: theme.palette.primary.light,
                            },
                        }}>
                        <ListItemText
                            primary={
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 0.5,
                                    }}>
                                    <InfoIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography
                                        variant="subtitle1"
                                        fontWeight="medium">
                                        Welcome to the community!
                                    </Typography>
                                </Box>
                            }
                            secondary={
                                <Typography
                                    variant="caption"
                                    color="text.secondary">
                                    {new Date(createdAt).toLocaleDateString(
                                        "en-US",
                                        {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        }
                                    )}
                                </Typography>
                            }
                            sx={{ m: 0 }}
                        />
                        {new Date() >= notNew && (
                            <Chip
                                label="New"
                                size="small"
                                color="primary"
                                sx={{ ml: 2 }}
                            />
                        )}
                    </ListItem>

                    {notifications?.length > 0 ? (
                        notifications.map((notification) => (
                            <Box key={notification?._id}>
                                <Divider />
                                <ListItem
                                    sx={{
                                        px: 3,
                                        py: 2,
                                        "&:hover": {
                                            bgcolor: theme.palette.action.hover,
                                        },
                                    }}>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="body1"
                                                fontWeight="medium">
                                                {notification?.message}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography
                                                variant="caption"
                                                color="text.secondary">
                                                {new Date(
                                                    notification?.createdAt
                                                ).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </Typography>
                                        }
                                        sx={{ m: 0 }}
                                    />
                                </ListItem>
                            </Box>
                        ))
                    ) : (
                        <Box sx={{ p: 3, textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                No new notifications
                            </Typography>
                        </Box>
                    )}
                </List>
            </Paper>
        </Box>
    );
};

export const CommunityClassroom = ({
    isCommunityAdmin,
    communityId,
    courses,
    coursesWatched,
}) => {
    const theme = useTheme();
    const { Link } = useReactRouter();

    const getThumbnailUrl = (lessons) => {
        if (!lessons || lessons.length === 0) return CourseStockImg;

        // Search for first available video or youtube lesson
        const videoLesson = lessons.find(
            (lesson) => lesson.type === "video" || lesson.type === "youtube"
        );

        if (videoLesson) {
            // Handle YouTube thumbnail
            if (videoLesson.type === "youtube") {
                const videoId = videoLesson.content.match(
                    /(?:v=|\/)([a-zA-Z0-9_-]{11})/
                )?.[1];
                return videoId
                    ? `https://img.youtube.com/vi/${videoId}/0.jpg`
                    : CourseStockImg;
            }

            // Handle video file thumbnail
            if (videoLesson.type === "video") {
                const videoExtensions = [
                    ".mp4",
                    ".mov",
                    ".avi",
                    ".mkv",
                    ".webm",
                    ".flv",
                    ".wmv",
                    ".mpeg",
                    ".mpg",
                    ".3gp",
                ];
                const videoPattern = new RegExp(
                    `(${videoExtensions.join("|")})$`,
                    "i"
                );
                return videoLesson.content.replace(videoPattern, ".jpg");
            }
        }

        // Fallback to PDF thumbnail or default image
        const pdfLesson = lessons.find((lesson) => lesson.type === "pdf");
        return pdfLesson ? CourseStockImg : CourseStockImg;
    };

    const getProgress = (course) => {
        if (!coursesWatched || !course?.lessons) return 0;
        const courseWatched = coursesWatched.find(
            (cw) => cw.courseId.toString() === course._id.toString()
        );
        if (!courseWatched || !courseWatched.lessons) return 0;
        const totalLessons = course.lessons.length;
        const watchedLessons = courseWatched.lessons.length;
        const progress = (watchedLessons / totalLessons) * 100;
        return Math.round(progress);
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Here you can access all the courses and learning materials.
            </Typography>

            {courses && courses.length > 0 ? (
                <Grid container spacing={3}>
                    {courses.map((course) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course._id}>
                            <Card
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    transition:
                                        "transform 0.3s ease, box-shadow 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-5px)",
                                        boxShadow: theme.shadows[6],
                                    },
                                }}>
                                <CardMedia
                                    component="img"
                                    height="160"
                                    image={getThumbnailUrl(course?.lessons)}
                                    alt={course.name}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography
                                        gutterBottom
                                        variant="h6"
                                        component="div">
                                        {course.name}
                                    </Typography>
                                    <Chip
                                        label={`${course?.duration} weeks`}
                                        size="small"
                                        sx={{
                                            mb: 2,
                                            bgcolor:
                                                theme.palette.primary.light,
                                            color: theme.palette.primary
                                                .contrastText,
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            mb: 1,
                                        }}>
                                        <Tooltip
                                            title={`${
                                                (getProgress(course) / 100) *
                                                course?.lessons.length
                                            }/${
                                                course?.lessons.length
                                            } lessons completed`}
                                            arrow>
                                            <LinearProgress
                                                variant="determinate"
                                                value={getProgress(course)}
                                                sx={{
                                                    flexGrow: 1,
                                                    height: 8,
                                                    borderRadius: 4,
                                                    mr: 1,
                                                    "& .MuiLinearProgress-bar":
                                                        {
                                                            backgroundColor:
                                                                theme.palette
                                                                    .primary
                                                                    .main,
                                                        },
                                                }}
                                            />
                                        </Tooltip>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary">
                                            {getProgress(course)}%
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <Button
                                    component={Link}
                                    to={`course/${course._id}`}
                                    startIcon={<PlayIcon />}
                                    sx={{
                                        mx: 2,
                                        mb: 2,
                                        bgcolor: theme.palette.primary.main,
                                        color: theme.palette.primary
                                            .contrastText,
                                        "&:hover": {
                                            bgcolor: theme.palette.primary.dark,
                                        },
                                    }}>
                                    View Course
                                </Button>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        textAlign: "center",
                        borderRadius: 3,
                        border: `1px dashed ${theme.palette.divider}`,
                    }}>
                    <Typography variant="body1" color="text.secondary">
                        No courses available yet
                    </Typography>
                </Paper>
            )}

            {isCommunityAdmin && (
                <Box
                    sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                    <Button
                        component={Link}
                        to={`/creator/${communityId}/add-course`}
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        sx={{
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 600,
                        }}>
                        Add Course
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export const CommunityChatroom = ({
    isSuperAdmin,
    communityId,
    userId,
    createdBy,
}) => {
    const theme = useTheme();
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const eventSourceRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [sending, setIsSending] = useState(false);
    const [showOnlineUsers, setShowOnlineUsers] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { token } = useToken();
    const { isMobile } = useResponsive();

    // Format time for display
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Connect to SSE
    useEffect(() => {
        const url = new URL(
            `${serVer}/api/communities/${communityId}/messages/stream`
        );

        const connectToSSE = () => {
            const eventSource = new EventSource(url.toString());

            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                setIsConnected(true);
                console.log("SSE connection opened");
            };

            eventSource.addEventListener("initial", (e) => {
                const { messages, onlineUsers } = JSON.parse(e.data);

                setMessages(messages);
                setOnlineUsers(onlineUsers);
            });

            eventSource.addEventListener("newMessage", (e) => {
                const newMessage = JSON.parse(e.data);

                setMessages((prev) => [...prev, newMessage]);
            });

            eventSource.addEventListener("deleteMessage", (e) => {
                const { _id } = JSON.parse(e.data);

                setMessages((prev) => prev.filter((msg) => msg._id !== _id));
            });

            eventSource.addEventListener("onlineUsers", (e) => {
                const updatedOnlineUsers = JSON.parse(e.data);

                setOnlineUsers(updatedOnlineUsers);
            });

            eventSource.onerror = (err) => {
                console.error("EventSource failed:", err);
                setIsConnected(false);
                eventSource.close();
                setTimeout(connectToSSE, 5000);
            };
        };

        connectToSSE();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                console.log("SSE connection closed");
            }
        };
    }, [communityId, token]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        const container = chatContainerRef.current;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    // Handle sending a new message
    const handleSendMessage = async () => {
        if (!messageInput.trim()) return;

        setIsSending(true);
        try {
            await axios.put(
                `${serVer}/user/${communityId}/send/messages`,
                { content: messageInput },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMessageInput("");
            toast.success("Sent");
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    // Handle key press (Enter to send)
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Handle opening delete confirmation dialog
    const handleOpenDeleteDialog = (messageId) => {
        setMessageToDelete(messageId);
        setDeleteDialogOpen(true);
    };

    // Handle closing delete confirmation dialog
    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setMessageToDelete(null);
    };

    // Handle deleting a message
    const handleDeleteMessage = async () => {
        if (!messageToDelete) return;

        setIsDeleting(true);

        try {
            const response = await axios.delete(
                `${serVer}/creator/${communityId}/delete-message/${messageToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(response.data);
        } catch (error) {
            console.error("Failed to delete message:", error);
            toast.error(error.response?.data || "Failed to delete message");
        } finally {
            setIsDeleting(false);
            handleCloseDeleteDialog();
        }
    };

    // Online Users List Component
    const OnlineUsersList = () => (
        <Paper
            elevation={0}
            sx={{
                width: { xs: "100%", md: 250 },
                p: 2,
                borderRight: { md: `1px solid ${theme.palette.divider}` },
                borderBottom: {
                    xs: `1px solid ${theme.palette.divider}`,
                    md: "none",
                },
                display: "flex",
                flexDirection: "column",
                bgcolor: theme.palette.background.default,
            }}>
            <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 2 }}>
                Online Members ({onlineUsers.length})
            </Typography>
            <List dense>
                {onlineUsers.map((user) => (
                    <ListItem key={user.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                            <Badge
                                overlap="circular"
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                }}
                                badgeContent={
                                    <OnlineIcon
                                        color="success"
                                        sx={{ fontSize: "0.8rem" }}
                                    />
                                }>
                                <Avatar
                                    src={user.avatar}
                                    alt={user.name}
                                    sx={{ width: 32, height: 32 }}
                                />
                            </Badge>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="body2">
                                    {user.name}
                                </Typography>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Chat Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: "12px 12px 0 0",
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.background.paper,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        width: "100%",
                    }}>
                    <Typography variant="h6" fontSize=".9rem" fontWeight="bold">
                        Chat
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Chip
                            label={isConnected ? "Live" : "Connecting..."}
                            size="small"
                            color={isConnected ? "success" : "warning"}
                            icon={<OnlineIcon fontSize="small" />}
                        />
                        {isMobile && (
                            <IconButton
                                size="small"
                                onClick={() =>
                                    setShowOnlineUsers(!showOnlineUsers)
                                }
                                sx={{
                                    bgcolor: showOnlineUsers
                                        ? theme.palette.action.selected
                                        : "transparent",
                                }}>
                                <People fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                </Box>
            </Paper>

            {/* Main Chat Area */}
            <Box
                sx={{
                    display: "flex",
                    flexGrow: 1,
                    overflow: "hidden",
                    flexDirection: { xs: "column", md: "row" },
                }}>
                {/* Conditionally render Online Users for mobile */}
                {isMobile && showOnlineUsers && <OnlineUsersList />}

                {/* Always render Online Users for desktop */}
                {!isMobile && <OnlineUsersList />}

                {/* Chat Messages */}
                <Box
                    sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}>
                    {/* Messages Container */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            p: 1,
                            overflowY: "auto",
                            bgcolor: theme.palette.background.paper,
                            backgroundImage:
                                "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",

                            border: `1px solid ${theme.palette.primary.light}`,
                        }}>
                        <List
                            ref={chatContainerRef}
                            sx={{
                                width: "100%",
                                height: "30vh",
                                minHeight: "20rem",
                                overflowY: "scroll",
                                scrollbarWidth: "thin",
                            }}>
                            {messages.length === 0 ? (
                                <Typography
                                    textAlign="center"
                                    variant="body2"
                                    component="p"
                                    fontSize=".8rem">
                                    No messages yet
                                </Typography>
                            ) : (
                                messages.map((msg) => (
                                    <Box
                                        key={
                                            msg._id ||
                                            msg.sender._id + msg.content
                                        }>
                                        <ListItem
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent:
                                                    msg.sender._id === userId
                                                        ? "flex-end"
                                                        : "flex-start",
                                                px: 0,
                                                py: 0.5,
                                            }}>
                                            {msg.sender._id !== userId && (
                                                <ListItemAvatar
                                                    sx={{
                                                        minWidth: 40,
                                                        alignSelf: "flex-start",
                                                    }}>
                                                    <Avatar
                                                        src={msg.sender.avatar}
                                                        alt={msg.sender.name}
                                                    />
                                                </ListItemAvatar>
                                            )}
                                            <Box
                                                sx={{
                                                    maxWidth: "70%",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems:
                                                        msg.sender._id ===
                                                        userId
                                                            ? "flex-end"
                                                            : "flex-start",
                                                }}>
                                                {msg.sender._id !== userId && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary">
                                                        {msg.sender._id ===
                                                        createdBy
                                                            ? "Creator"
                                                            : msg.sender.name}
                                                    </Typography>
                                                )}
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        px: 2,
                                                        py: 0.5,
                                                        borderRadius:
                                                            msg.sender._id ===
                                                            userId
                                                                ? "18px 18px 0 18px"
                                                                : "18px 18px 18px 0",
                                                        bgcolor:
                                                            msg.sender._id ===
                                                            userId
                                                                ? theme.palette
                                                                      .primary
                                                                      .main
                                                                : theme.palette
                                                                      .grey[100],
                                                        color:
                                                            msg.sender._id ===
                                                            userId
                                                                ? theme.palette
                                                                      .primary
                                                                      .contrastText
                                                                : "inherit",
                                                    }}>
                                                    <Typography variant="body1">
                                                        {msg.content}
                                                    </Typography>
                                                </Paper>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    fontSize=".6rem"
                                                    sx={{ mt: 0.5 }}>
                                                    {formatTime(msg.createdAt)}
                                                </Typography>
                                            </Box>
                                            {/* delete button for admin and community creator */}
                                            {isSuperAdmin && (
                                                <IconButton
                                                    color="error"
                                                    onClick={() =>
                                                        handleOpenDeleteDialog(
                                                            msg._id
                                                        )
                                                    }>
                                                    <DeleteForeverIcon color="error" />
                                                </IconButton>
                                            )}
                                        </ListItem>
                                        <Divider
                                            variant="inset"
                                            component="li"
                                            sx={{ opacity: 0.5 }}
                                        />
                                    </Box>
                                ))
                            )}
                        </List>
                    </Box>

                    {/* Message Input */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: "0 0 12px 12px",
                            borderTop: `1px solid ${theme.palette.divider}`,
                            bgcolor: theme.palette.background.paper,
                        }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}>
                            <TextField
                                fullWidth
                                placeholder="Type your message..."
                                variant="outlined"
                                size="small"
                                value={messageInput}
                                onChange={(e) =>
                                    setMessageInput(e.target.value)
                                }
                                onKeyPress={handleKeyPress}
                                maxRows={2}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 20,
                                        bgcolor:
                                            theme.palette.background.default,
                                    },
                                }}
                            />
                            <IconButton
                                size="large"
                                onClick={handleSendMessage}
                                disabled={!messageInput.trim() || !isConnected}
                                sx={{
                                    bgcolor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    "&:hover": {
                                        bgcolor: theme.palette.primary.dark,
                                    },
                                    "&:disabled": {
                                        bgcolor:
                                            theme.palette.action
                                                .disabledBackground,
                                    },
                                }}>
                                {sending ? (
                                    <CircularProgress size={22} color="black" />
                                ) : (
                                    <SendIcon />
                                )}
                            </IconButton>
                        </Box>
                    </Paper>
                </Box>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="delete-message-dialog-title"
                aria-describedby="delete-message-dialog-description">
                <DialogTitle id="delete-message-dialog-title">
                    Delete Message
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-message-dialog-description">
                        Are you sure you want to delete this message? This
                        action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        onClick={handleCloseDeleteDialog}
                        color="primary">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleDeleteMessage}
                        color="error"
                        autoFocus>
                        {isDeleting ? <CircularProgress size={20} /> : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export const CommunityInventory = ({
    community,
    refetchCommunity,
    setActiveTab,
}) => {
    const theme = useTheme();

    const { token } = useToken();
    const [loading, setLoading] = useState(false);
    const [renewalLoading, setRenewalLoading] = useState(false);

    const {
        balance = 0,
        _id,
        cloudStorageLimit,
        cloudStorageUsed,
        renewalDate,
        members = [],
        createdBy,
    } = community || {};

    // Calculate days until renewal
    const daysUntilRenewal = renewalDate
        ? Math.ceil(
              (new Date(renewalDate) - Date.now()) / (1000 * 60 * 60 * 24)
          )
        : null;

    // Calculate renewal progress (percentage of time passed)
    const renewalProgress = () => {
        if (!renewalDate || !community.createdAt) return 0;

        const totalDuration =
            new Date(renewalDate) - new Date(community.createdAt);
        const timePassed = Date.now() - new Date(community.createdAt);
        return Math.min(100, (timePassed / totalDuration) * 100);
    };

    const getRenewalColor = () => {
        if (!daysUntilRenewal) return "primary";
        if (daysUntilRenewal <= 7) return "error";
        if (daysUntilRenewal <= 30) return "warning";
        return "success";
    };

    const withdrawCommunityBalance = async () => {
        setLoading(true);
        try {
            const res = await axios.put(
                `${serVer}/creator/withdraw/${_id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data);
            refetchCommunity();
        } catch (error) {
            toast.error(error?.response?.data || "Withdrawal failed");
        } finally {
            setLoading(false);
        }
    };
    const handleRenewal = async () => {
        setRenewalLoading(true);
        try {
            // Simulate renewal payment processing
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Extend renewal by 1 year
            const newRenewalDate = new Date();
            newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);

            // Update renewal date in backend
            const res = await axios.put(
                `${serVer}/creator/renew/${_id}`,
                { renewalDate: newRenewalDate.toISOString() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(res.data);
            refetchCommunity();
        } catch (error) {
            toast.error(error?.response?.data || "Renewal failed");
        } finally {
            setRenewalLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not set";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <>
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: theme.palette.background.paper,
                    backgroundImage: `linear-gradient(145deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                    position: "relative",
                    "&:before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "100%",
                        height: "4px",
                        background: theme.palette.primary.main,
                        zIndex: 1,
                    },
                }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}>
                    <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="text.primary">
                        Community Dashboard
                    </Typography>
                    <Box display="flex" gap={1}>
                        <Typography variant="caption" color="text.secondary">
                            Community ID: {_id?.slice(-6)}
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Balance Card */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper
                            sx={{
                                p: 2.5,
                                height: "100%",
                                borderRadius: 3,
                                borderLeft: `4px solid ${theme.palette.primary.main}`,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                background:
                                    theme.palette.mode === "dark"
                                        ? "linear-gradient(45deg, #1a237e, #311b92)"
                                        : "linear-gradient(45deg, #e3f2fd, #bbdefb)",
                            }}>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={1.5}
                                mb={2}>
                                <BalanceIcon fontSize="large" color="primary" />
                                <Typography variant="h6" fontWeight="bold">
                                    Community Balance
                                </Typography>
                            </Box>

                            <Box mb={2}>
                                <Typography
                                    variant="h3"
                                    fontWeight="bold"
                                    sx={{
                                        fontFamily: "monospace",
                                        letterSpacing: 1,
                                        color: theme.palette.primary.dark,
                                    }}>
                                    ${balance.toFixed(2)}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary">
                                    Available for withdrawal
                                </Typography>
                            </Box>

                            <Button
                                variant="contained"
                                color="primary"
                                onClick={withdrawCommunityBalance}
                                disabled={loading || balance <= 0}
                                fullWidth
                                sx={{
                                    borderRadius: 2,
                                    py: 1.5,
                                    fontWeight: "bold",
                                    boxShadow: "none",
                                    "&:hover": {
                                        boxShadow: `0 4px 12px ${theme.palette.primary.light}`,
                                    },
                                }}>
                                {loading ? (
                                    <CircularProgress
                                        size={24}
                                        color="inherit"
                                    />
                                ) : (
                                    "Withdraw Funds"
                                )}
                            </Button>
                        </Paper>
                    </Grid>

                    {/* Members Card */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper
                            sx={{
                                p: 2.5,
                                height: "100%",
                                borderRadius: 3,
                                borderLeft: `4px solid ${theme.palette.secondary.main}`,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                background:
                                    theme.palette.mode === "dark"
                                        ? "linear-gradient(45deg, #004d40, #00695c)"
                                        : "linear-gradient(45deg, #e8f5e9, #c8e6c9)",
                            }}>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={1.5}
                                mb={2}>
                                <MembersIcon
                                    fontSize="large"
                                    color="secondary"
                                />
                                <Typography variant="h6" fontWeight="bold">
                                    Community Members
                                </Typography>
                            </Box>

                            <Box mb={2}>
                                <Typography
                                    variant="h3"
                                    fontWeight="bold"
                                    sx={{
                                        fontFamily: "monospace",
                                        letterSpacing: 1,
                                        color: theme.palette.secondary.dark,
                                    }}>
                                    {members.length}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary">
                                    Active members
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="body2" mb={1}>
                                    <Box component="span" fontWeight="bold">
                                        Creator:
                                    </Box>{" "}
                                    {createdBy?.name || "N/A"}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    fullWidth
                                    onClick={() => setActiveTab("members")}
                                    sx={{ borderRadius: 2 }}>
                                    View Members
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Storage Card */}
                    <CloudStorage
                        cloudStorageLimit={cloudStorageLimit}
                        cloudStorageUsed={cloudStorageUsed}
                        communityId={_id}
                        refetchCommunity={refetchCommunity}
                    />

                    {/* Renewal Card */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper
                            sx={{
                                p: 2.5,
                                height: "100%",
                                borderRadius: 3,
                                borderLeft: `4px solid ${theme.palette.info.main}`,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                background:
                                    theme.palette.mode === "dark"
                                        ? "linear-gradient(45deg, #01579b, #0288d1)"
                                        : "linear-gradient(45deg, #e1f5fe, #b3e5fc)",
                            }}>
                            <Box
                                display="flex"
                                alignItems="center"
                                gap={1.5}
                                mb={2}>
                                <EventRepeatIcon
                                    fontSize="large"
                                    color="info"
                                />
                                <Typography variant="h6" fontWeight="bold">
                                    Subscription Renewal
                                </Typography>
                            </Box>

                            <Box mb={2}>
                                <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    gutterBottom>
                                    Renewal Date: {formatDate(renewalDate)}
                                </Typography>

                                {daysUntilRenewal > 0 ? (
                                    <>
                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            color={getRenewalColor()}
                                            sx={{ mb: 1 }}>
                                            {daysUntilRenewal} days left
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={renewalProgress()}
                                            color={getRenewalColor()}
                                            sx={{ height: 10, borderRadius: 5 }}
                                        />
                                    </>
                                ) : (
                                    <Typography
                                        variant="h5"
                                        color="error"
                                        fontWeight="bold">
                                        Subscription Expired
                                    </Typography>
                                )}
                            </Box>

                            <Button
                                variant="contained"
                                color="info"
                                onClick={handleRenewal}
                                disabled={renewalLoading}
                                startIcon={
                                    renewalLoading ? (
                                        <CircularProgress
                                            size={20}
                                            color="inherit"
                                        />
                                    ) : (
                                        <EventAvailableIcon />
                                    )
                                }
                                fullWidth
                                sx={{
                                    borderRadius: 2,
                                    py: 1.5,
                                    fontWeight: "bold",
                                    color: theme.palette.getContrastText(
                                        theme.palette.info.main
                                    ),
                                }}>
                                {renewalLoading ? "Processing..." : "Renew Now"}
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
        </>
    );
};

// add a member component
export const AddMember = ({ communityId, refetchCommunity }) => {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [email, setEmail] = useState("");
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { token } = useToken();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleSearch = async () => {
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        setError("");
        setUserData(null);

        try {
            const res = await axios.put(
                `${serVer}/creator/search-member/${communityId}`,
                {
                    email: email.trim().toLowerCase(),
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setUserData(res.data);
            setActiveStep(1);
        } catch (err) {
            setError(err.response?.data || "Failed to fetch user data");
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        setLoading(true);
        setError("");
        try {
            await axios.put(
                `${serVer}/creator/add-member/${communityId}`,
                {
                    userId: userData._id,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setActiveStep(2);
            refetchCommunity();
        } catch (err) {
            setError(err.response?.data || "Failed to add member");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setActiveStep(0);
        setEmail("");
        setUserData(null);
        setError("");
    };

    const steps = [
        {
            label: "Search User",
            description: "Enter the email address of the user you want to add",
        },
        {
            label: "Confirm Details",
            description: "Verify user information before adding to community",
        },
        {
            label: "Complete",
            description: "User has been successfully added",
        },
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 4,
                p: 1,
                background: theme.palette.background.paper,
            }}>
            <Typography variant="h5" fontWeight={700} mb={3} color="primary">
                Add New Member
            </Typography>

            <Stepper activeStep={activeStep} orientation="vertical">
                {/* Step 1: Search User */}
                <Step>
                    <StepLabel
                        StepIconProps={{
                            sx: {
                                "& .MuiStepIcon-root": {
                                    color: theme.palette.primary.main,
                                },
                            },
                        }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            {steps[0].label}
                        </Typography>
                    </StepLabel>
                    <StepContent>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={2}>
                            {steps[0].description}
                        </Typography>

                        <TextField
                            fullWidth
                            variant="outlined"
                            label="User Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <EmailIcon
                                        sx={{
                                            color: theme.palette.action.active,
                                            mr: 1,
                                        }}
                                    />
                                ),
                            }}
                            onKeyPress={(e) =>
                                e.key === "Enter" && handleSearch()
                            }
                            error={!!error}
                            helperText={error}
                            sx={{ mb: 2 }}
                        />

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSearch}
                            disabled={loading || !email}
                            startIcon={
                                loading ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <SearchIcon />
                                )
                            }
                            sx={{ borderRadius: 2, fontWeight: 600 }}>
                            Search User
                        </Button>
                    </StepContent>
                </Step>

                {/* Step 2: Confirm Details */}
                <Step>
                    <StepLabel>
                        <Typography variant="subtitle1" fontWeight={600}>
                            {steps[1].label}
                        </Typography>
                    </StepLabel>
                    <StepContent>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={2}>
                            {steps[1].description}
                        </Typography>

                        {userData && (
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    mb: 3,
                                    borderBottom: `4px solid ${theme.palette.primary.main}`,
                                    boxShadow: theme.shadows[2],
                                }}>
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid size={12} align="center">
                                            <Avatar
                                                src={userData?.avatar}
                                                alt={userData.name}
                                                sx={{
                                                    width: 64,
                                                    height: 64,
                                                    bgcolor:
                                                        theme.palette.primary
                                                            .main,
                                                    fontSize: 24,
                                                    fontWeight: 700,
                                                }}>
                                                {userData?.avatar ||
                                                    userData.name.charAt(0)}
                                            </Avatar>
                                        </Grid>
                                        <Grid size={12} align="center">
                                            <Typography
                                                variant="h6"
                                                fontWeight={700}>
                                                {userData.name}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary">
                                                {userData.email}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}

                        {error && (
                            <Typography
                                variant="body2"
                                color="error"
                                sx={{ mb: 2 }}>
                                {error}
                            </Typography>
                        )}

                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                                variant="outlined"
                                onClick={() => setActiveStep(0)}
                                sx={{ borderRadius: 2, fontWeight: 600 }}>
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAddMember}
                                disabled={loading}
                                startIcon={
                                    loading ? (
                                        <CircularProgress size={20} />
                                    ) : (
                                        <AddIcon />
                                    )
                                }
                                sx={{ borderRadius: 2, fontWeight: 600 }}>
                                {loading ? "Adding..." : "Add User"}
                            </Button>
                        </Box>
                    </StepContent>
                </Step>

                {/* Step 3: Complete */}
                <Step>
                    <StepLabel>
                        <Typography variant="subtitle1" fontWeight={600}>
                            {steps[2].label}
                        </Typography>
                    </StepLabel>
                    <StepContent>
                        <Box
                            sx={{
                                textAlign: "center",
                                p: 3,
                                borderRadius: 3,
                                border: `1px solid ${theme.palette.success.main}`,
                            }}>
                            <CheckIcon
                                sx={{
                                    fontSize: 64,
                                    color: theme.palette.success.main,
                                    mb: 2,
                                }}
                            />
                            <Typography variant="h6" fontWeight={700} mb={1}>
                                Member Added Successfully!
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {userData?.name} has been added to your
                                community
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleReset}
                            sx={{
                                mt: 3,
                                borderRadius: 2,
                                fontWeight: 600,
                                px: 4,
                            }}>
                            Add Another Member
                        </Button>
                    </StepContent>
                </Step>
            </Stepper>
        </Paper>
    );
};

// calendars tab
export const CalendarTab = ({
    communityId,
    setActiveTab,
    setEventData,
    isCommunityAdmin,
}) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [newEventDate, setNewEventDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeStatusTab, setActiveStatusTab] = useState(0);
    const theme = useTheme();

    const {
        communityCalendarData,
        isCommunityCalendarLoading,
        refetchCommunityCalendar,
    } = useCommunityCalendarData({ communityId });

    // Filter events by status
    const pendingEvents = communityCalendarData?.filter(
        (e) => e.status === "pending"
    );
    const approvedEvents = communityCalendarData?.filter(
        (e) => e.status === "approved"
    );
    const rejectedEvents = communityCalendarData?.filter(
        (e) => e.status === "rejected"
    );
    const closedEvents = communityCalendarData?.filter(
        (e) => e.status === "closed"
    );

    // Get upcoming approved events (today + future)
    const upcomingApprovedEvents = approvedEvents
        ?.filter((event) => {
            const eventDate = parseISO(event.start);
            return isAfter(eventDate, new Date()) || isToday(eventDate);
        })
        .sort((a, b) => new Date(a.start) - new Date(b.start));

    const handleCreateEvent = async () => {
        if (!newEventDate) {
            toast.error("Please select a date");
            return;
        }
        setLoading(true);
        const token = getToken();

        try {
            await axios.post(
                `${serVer}/user/community-calendar/${communityId}/events`,
                { start: newEventDate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            refetchCommunityCalendar();
            toast.success("Event created successfully");
            setOpenDialog(false);
            setNewEventDate(null);
        } catch (error) {
            toast.error(error.response?.data || "Failed to create event");
            console.error("Error creating event:", error);
        } finally {
            setLoading(false);
        }
    };

    const canViewEvent = (eventDate) => {
        const date = parseISO(eventDate);
        return isBefore(date, new Date()) || isToday(date);
    };

    const handleViewEvent = (event) => {
        setActiveTab("viewEvent");
        setEventData(event);
    };

    const handleStatusChange = async (newStatus, eventData) => {
        const token = getToken();
        try {
            await axios.put(
                `${serVer}/creator/community-calendar/events/${eventData._id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Event marked as ${newStatus}`);
            refetchCommunityCalendar();
        } catch (error) {
            toast.error(
                `Failed to update status: ${
                    error.response?.data?.message || error.message
                }`
            );
            console.error("Error updating status:", error);
        }
    };

    const StatusMenu = ({ eventData }) => {
        const [anchorEl, setAnchorEl] = useState(null);
        const open = Boolean(anchorEl);

        const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
            setAnchorEl(null);
        };

        return (
            <Box>
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ ml: 1 }}
                    aria-controls={open ? "status-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            boxShadow: theme.shadows[4],
                            minWidth: 180,
                        },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}>
                    <MenuItem
                        onClick={() =>
                            handleStatusChange("approved", eventData)
                        }>
                        <ListItemIcon>
                            <CheckIcon fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText>Approve</ListItemText>
                    </MenuItem>
                    <MenuItem
                        onClick={() =>
                            handleStatusChange("rejected", eventData)
                        }>
                        <ListItemIcon>
                            <ClosedIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>Reject</ListItemText>
                    </MenuItem>
                </Menu>
            </Box>
        );
    };

    if (isCommunityCalendarLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
                <CircularProgress size={32} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header Section */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
                }}>
                <Typography variant="h4" fontWeight="bold">
                    Community Calendar
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontWeight: "bold",
                        boxShadow: theme.shadows[2],
                        "&:hover": {
                            boxShadow: theme.shadows[4],
                        },
                    }}>
                    New Event
                </Button>
            </Box>

            {/* Upcoming Events Section */}
            <Paper
                sx={{
                    mb: 4,
                    borderRadius: 3,
                    overflow: "hidden",
                    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: "white",
                    boxShadow: theme.shadows[6],
                }}>
                <Box sx={{ p: 3, position: "relative" }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}>
                        <Box>
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                gutterBottom>
                                Upcoming Events
                            </Typography>
                            <Typography variant="h2" fontWeight="bold">
                                {upcomingApprovedEvents?.length || 0}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{ opacity: 0.9, mt: 1 }}>
                                Scheduled events in your community
                            </Typography>
                        </Box>
                        <EventIcon sx={{ fontSize: 80, opacity: 0.2 }} />
                    </Box>

                    {upcomingApprovedEvents?.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                sx={{ mb: 1 }}>
                                Next Events:
                            </Typography>
                            <Grid container spacing={2}>
                                {upcomingApprovedEvents
                                    .slice(0, 3)
                                    .map((event) => (
                                        <Grid
                                            item
                                            xs={12}
                                            sm={6}
                                            md={4}
                                            key={event._id}>
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    borderRadius: 2,
                                                    background:
                                                        "rgba(255,255,255,0.15)",
                                                    backdropFilter:
                                                        "blur(10px)",
                                                }}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }}>
                                                    <CalendarIcon
                                                        sx={{ mr: 1.5 }}
                                                    />
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight="medium">
                                                        {format(
                                                            parseISO(
                                                                event.start
                                                            ),
                                                            "MMM dd, yyyy"
                                                        )}
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    size="small"
                                                    endIcon={
                                                        <ArrowForwardIcon />
                                                    }
                                                    onClick={() =>
                                                        handleViewEvent(event)
                                                    }
                                                    sx={{
                                                        mt: 1,
                                                        color: "white",
                                                        "&:hover": {
                                                            background:
                                                                "rgba(255,255,255,0.2)",
                                                        },
                                                    }}>
                                                    View Details
                                                </Button>
                                            </Paper>
                                        </Grid>
                                    ))}
                            </Grid>
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* Status Tabs */}
            <Paper
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    boxShadow: theme.shadows[2],
                    overflow: "hidden",
                }}>
                <Tabs
                    value={activeStatusTab}
                    onChange={(e, newValue) => setActiveStatusTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        "& .MuiTabs-indicator": {
                            height: 4,
                            borderRadius: 2,
                        },
                    }}>
                    <Tab
                        label={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <PendingIcon sx={{ fontSize: 20, mr: 1 }} />
                                Pending
                                <Chip
                                    label={pendingEvents?.length || 0}
                                    size="small"
                                    color="warning"
                                    sx={{ ml: 1, fontWeight: "bold" }}
                                />
                            </Box>
                        }
                    />
                    <Tab
                        label={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <CheckIcon sx={{ fontSize: 20, mr: 1 }} />
                                Approved
                                <Chip
                                    label={approvedEvents?.length || 0}
                                    size="small"
                                    color="success"
                                    sx={{ ml: 1, fontWeight: "bold" }}
                                />
                            </Box>
                        }
                    />
                    <Tab
                        label={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <ClosedIcon sx={{ fontSize: 20, mr: 1 }} />
                                Rejected
                                <Chip
                                    label={rejectedEvents?.length || 0}
                                    size="small"
                                    color="error"
                                    sx={{ ml: 1, fontWeight: "bold" }}
                                />
                            </Box>
                        }
                    />
                    <Tab
                        label={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <LockIcon sx={{ fontSize: 20, mr: 1 }} />
                                Closed
                                <Chip
                                    label={closedEvents?.length || 0}
                                    size="small"
                                    color="secondary"
                                    sx={{ ml: 1, fontWeight: "bold" }}
                                />
                            </Box>
                        }
                    />
                </Tabs>
            </Paper>

            {/* Tab Content */}
            <Box>
                {/* Pending Events */}
                {activeStatusTab === 0 && (
                    <EventList
                        events={pendingEvents}
                        status="pending"
                        icon={<PendingIcon color="warning" />}
                        emptyText="No pending events"
                        isAdmin={isCommunityAdmin}
                        onAction={(event) => <StatusMenu eventData={event} />}
                    />
                )}

                {/* Approved Events */}
                {activeStatusTab === 1 && (
                    <EventList
                        events={approvedEvents}
                        status="approved"
                        icon={<CheckIcon color="success" />}
                        emptyText="No approved events"
                        onAction={(event) => (
                            <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleViewEvent(event)}
                                endIcon={<VisibilityIcon />}
                                disabled={!canViewEvent(event.start)}
                                sx={{ borderRadius: 2 }}>
                                View
                            </Button>
                        )}
                    />
                )}

                {/* Rejected Events */}
                {activeStatusTab === 2 && (
                    <EventList
                        events={rejectedEvents}
                        status="rejected"
                        icon={<ClosedIcon color="error" />}
                        emptyText="No rejected events"
                    />
                )}

                {/* Closed Events */}
                {activeStatusTab === 3 && (
                    <EventList
                        events={closedEvents}
                        status="closed"
                        icon={<LockIcon color="secondary" />}
                        emptyText="No closed events"
                        onAction={(event) => (
                            <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                onClick={() => handleViewEvent(event)}
                                endIcon={<VisibilityIcon />}
                                disabled={!canViewEvent(event.start)}
                                sx={{ borderRadius: 2 }}>
                                Review
                            </Button>
                        )}
                    />
                )}
            </Box>

            {/* Create Event Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: theme.shadows[10],
                    },
                }}>
                <DialogTitle
                    sx={{
                        bgcolor: theme.palette.primary.main,
                        color: "white",
                    }}>
                    <Typography variant="h6" fontWeight="bold">
                        Schedule New Event
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Event Date"
                            value={newEventDate}
                            onChange={(date) => setNewEventDate(date)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    margin="normal"
                                    sx={{ mt: 2 }}
                                />
                            )}
                        />
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        sx={{ borderRadius: 2, px: 3 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateEvent}
                        disabled={loading}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            bgcolor: theme.palette.primary.main,
                            "&:hover": {
                                bgcolor: theme.palette.primary.dark,
                            },
                        }}>
                        {loading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            "Create Event"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// Reusable Event List Component
const EventList = ({ events, status, icon, emptyText, onAction }) => {
    const theme = useTheme();

    const statusColors = {
        pending: theme.palette.warning.light,
        approved: theme.palette.success.light,
        rejected: theme.palette.error.light,
        closed: theme.palette.secondary.light,
    };

    if (!events || events.length === 0) {
        return (
            <Paper
                sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: 3,
                    boxShadow: theme.shadows[1],
                }}>
                <Typography variant="body1" color="text.secondary">
                    {emptyText}
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper
            sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: theme.shadows[2],
            }}>
            <Box
                sx={{
                    p: 2,
                    bgcolor: theme.palette.grey[100],
                    display: "flex",
                    alignItems: "center",
                }}>
                {icon}
                <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ ml: 1 }}>
                    {status.charAt(0).toUpperCase() + status.slice(1)} Events
                </Typography>
            </Box>
            <List>
                {events.map((event) => (
                    <ListItem
                        key={event._id}
                        secondaryAction={onAction && onAction(event)}
                        sx={{
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            "&:last-child": { borderBottom: "none" },
                        }}>
                        <ListItemAvatar>
                            <Avatar sx={{ bgcolor: statusColors[status] }}>
                                <CalendarIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={format(parseISO(event.start), "PPP")}
                            secondary={`Created: ${format(
                                parseISO(event.createdAt),
                                "PP"
                            )}`}
                            primaryTypographyProps={{ fontWeight: "medium" }}
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export const ViewEvent = ({
    communityId,
    eventData,
    setActiveTab,
    setEventData,
    userId,
    isCommunityAdmin,
}) => {
    const theme = useTheme();
    const { token } = useToken();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
    const eventSourceRef = useRef(null);
    const chatContainerRef = useRef(null);

    const { refetchCommunityCalendar } = useCommunityCalendarData({
        communityId,
    });

    console.log(onlineUsers);

    // Connect to SSE for real-time updates
    useEffect(() => {
        if (!eventData?._id) return;

        const url = new URL(
            `${serVer}/api/community-calendar/${communityId}/events/${eventData._id}/stream/${userId}`
        );

        const connectToSSE = () => {
            const eventSource = new EventSource(url.toString());
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                setIsConnected(true);
                console.log("SSE connection opened");
            };

            eventSource.addEventListener("initial", (e) => {
                const { messages, onlineUsers } = JSON.parse(e.data);
                setMessages(messages);
                setOnlineUsers(onlineUsers);
            });

            eventSource.addEventListener("newMessage", (e) => {
                const newMessage = JSON.parse(e.data);
                setMessages((prev) => [...prev, newMessage]);
            });

            eventSource.addEventListener("onlineUsers", (e) => {
                const updatedOnlineUsers = JSON.parse(e.data);
                setOnlineUsers(updatedOnlineUsers);
            });

            eventSource.onerror = (err) => {
                console.error("EventSource failed:", err);
                setIsConnected(false);
                eventSource.close();
                setTimeout(connectToSSE, 5000);
            };
        };

        connectToSSE();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                console.log("SSE connection closed");
            }
        };
    }, [communityId, eventData?._id, token, userId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        const container = chatContainerRef.current;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        setLoading(true);
        try {
            await axios.post(
                `${serVer}/user/community-calendar/events/${eventData._id}/messages`,
                { content: newMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleCloseEvent = () => {
        setActiveTab("calendar");
        setEventData(null);
    };

    const getStatusIcon = () => {
        switch (eventData.status) {
            case "approved":
                return <CheckIcon color="success" />;
            case "rejected":
                return <RejectedIcon color="error" />;
            default:
                return <PendingIcon color="warning" />;
        }
    };

    const handleMarkEventAsClosed = async () => {
        if (!isCommunityAdmin) {
            toast.error("Only community admins can close events");
            return;
        }

        try {
            await axios.put(
                `${serVer}/creator/community-calendar/events/${eventData._id}/status`,
                { status: "closed" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Event closed successfully");

            await refetchCommunityCalendar();
            handleCloseEvent();
        } catch (error) {
            toast.error("Failed to close event");
            console.error("Error closing event:", error);
        }
    };

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Event Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: "12px 12px 0 0",
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.background.paper,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <EventIcon color="primary" />
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            Event Discussion
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {format(parseISO(eventData.start), "PPP")}
                        </Typography>
                    </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                        label={isConnected ? "Live" : "Connecting..."}
                        size="small"
                        color={isConnected ? "success" : "warning"}
                        icon={
                            isConnected ? (
                                <CheckIcon fontSize="small" />
                            ) : (
                                <PendingIcon fontSize="small" />
                            )
                        }
                    />
                    <Chip
                        label={eventData.status}
                        size="small"
                        icon={getStatusIcon()}
                        sx={{
                            bgcolor:
                                eventData.status === "approved"
                                    ? theme.palette.success.light
                                    : eventData.status === "rejected"
                                    ? theme.palette.error.light
                                    : theme.palette.warning.light,
                            color: theme.palette.getContrastText(
                                eventData.status === "approved"
                                    ? theme.palette.success.light
                                    : eventData.status === "rejected"
                                    ? theme.palette.error.light
                                    : theme.palette.warning.light
                            ),
                        }}
                    />
                    <IconButton onClick={handleCloseEvent}>
                        <ClosedIcon />
                    </IconButton>
                </Box>
            </Paper>

            {/* Main Content */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: "flex",
                    overflow: "hidden",
                    flexDirection: { xs: "column", md: "row" },
                }}>
                {/* Event Details */}
                <Paper
                    elevation={0}
                    sx={{
                        width: { xs: "100%", md: 300 },
                        p: 2,
                        borderRight: {
                            md: `1px solid ${theme.palette.divider}`,
                        },
                        borderBottom: {
                            xs: `1px solid ${theme.palette.divider}`,
                            md: "none",
                        },
                        bgcolor: theme.palette.background.default,
                    }}>
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 2 }}>
                        Event Details
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" fontWeight="bold">
                            Date
                        </Typography>
                        <Typography variant="body2">
                            {format(parseISO(eventData.start), "PPPP")}
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" fontWeight="bold">
                            Created
                        </Typography>
                        <Typography variant="body2">
                            {format(parseISO(eventData.createdAt), "PP")}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ mb: 1 }}>
                            Online Participants ({onlineUsers?.length})
                        </Typography>
                        <List dense>
                            {onlineUsers?.length > 0 &&
                                onlineUsers?.map((user) => (
                                    <ListItem key={user.id} sx={{ px: 0 }}>
                                        <ListItemAvatar>
                                            <Badge
                                                overlap="circular"
                                                anchorOrigin={{
                                                    vertical: "bottom",
                                                    horizontal: "right",
                                                }}
                                                variant="dot"
                                                color="success">
                                                <Avatar
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                    }}
                                                />
                                            </Badge>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2">
                                                    {user.name}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                        </List>
                    </Box>
                </Paper>

                {/* Chat Messages */}
                <Box
                    sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}>
                    {/* Messages Container */}
                    <Box
                        ref={chatContainerRef}
                        sx={{
                            flexGrow: 1,
                            p: 2,
                            overflowY: "auto",
                            bgcolor: theme.palette.background.paper,
                            backgroundImage:
                                "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
                        }}>
                        {messages.length === 0 ? (
                            <Box
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary">
                                    No messages yet. Start the conversation!
                                </Typography>
                            </Box>
                        ) : (
                            <List>
                                {messages?.map((msg) => (
                                    <Box key={msg._id}>
                                        <ListItem
                                            sx={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                justifyContent:
                                                    msg.sender._id === userId
                                                        ? "flex-end"
                                                        : "flex-start",
                                                px: 0,
                                                py: 1,
                                            }}>
                                            {msg.sender?._id !== userId && (
                                                <ListItemAvatar
                                                    sx={{
                                                        minWidth: 40,
                                                        alignSelf: "flex-start",
                                                    }}>
                                                    <Avatar
                                                        src={msg.sender?.avatar}
                                                        alt={msg.sender?.name}>
                                                        {msg.sender.name.charAt(
                                                            0
                                                        )}
                                                    </Avatar>
                                                </ListItemAvatar>
                                            )}
                                            <Box
                                                sx={{
                                                    maxWidth: "70%",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems:
                                                        msg.sender._id ===
                                                        userId
                                                            ? "flex-end"
                                                            : "flex-start",
                                                }}>
                                                {msg.sender?._id !== userId && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary">
                                                        {msg.sender?.name}
                                                    </Typography>
                                                )}
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        px: 2,
                                                        py: 1,
                                                        borderRadius:
                                                            msg.sender._id ===
                                                            userId
                                                                ? "18px 18px 0 18px"
                                                                : "18px 18px 18px 0",
                                                        bgcolor:
                                                            msg.sender._id ===
                                                            userId
                                                                ? theme.palette
                                                                      .primary
                                                                      .main
                                                                : theme.palette
                                                                      .grey[100],
                                                        color:
                                                            msg.sender._id ===
                                                            userId
                                                                ? theme.palette
                                                                      .primary
                                                                      .contrastText
                                                                : "inherit",
                                                    }}>
                                                    <Typography variant="body1">
                                                        {msg.content}
                                                    </Typography>
                                                </Paper>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    fontSize="0.6rem"
                                                    sx={{ mt: 0.5 }}>
                                                    {msg?.createdAt
                                                        ? format(
                                                              new Date(
                                                                  msg.createdAt
                                                              ),
                                                              "h:mm a"
                                                          )
                                                        : "N/A"}
                                                </Typography>
                                            </Box>
                                        </ListItem>
                                        <Divider
                                            variant="inset"
                                            component="li"
                                            sx={{ opacity: 0.5 }}
                                        />
                                    </Box>
                                ))}
                            </List>
                        )}
                    </Box>

                    {/* Message Input */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderTop: `1px solid ${theme.palette.divider}`,
                            bgcolor: theme.palette.background.paper,
                        }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}>
                            <TextField
                                fullWidth
                                placeholder="Type your message..."
                                variant="outlined"
                                size="small"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={loading}
                                maxRows={4}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: 20,
                                        bgcolor:
                                            theme.palette.background.default,
                                    },
                                }}
                            />
                            <IconButton
                                size="large"
                                onClick={handleSendMessage}
                                disabled={
                                    !newMessage.trim() ||
                                    loading ||
                                    !isConnected
                                }
                                sx={{
                                    bgcolor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    "&:hover": {
                                        bgcolor: theme.palette.primary.dark,
                                    },
                                    "&:disabled": {
                                        bgcolor:
                                            theme.palette.action
                                                .disabledBackground,
                                    },
                                }}>
                                {loading ? (
                                    <CircularProgress
                                        size={22}
                                        color="inherit"
                                    />
                                ) : (
                                    <SendIcon />
                                )}
                            </IconButton>
                        </Box>
                    </Paper>

                    {/* close by community creator */}
                    {isCommunityAdmin && (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setConfirmCloseOpen(true)}>
                            Close this event
                        </Button>
                    )}
                </Box>
            </Box>

            <Dialog
                open={confirmCloseOpen}
                onClose={() => setConfirmCloseOpen(false)}
                maxWidth="xs"
                fullWidth>
                <DialogTitle>Confirm Close Event</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to close this event?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmCloseOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            setConfirmCloseOpen(false);
                            handleMarkEventAsClosed();
                        }}
                        color="error"
                        variant="contained">
                        Close Event
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
