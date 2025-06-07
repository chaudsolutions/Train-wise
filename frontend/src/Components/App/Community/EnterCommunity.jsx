import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Avatar,
    Tabs,
    Tab,
    Paper,
    Chip,
    Divider,
    useTheme,
    Button,
    Badge,
    Stack,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Snackbar,
    Alert,
} from "@mui/material";
import {
    People as PeopleIcon,
    School as SchoolIcon,
    Notifications as NotificationsIcon,
    Add,
    Message,
} from "@mui/icons-material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useReactRouter } from "../../Hooks/useReactRouter";
import {
    useCommunityByIdData,
    useCommunityCoursesData,
    useUserData,
} from "../../Hooks/useQueryFetch/useQueryData";
import PageLoader from "../../Animations/PageLoader";
import useResponsive from "../../Hooks/useResponsive";
import {
    CommunityChatroom,
    CommunityClassroom,
    CommunityInventory,
    CommunityOverview,
} from "../../Custom/community/EnterCommunity";
import toast from "react-hot-toast";
import axios from "axios";
import { serVer, useToken } from "../../Hooks/useVariable";
import { useSearchParams } from "react-router-dom";
import { ReportCommunityForm } from "../../Custom/Forms/Forms";

const EnterCommunity = () => {
    const [activeTab, setActiveTab] = useState("community");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [btn, setBtn] = useState(false);
    const [reportDialog, setReportDialog] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const theme = useTheme();
    const { isMobile } = useResponsive();
    const { token } = useToken();
    const { useParams, Link } = useReactRouter();
    const { communityId } = useParams();

    const { userData, isUserDataLoading } = useUserData();
    const { community, isCommunityLoading, refetchCommunity } =
        useCommunityByIdData({
            id: communityId,
        });
    const { coursesData, isCoursesLoading } = useCommunityCoursesData({
        id: communityId,
    });

    const {
        name,
        logo,
        balance,
        category,
        description,
        bannerImage,
        members,
        createdBy,
        createdAt,
        notifications,
        role,
    } = community || {};

    const { _id, coursesWatched } = userData || {};
    const { courses } = coursesData || {};
    const isCommunityAdmin = createdBy?._id === _id;
    const isSuperAdmin = role === "admin";

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setSearchParams({ tab: newValue });
    };

    useEffect(() => {
        setActiveTab(searchParams.get("tab") || "community");
    }, [searchParams]);

    const tabs = [
        { id: "community", label: "Community", icon: <NotificationsIcon /> },
        { id: "classroom", label: "Classroom", icon: <SchoolIcon /> },
        { id: "chatroom", label: "Chatroom", icon: <Message /> },
        { id: "members", label: "Members", icon: <PeopleIcon /> },
    ];

    const handleInviteMembers = () => {
        const communityLink = `${location.origin}/community/${communityId}`;

        // Copy to clipboard
        navigator.clipboard
            .writeText(communityLink)
            .then(() => {
                setOpenSnackbar(true);
            })
            .catch((err) => {
                console.error("Failed to copy text: ", err);
                // You might want to show an error toast here
            });
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpenSnackbar(false);
    };

    const withdrawCommunityBalance = async () => {
        setBtn(true);
        try {
            const res = await axios.put(
                `${serVer}/creator/withdraw/${communityId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(res.data);

            refetchCommunity();
        } catch (error) {
            toast.error(error?.response.data || "Withdrawal failed");
        } finally {
            setBtn(false);
        }
    };

    if (isCommunityLoading || isUserDataLoading || isCoursesLoading) {
        return <PageLoader />;
    }

    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
                {/* Main Content Area */}
                <Grid size={{ xs: 12, md: isMobile ? 12 : 8 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 4,
                            overflow: "hidden",
                            mb: 3,
                            border: `1px solid ${theme.palette.divider}`,
                        }}>
                        {/* Banner Image */}
                        <Box
                            sx={{
                                height: 200,
                                backgroundImage: `url(${bannerImage})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                position: "relative",
                            }}>
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: -40,
                                    left: 20,
                                    display: "flex",
                                    alignItems: "flex-end",
                                    gap: 3,
                                }}>
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "right",
                                    }}
                                    badgeContent={
                                        <Chip
                                            label={category}
                                            size="small"
                                            sx={{
                                                bgcolor:
                                                    theme.palette.primary.dark,
                                                color: theme.palette.primary
                                                    .contrastText,
                                            }}
                                        />
                                    }>
                                    <Avatar
                                        src={logo}
                                        alt={name}
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            border: `3px solid ${theme.palette.background.paper}`,
                                        }}
                                    />
                                </Badge>
                                <Typography
                                    variant="h4"
                                    fontWeight="bold"
                                    sx={{
                                        color: "common.white",
                                        textShadow: "0 2px 4px rgba(0,0,0,0.9)",
                                        mb: 1,
                                    }}>
                                    {name}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Tabs Section */}
                        <Box sx={{ mt: 6, px: 2 }}>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    "& .MuiTabs-indicator": {
                                        backgroundColor:
                                            theme.palette.primary.main,
                                        height: 3,
                                    },
                                }}>
                                {isCommunityAdmin && (
                                    <Tab
                                        value="inventory"
                                        label="Inventory"
                                        icon={<AttachMoneyIcon />}
                                        iconPosition="start"
                                        sx={{
                                            minHeight: 60,
                                            "&.Mui-selected": {
                                                color: theme.palette.primary
                                                    .main,
                                            },
                                        }}
                                    />
                                )}
                                {tabs.map((tab) => (
                                    <Tab
                                        key={tab.id}
                                        value={tab.id}
                                        label={tab.label}
                                        icon={tab.icon}
                                        iconPosition="start"
                                        sx={{
                                            minHeight: 60,
                                            "&.Mui-selected": {
                                                color: theme.palette.primary
                                                    .main,
                                            },
                                        }}
                                    />
                                ))}
                            </Tabs>
                            <Divider />
                        </Box>

                        {/* Tab Content */}
                        <Box sx={{ p: 3 }}>
                            {activeTab === "inventory" && isCommunityAdmin && (
                                <CommunityInventory
                                    balance={balance}
                                    handleWithdrawal={withdrawCommunityBalance}
                                    btn={btn}
                                />
                            )}

                            {activeTab === "community" && (
                                <CommunityOverview
                                    createdAt={createdAt}
                                    notifications={notifications}
                                />
                            )}

                            {activeTab === "classroom" && (
                                <CommunityClassroom
                                    isCommunityAdmin={isCommunityAdmin}
                                    communityId={communityId}
                                    courses={courses}
                                    coursesWatched={coursesWatched}
                                />
                            )}

                            {activeTab === "chatroom" && (
                                <CommunityChatroom
                                    isSuperAdmin={
                                        isSuperAdmin || isCommunityAdmin
                                    }
                                    communityId={communityId}
                                    userId={_id}
                                    createdBy={createdBy}
                                />
                            )}

                            {activeTab === "members" && (
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        Community Members
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={createdBy?.avatar}
                                                    alt={createdBy?.name}
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={createdBy.name}
                                                secondary={"Creator"}
                                            />
                                        </ListItem>
                                        {members?.map((member) => (
                                            <ListItem key={member?.userId._id}>
                                                <ListItemAvatar>
                                                    <Avatar
                                                        src={
                                                            member?.userId
                                                                .avatar
                                                        }
                                                        alt={
                                                            member?.userId.name
                                                        }
                                                    />
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        member?.userId.name
                                                    }
                                                    secondary={"Member"}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Sidebar - Only shown on desktop */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        {/* Community Info Card */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: `1px solid ${theme.palette.divider}`,
                            }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 2,
                                }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Community Details
                                </Typography>
                            </Box>

                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ mb: 3 }}>
                                {description}
                            </Typography>

                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                <Chip
                                    label={category}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                />
                                <Chip
                                    label={`${members?.length || 0} members`}
                                    icon={<PeopleIcon fontSize="small" />}
                                    size="small"
                                />
                            </Stack>

                            <Stack spacing={1}>
                                {isCommunityAdmin && (
                                    <>
                                        <Button
                                            LinkComponent={Link}
                                            to={`/creator/${communityId}/add-course`}
                                            variant="outlined"
                                            color="primary"
                                            startIcon={<Add />}>
                                            Create Course
                                        </Button>
                                    </>
                                )}
                                <Button
                                    onClick={handleInviteMembers}
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<PeopleIcon />}>
                                    Invite Members
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setReportDialog(true)}>
                                    Report Community
                                </Button>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="success"
                    sx={{ width: "100%" }}>
                    link copied!
                </Alert>
            </Snackbar>

            {/* report community dialog */}
            <ReportCommunityForm
                open={reportDialog}
                onClose={() => setReportDialog(false)}
                communityId={communityId}
            />
        </Box>
    );
};

export default EnterCommunity;
