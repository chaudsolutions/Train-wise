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
} from "@mui/material";
import {
    Info as InfoIcon,
    MoreVert as MoreVertIcon,
    Add as AddIcon,
    PlayCircleOutline as PlayIcon,
    Send as SendIcon,
    Circle as OnlineIcon,
} from "@mui/icons-material";
import { useReactRouter } from "../../Hooks/useReactRouter";
import CourseStockImg from "../../../assets/courseStock.png";
import { useEffect, useRef, useState } from "react";
import { serVer, useToken } from "../../Hooks/useVariable";
import axios from "axios";
import toast from "react-hot-toast";

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
                            bgcolor: theme.palette.info.light,
                            "&:hover": {
                                bgcolor: theme.palette.info.light,
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
                                    <InfoIcon color="info" sx={{ mr: 1 }} />
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
                                color="info"
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

    const getThumbnailUrl = (videos) => {
        if (videos && videos.length > 0) {
            const firstVideoUrl = videos[0];
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
            return firstVideoUrl.replace(videoPattern, ".jpg");
        }
        return CourseStockImg;
    };

    const getProgress = (course) => {
        if (!coursesWatched || !course?.videos) return 0;
        const courseWatched = coursesWatched.find(
            (cw) => cw.courseId.toString() === course._id.toString()
        );
        if (!courseWatched || !courseWatched.videos) return 0;
        const totalVideos = course.videos.length;
        const watchedVideos = courseWatched.videos.length;
        const progress = (watchedVideos / totalVideos) * 100;
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
                                    image={getThumbnailUrl(course?.videos)}
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
                                            bgcolor: theme.palette.info.light,
                                            color: theme.palette.info
                                                .contrastText,
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            mb: 1,
                                        }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={getProgress(course)}
                                            sx={{
                                                flexGrow: 1,
                                                height: 8,
                                                borderRadius: 4,
                                                mr: 1,
                                                "& .MuiLinearProgress-bar": {
                                                    backgroundColor:
                                                        theme.palette.info.main,
                                                },
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            color="text.secondary">
                                            {getProgress(course)}%
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <Button
                                    component={Link}
                                    to={`/course/${course._id}/community/${communityId}`}
                                    startIcon={<PlayIcon />}
                                    sx={{
                                        mx: 2,
                                        mb: 2,
                                        bgcolor: theme.palette.info.main,
                                        color: theme.palette.info.contrastText,
                                        "&:hover": {
                                            bgcolor: theme.palette.info.dark,
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
                        to={`/creator/add-course/${communityId}`}
                        variant="contained"
                        color="info"
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

export const CommunityChatroom = ({ communityId, userId, createdBy }) => {
    const theme = useTheme();
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const eventSourceRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [sending, setIsSending] = useState(false);

    const { token } = useToken();

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

    console.log(messages);

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
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                        Community Chat
                    </Typography>
                    <Chip
                        label={isConnected ? "Live" : "Connecting..."}
                        size="small"
                        color={isConnected ? "success" : "warning"}
                        icon={<OnlineIcon fontSize="small" />}
                    />
                </Box>
                <IconButton>
                    <MoreVertIcon />
                </IconButton>
            </Paper>

            {/* Main Chat Area */}
            <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
                {/* Online Users Sidebar */}
                <Paper
                    elevation={0}
                    sx={{
                        width: 250,
                        p: 2,
                        borderRight: `1px solid ${theme.palette.divider}`,
                        display: { xs: "none", md: "flex" },
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

                            border: `1px solid ${theme.palette.info.light}`,
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
                                                                      .info.main
                                                                : theme.palette
                                                                      .grey[100],
                                                        color:
                                                            msg.sender._id ===
                                                            userId
                                                                ? theme.palette
                                                                      .info
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
                                    bgcolor: theme.palette.info.main,
                                    color: theme.palette.info.contrastText,
                                    "&:hover": {
                                        bgcolor: theme.palette.info.dark,
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
        </Box>
    );
};
