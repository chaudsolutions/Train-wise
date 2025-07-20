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
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MessageIcon from "@mui/icons-material/Message";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AddIcon from "@mui/icons-material/Add";
import { useReactRouter } from "../../Hooks/useReactRouter";
import {
    useCommunityByIdData,
    useCommunityCoursesData,
    useUserData,
} from "../../Hooks/useQueryFetch/useQueryData";
import PageLoader from "../../Animations/PageLoader";
import useResponsive from "../../Hooks/useResponsive";
import {
    AddMember,
    CalendarTab,
    CommunityChatroom,
    CommunityClassroom,
    CommunityInventory,
    CommunityOverview,
    ViewEvent,
} from "../../Custom/community/EnterCommunity";
import { useSearchParams } from "react-router-dom";
import { ReportCommunityForm } from "../../Custom/Forms/Forms";
import SocialShareDrawer from "../../Custom/Buttons/SocialShareDrawer";
import GoBack from "../../Custom/Buttons/GoBack";

const EnterCommunity = () => {
    const [activeTab, setActiveTab] = useState("community");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [reportDialog, setReportDialog] = useState(false);
    const [selectShare, setSelectShare] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [eventData, setEventData] = useState(null);

    const theme = useTheme();
    const { isMobile } = useResponsive();
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
        { id: "chatroom", label: "Chatroom", icon: <MessageIcon /> },
        { id: "members", label: "Members", icon: <PeopleIcon /> },
        { id: "calendar", label: "Calendar", icon: <CalendarMonthIcon /> },
    ];

    const handleCloseSnackbar = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpenSnackbar(false);
    };

    const communityUrl = `${window.location.origin}/community/${community?._id}`;

    if (isCommunityLoading || isUserDataLoading || isCoursesLoading) {
        return <PageLoader />;
    }

    return (
        <Box sx={{ p: 2 }}>
            <GoBack />
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
                                {isCommunityAdmin && (
                                    <Tab
                                        value="addAMember"
                                        label="Add A Member"
                                        icon={<AddIcon />}
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
                            </Tabs>
                            <Divider />
                        </Box>

                        {/* Tab Content */}
                        <Box sx={{ p: 3 }}>
                            {activeTab === "inventory" && isCommunityAdmin && (
                                <CommunityInventory
                                    community={community}
                                    refetchCommunity={refetchCommunity}
                                    setActiveTab={setActiveTab}
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

                            {activeTab === "calendar" && (
                                <CalendarTab
                                    communityId={communityId}
                                    setActiveTab={setActiveTab}
                                    setEventData={setEventData}
                                />
                            )}

                            {activeTab === "viewEvent" && eventData && (
                                <ViewEvent
                                    communityId={communityId}
                                    eventData={eventData}
                                    setActiveTab={setActiveTab}
                                    setEventData={setEventData}
                                    userId={_id}
                                />
                            )}

                            {activeTab === "addAMember" && (
                                <AddMember
                                    communityId={communityId}
                                    refetchCommunity={refetchCommunity}
                                />
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
                                            startIcon={<AddIcon />}>
                                            Create Course
                                        </Button>
                                    </>
                                )}
                                <Button
                                    onClick={() => setSelectShare(true)}
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<PeopleIcon />}>
                                    Share This Community
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

            <SocialShareDrawer
                open={selectShare}
                onClose={() => setSelectShare(false)}
                communityName={name}
                url={communityUrl}
            />
        </Box>
    );
};

export default EnterCommunity;
