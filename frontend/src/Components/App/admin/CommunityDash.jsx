import { useState } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Card,
    CardContent,
    List,
    ListItem,
    Avatar,
    ListItemAvatar,
    ListItemText,
    Button,
    Chip,
    Paper,
    Divider,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
} from "@mui/material";
import {
    Groups,
    MonetizationOn,
    FreeBreakfast,
    AccountBalance,
    Report,
} from "@mui/icons-material";
import { useAdminAnalyticsData } from "../../Hooks/useQueryFetch/useQueryData";
import { Link } from "react-router-dom";
import PageLoader from "../../Animations/PageLoader";
import axios from "axios";
import { serVer, useToken } from "../../Hooks/useVariable";
import toast from "react-hot-toast";
import useResponsive from "../../Hooks/useResponsive";

const CommunityDash = () => {
    const { analyticsData, isAnalyticsDataLoading, refetchAnalyticsData } =
        useAdminAnalyticsData();
    const [tabValue, setTabValue] = useState(0);
    const { token } = useToken();
    const { communities } = analyticsData || {};
    const {
        communities: allCommunities,
        freeCommunities,
        paidCommunities,
    } = communities || {};

    const { isMobile } = useResponsive();

    // State for confirmation dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [btn, setBtn] = useState(false);

    const handleOpenDialog = (community) => {
        setSelectedCommunity(community);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedCommunity(null);
    };

    const handleDeleteCommunity = async () => {
        if (!selectedCommunity) return;
        setBtn(true);

        try {
            await axios.delete(
                `${serVer}/admin/community/${selectedCommunity._id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            toast.success(
                `Community "${selectedCommunity.name}" deleted successfully`
            );
            refetchAnalyticsData(); // Refresh analytics data
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete community");
        } finally {
            setBtn(false);
            handleCloseDialog();
        }
    };

    if (isAnalyticsDataLoading) {
        return <PageLoader />;
    }

    const renderCommunityList = (communityList) => (
        <List>
            {communityList?.length > 0 ? (
                communityList.map((community) => (
                    <Paper
                        key={community._id}
                        elevation={1}
                        sx={{
                            mb: 2,
                            borderRadius: 2,
                            transition: "transform 0.2s, box-shadow 0.2s",
                            "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            },
                        }}>
                        <ListItem
                            sx={{
                                py: { xs: 1.5, sm: 2 },
                                px: { xs: 1, sm: 2 },
                            }}>
                            <Grid
                                container
                                alignItems="center"
                                spacing={{ xs: 1, sm: 2 }}>
                                <Grid size={{ xs: 12, sm: 6, md: 7, lg: 8 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                        }}>
                                        <ListItemAvatar>
                                            <Avatar
                                                src={community.logo}
                                                alt={community.name}
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    bgcolor: "info.main",
                                                }}>
                                                {community.name?.charAt(0)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={community.name}
                                            secondary={
                                                <>
                                                    {community.description.slice(
                                                        0,
                                                        100
                                                    )}
                                                    {community.description
                                                        .length > 100
                                                        ? "..."
                                                        : ""}
                                                    <br />
                                                    Category:{" "}
                                                    {community.category}
                                                </>
                                            }
                                            primaryTypographyProps={{
                                                fontWeight: 500,
                                                variant: "body1",
                                                noWrap: true,
                                            }}
                                            secondaryTypographyProps={{
                                                variant: "body2",
                                                color: "text.secondary",
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 7, lg: 8 }}>
                                    <Divider
                                        sx={{
                                            my: 1,
                                            display: {
                                                xs: "block",
                                                md: "none",
                                            },
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 1,
                                            px: { xs: 0, sm: 2 },
                                        }}>
                                        <Chip
                                            icon={
                                                <AccountBalance fontSize="small" />
                                            }
                                            label={`Balance: $${
                                                community.balance?.toFixed(2) ||
                                                "0.00"
                                            }`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ bgcolor: "background.paper" }}
                                        />
                                        <Chip
                                            icon={<Groups fontSize="small" />}
                                            label={`Members: ${
                                                community.members?.length || 0
                                            }`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ bgcolor: "background.paper" }}
                                        />
                                        <Chip
                                            icon={
                                                <MonetizationOn fontSize="small" />
                                            }
                                            label={`Fee: $${community.subscriptionFee.toFixed(
                                                2
                                            )}/mo`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ bgcolor: "background.paper" }}
                                        />
                                        <Chip
                                            icon={<Report fontSize="small" />}
                                            label={`Reports: ${
                                                community.reports?.length || 0
                                            }`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ bgcolor: "background.paper" }}
                                        />
                                        <Chip
                                            label={`Creator: ${
                                                community.createdBy?.name ||
                                                "Unknown"
                                            }`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ bgcolor: "background.paper" }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 5, lg: 4 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: {
                                                xs: "column",
                                                md: "row",
                                            },
                                            gap: 1,
                                            justifyContent: "flex-end",
                                            alignItems: {
                                                xs: "stretch",
                                                md: "center",
                                            },
                                        }}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() =>
                                                handleOpenDialog(community)
                                            }
                                            sx={{
                                                flex: {
                                                    xs: "1 0 100%",
                                                    md: "0 1 auto",
                                                },
                                            }}>
                                            Delete
                                        </Button>
                                        <Button
                                            variant="contained"
                                            component={Link}
                                            to={`/admin/dashboard/community/${community._id}`}
                                            color="info"
                                            size="small"
                                            sx={{
                                                flex: {
                                                    xs: "1 0 100%",
                                                    md: "0 1 auto",
                                                },
                                            }}>
                                            View Details
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </ListItem>
                    </Paper>
                ))
            ) : (
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ p: 2 }}>
                    No communities found
                </Typography>
            )}
        </List>
    );

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
                variant="h4"
                fontSize={{ xs: "1.25rem", sm: "1.5rem" }}
                gutterBottom
                sx={{
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontWeight: 700,
                }}>
                <Groups fontSize="large" /> Communities Management
            </Typography>

            <Paper elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    variant="fullWidth"
                    sx={{ borderRadius: 2 }}>
                    <Tab
                        label={`All ${isMobile ? "" : "Communities"} (${
                            allCommunities?.length || 0
                        })`}
                        icon={<Groups />}
                        iconPosition="start"
                        sx={{
                            fontSize: { xs: "0.8rem", sm: "1rem" },
                            textTransform: "none",
                            minHeight: { xs: 48, sm: 56 },
                        }}
                    />
                    <Tab
                        label={`Free ${isMobile ? "" : "Communities"} (${
                            freeCommunities?.length || 0
                        })`}
                        icon={<FreeBreakfast />}
                        iconPosition="start"
                        sx={{
                            fontSize: { xs: "0.8rem", sm: "1rem" },
                            textTransform: "none",
                            minHeight: { xs: 48, sm: 56 },
                        }}
                    />
                    <Tab
                        label={`Paid ${isMobile ? "" : "Communities"} (${
                            paidCommunities?.length || 0
                        })`}
                        icon={<MonetizationOn />}
                        iconPosition="start"
                        sx={{
                            fontSize: { xs: "0.8rem", sm: "1rem" },
                            textTransform: "none",
                            minHeight: { xs: 48, sm: 56 },
                        }}
                    />
                </Tabs>
            </Paper>

            <Card
                elevation={3}
                sx={{ borderRadius: 2, bgcolor: "background.paper" }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {tabValue === 0 && (
                        <>
                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    fontWeight: 500,
                                }}>
                                <Groups /> All Communities
                            </Typography>
                            {renderCommunityList(allCommunities)}
                        </>
                    )}
                    {tabValue === 1 && (
                        <>
                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    fontWeight: 500,
                                }}>
                                <FreeBreakfast /> Free Communities
                            </Typography>
                            {renderCommunityList(freeCommunities)}
                        </>
                    )}
                    {tabValue === 2 && (
                        <>
                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    fontWeight: 500,
                                }}>
                                <MonetizationOn /> Paid Communities
                            </Typography>
                            {renderCommunityList(paidCommunities)}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="delete-community-dialog-title"
                aria-describedby="delete-community-dialog-description">
                <DialogTitle id="delete-community-dialog-title">
                    Confirm Delete Community
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-community-dialog-description">
                        Are you sure you want to delete the community &apos;
                        {selectedCommunity?.name}&apos;? This action cannot be
                        undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteCommunity}
                        color="error"
                        variant="contained"
                        autoFocus>
                        {btn ? (
                            <CircularProgress color="white" size={20} />
                        ) : (
                            "Delete"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CommunityDash;
