import {
    Box,
    Typography,
    Tabs,
    Tab,
    Card,
    CardContent,
    Avatar,
    Button,
    Chip,
    Paper,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
    Stack,
} from "@mui/material";
import { People, GroupAdd, SwitchAccount, Groups } from "@mui/icons-material";
import { useState } from "react";
import { useAdminAnalyticsData } from "../../Hooks/useQueryFetch/useQueryData";
import { Link } from "react-router-dom";
import PageLoader from "../../Animations/PageLoader";
import axios from "axios";
import { serVer, useToken } from "../../Hooks/useVariable";
import toast from "react-hot-toast";
import useResponsive from "../../Hooks/useResponsive";

// Reusable User Card Component
const UserCard = ({ user, isCreatorTab, onRoleChange }) => {
    const { isMobile } = useResponsive();

    return (
        <Card
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 3,
                },
            }}>
            <CardContent sx={{ flexGrow: 1, width: "100%" }}>
                <Stack
                    alignItems="center"
                    spacing={1}
                    textAlign="center"
                    width="100%"
                    sx={{ mb: 2 }}>
                    <Avatar
                        src={user.avatar}
                        alt={user.name}
                        sx={{
                            width: 80,
                            height: 80,
                            bgcolor: "primary.main",
                            mb: 1,
                        }}>
                        {user.name?.charAt(0)}
                    </Avatar>

                    <Box>
                        <Typography variant="h6" fontWeight={500} noWrap>
                            {user.name}
                            {isCreatorTab && (
                                <Chip
                                    label="Creator"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ ml: 1 }}
                                />
                            )}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            sx={{ maxWidth: "100%" }}>
                            {user.email}
                        </Typography>
                    </Box>
                </Stack>

                <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    sx={{ mt: 2 }}>
                    <Chip
                        icon={<Groups fontSize="small" />}
                        label={`Created: ${
                            user.communitiesCreated?.length || 0
                        }`}
                        size="small"
                        variant="outlined"
                    />
                    <Chip
                        icon={<Groups fontSize="small" />}
                        label={`Joined: ${user.communitiesJoined?.length || 0}`}
                        size="small"
                        variant="outlined"
                    />
                </Stack>
            </CardContent>

            <Box sx={{ p: 2, pt: 0 }}>
                <Stack
                    direction={isMobile ? "column" : "row"}
                    spacing={1}
                    justifyContent="center">
                    <Button
                        variant="outlined"
                        startIcon={<SwitchAccount />}
                        onClick={() =>
                            onRoleChange(
                                user._id,
                                isCreatorTab ? "user" : "creator"
                            )
                        }
                        color={isCreatorTab ? "secondary" : "primary"}
                        size="small"
                        fullWidth={isMobile}>
                        Make {isCreatorTab ? "User" : "Creator"}
                    </Button>
                    <Button
                        variant="contained"
                        component={Link}
                        to={`/admin/dashboard/user/${user._id}`}
                        color="primary"
                        size="small"
                        fullWidth={isMobile}>
                        View Details
                    </Button>
                </Stack>
            </Box>
        </Card>
    );
};

const Users = () => {
    const { analyticsData, isAnalyticsDataLoading, refetchAnalyticsData } =
        useAdminAnalyticsData();
    const [tabValue, setTabValue] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { users } = analyticsData || {};
    const { creatorRoles, userRoles } = users || {};

    const { token } = useToken();

    const handleRoleChangeClick = (userId, role) => {
        setSelectedUser(userId);
        setNewRole(role);
        setOpenDialog(true);
    };

    const handleConfirmRoleChange = async () => {
        setIsLoading(true);
        try {
            await axios.put(
                `${serVer}/admin/role-change/${selectedUser}`,
                { newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(`Role changed to ${newRole}`);
            refetchAnalyticsData();
            setOpenDialog(false);
        } catch (error) {
            toast.error(error?.response.data || "Failed to change role");
        } finally {
            setIsLoading(false);
        }
    };

    if (isAnalyticsDataLoading) {
        return <PageLoader />;
    }

    // Determine which data to show based on active tab
    const currentUsers = tabValue === 0 ? userRoles : creatorRoles;
    const title = tabValue === 0 ? "Regular Users" : "Creators";
    const icon = tabValue === 0 ? <People /> : <GroupAdd />;

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
                <People fontSize="large" /> Users Management
            </Typography>

            <Paper elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    variant="fullWidth"
                    sx={{ borderRadius: 2 }}>
                    <Tab
                        label={`Users (${userRoles?.length || 0})`}
                        icon={<People />}
                        iconPosition="start"
                    />
                    <Tab
                        label={`Creators (${creatorRoles?.length || 0})`}
                        icon={<GroupAdd />}
                        iconPosition="start"
                    />
                </Tabs>
            </Paper>

            <Card elevation={3} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 3,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            fontWeight: 500,
                        }}>
                        {icon} {title}
                    </Typography>

                    {currentUsers?.length > 0 ? (
                        <Grid container spacing={3}>
                            {currentUsers.map((user) => (
                                <Grid size={{ xs: 12, md: 4 }} key={user._id}>
                                    <UserCard
                                        user={user}
                                        isCreatorTab={tabValue === 1}
                                        onRoleChange={handleRoleChangeClick}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            textAlign="center"
                            sx={{ p: 3 }}>
                            No {title.toLowerCase()} found
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* Role Change Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                aria-labelledby="role-change-dialog">
                <DialogTitle id="role-change-dialog">
                    Confirm Role Change
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to change this user&apos;s role to{" "}
                        {newRole}?
                    </DialogContentText>
                    <DialogContentText sx={{ mt: 2, color: "warning.main" }}>
                        Note: This action will immediately affect the
                        user&apos;s permissions.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmRoleChange}
                        color="primary"
                        variant="contained"
                        autoFocus
                        disabled={isLoading}>
                        {isLoading ? (
                            <CircularProgress color="inherit" size={20} />
                        ) : (
                            "Confirm"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Users;
