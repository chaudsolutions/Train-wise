import { useState, useRef } from "react";
import {
    Container,
    Box,
    Typography,
    Button,
    Avatar,
    Paper,
    Chip,
    Divider,
    useTheme,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Badge,
    IconButton,
    CircularProgress,
} from "@mui/material";
import {
    Circle as CircleIcon,
    Add as AddIcon,
    Pets as PetsIcon,
    Edit as EditIcon,
    CameraAlt as CameraIcon,
} from "@mui/icons-material";
import PageLoader from "../../Animations/PageLoader";
import {
    useUserData,
    useUserJoinedCommunitiesData,
} from "../../Hooks/useQueryFetch/useQueryData";
import { Link } from "react-router-dom";
import { categories, serVer, useToken } from "../../Hooks/useVariable";
import axios from "axios";
import toast from "react-hot-toast";

const Profile = () => {
    const theme = useTheme();
    const { userData, isUserDataLoading, refetchUserData } = useUserData();
    const { joinedCommunitiesData, isJoinedCommunitiesLoading } =
        useUserJoinedCommunitiesData();
    const { createdAt, role, name, email, avatar } = userData || {};

    const { token } = useToken();

    const [profileImage, setProfileImage] = useState(false);
    const fileInputRef = useRef(null);

    if (isUserDataLoading || isJoinedCommunitiesLoading) {
        return <PageLoader />;
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.match("image.*")) {
                alert("Please select an image file");
                return;
            }

            if (file.size > 1 * 1024 * 1024) {
                // 1MB limit
                alert("File size should be less than 1MB");
                return;
            }

            const reader = new FileReader();

            // Here you would typically upload to your server
            uploadProfileImage(file);

            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const uploadProfileImage = async (file) => {
        setProfileImage(true);
        try {
            // Create FormData and append the file
            const formData = new FormData();
            formData.append("avatar", file);

            const response = await axios.put(
                `${serVer}/user/upload-avatar`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            await refetchUserData();

            toast.success(response.data);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error updating profile image");
        } finally {
            setProfileImage(false);
        }
    };

    const getCategoryIcon = (category) => {
        let categoryArr = categories.find((c) => c.name === category);

        if (categoryArr) return categoryArr.icon;
        else return <PetsIcon />;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 4,
                }}>
                {/* Profile Card */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 3,
                        position: "relative",
                    }}>
                    <Box sx={{ position: "relative" }}>
                        <Avatar
                            src={avatar}
                            sx={{
                                width: 120,
                                height: 120,
                                fontSize: "3rem",
                                bgcolor: theme.palette.info.main,
                            }}>
                            {!avatar && name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <IconButton
                            onClick={triggerFileInput}
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                                bgcolor: theme.palette.grey[200],
                                color: theme.palette.info.dark,
                                "&:hover": {
                                    bgcolor: "black",
                                    color: "white",
                                },
                            }}>
                            {profileImage ? (
                                <CircularProgress size={20} />
                            ) : (
                                <CameraIcon />
                            )}
                        </IconButton>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: "none" }}
                        />
                    </Box>

                    <Typography variant="h5" fontWeight="bold">
                        {name}
                    </Typography>

                    <Typography variant="body1" color="text.secondary">
                        {email}
                    </Typography>

                    <Button
                        onClick={triggerFileInput}
                        variant="contained"
                        color="warning"
                        startIcon={<EditIcon />}
                        sx={{
                            borderRadius: 1,
                            fontWeight: 400,
                        }}>
                        Change Profile Picture
                    </Button>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            alignItems: "center",
                            mt: 2,
                        }}>
                        <Chip
                            icon={
                                <CircleIcon color="success" fontSize="small" />
                            }
                            label="Online Now"
                            variant="outlined"
                            sx={{ color: "success.main" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            Joined {new Date(createdAt)?.toLocaleDateString()}
                        </Typography>
                    </Box>
                </Paper>

                {/* Communities Section */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        flex: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                    }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}>
                        <Typography variant="h5" fontWeight="bold">
                            My Communities
                        </Typography>
                        {role === "creator" && (
                            <Button
                                component={Link}
                                to="/create-a-community"
                                variant="outlined"
                                color="info"
                                startIcon={<AddIcon />}
                                sx={{
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    fontWeight: 600,
                                }}>
                                Create Community
                            </Button>
                        )}
                    </Box>

                    <Divider />

                    {joinedCommunitiesData?.length > 0 ? (
                        <List sx={{ width: "100%" }}>
                            {joinedCommunitiesData.map((community) => (
                                <ListItem
                                    key={community._id}
                                    component={Link}
                                    to={`/community/access/${community._id}`}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                        py: 2,
                                        px: 0,
                                        textDecoration: "none",
                                        color: "inherit",
                                        "&:hover": {
                                            backgroundColor:
                                                theme.palette.action.hover,
                                            borderRadius: 2,
                                        },
                                    }}>
                                    <ListItemAvatar>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{
                                                vertical: "bottom",
                                                horizontal: "right",
                                            }}
                                            badgeContent={
                                                <Box
                                                    sx={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: "50%",
                                                        bgcolor: "white",
                                                        border: `1px solid ${theme.palette.info.light}`,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        color: theme.palette
                                                            .info.contrastText,
                                                    }}>
                                                    {getCategoryIcon(
                                                        community.category
                                                    )}
                                                </Box>
                                            }>
                                            <Avatar
                                                src={community.logo}
                                                alt={community.name}
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                }}
                                            />
                                        </Badge>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold">
                                                {community.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        gap: 1,
                                                        mt: 0.5,
                                                    }}>
                                                    <Chip
                                                        label={
                                                            community.role ===
                                                            "owner"
                                                                ? "Owner"
                                                                : "Member"
                                                        }
                                                        size="small"
                                                        color={
                                                            community.role ===
                                                            "owner"
                                                                ? "info"
                                                                : "default"
                                                        }
                                                    />
                                                    <Chip
                                                        label={
                                                            community.category
                                                        }
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </Box>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary">
                                                    Member since:{" "}
                                                    {new Date(
                                                        community.memberSince
                                                    ).toLocaleDateString()}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 2,
                                py: 4,
                            }}>
                            <Typography variant="body1" color="text.secondary">
                                You haven&apos;t joined any communities yet.
                            </Typography>
                            <Button
                                component={Link}
                                to="/discovery"
                                variant="contained"
                                color="info"
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: 600,
                                }}>
                                Explore Communities
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default Profile;
