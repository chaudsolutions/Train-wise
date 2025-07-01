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
} from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EmailIcon from "@mui/icons-material/Email";
import CheckIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from "@mui/icons-material/Info";
import PlayIcon from "@mui/icons-material/PlayCircleOutline";
import SendIcon from "@mui/icons-material/Send";
import OnlineIcon from "@mui/icons-material/Circle";
import People from "@mui/icons-material/People";
import { useReactRouter } from "../../Hooks/useReactRouter";
import CourseStockImg from "../../../assets/courseStock.png";
import { useEffect, useRef, useState } from "react";
import { serVer, useToken } from "../../Hooks/useVariable";
import axios from "axios";
import toast from "react-hot-toast";
import useResponsive from "../../Hooks/useResponsive";

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

export const CommunityInventory = ({ balance, handleWithdrawal, btn }) => {
    const theme = useTheme();

    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
                maxWidth: 400,
                mx: "auto",
                border: `1px solid ${theme.palette.divider}`,
            }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                }}>
                <AccountBalanceWalletIcon color="primary" fontSize="large" />
                <Typography variant="h6" component="h2" fontWeight="bold">
                    Community Inventory
                </Typography>
            </Box>

            {/* Balance Display */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    width: "100%",
                    bgcolor: theme.palette.grey[100],
                    borderRadius: 1,
                    textAlign: "center",
                    border: `1px solid ${theme.palette.divider}`,
                }}>
                <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom>
                    Available Balance
                </Typography>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="primary"
                    sx={{
                        fontFamily: "monospace",
                    }}>
                    <AttachMoneyIcon /> {balance?.toFixed(2) || "0.00"}
                </Typography>
            </Paper>

            {/* Withdrawal Button */}
            <Button
                variant="contained"
                color="primary"
                onClick={handleWithdrawal}
                disabled={btn || !balance || balance <= 0}
                fullWidth
                startIcon={
                    btn && (
                        <CircularProgress
                            size={24}
                            color="inherit"
                            sx={{ mr: 1 }}
                        />
                    )
                }
                sx={{
                    mt: 1,
                    py: 1.5,
                    borderRadius: 1,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: "bold",
                }}>
                {btn ? "Processing..." : "Withdraw Funds"}
            </Button>

            {(!balance || balance <= 0) && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: -1, alignSelf: "flex-start" }}>
                    No funds available for withdrawal
                </Typography>
            )}
        </Paper>
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
