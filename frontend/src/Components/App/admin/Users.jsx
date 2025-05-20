import {
    Box,
    Typography,
    Tabs,
    Tab,
    Card,
    CardContent,
    Avatar,
    List,
    ListItem,
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
import { People, GroupAdd, SwitchAccount, Groups } from "@mui/icons-material";
import { useState } from "react";
import { useAdminAnalyticsData } from "../../Hooks/useQueryFetch/useQueryData";
import { Link } from "react-router-dom";
import PageLoader from "../../Animations/PageLoader";
import axios from "axios";
import { serVer, useToken } from "../../Hooks/useVariable";
import toast from "react-hot-toast";

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
            // Refetch analytics data if needed
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

            <Card
                elevation={3}
                sx={{
                    borderRadius: 2,
                    bgcolor: "background.paper",
                }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {tabValue === 0 ? (
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
                                <People /> Regular Users
                            </Typography>
                            {userRoles?.length > 0 ? (
                                <List>
                                    {userRoles.map((user) => (
                                        <Paper
                                            key={user._id}
                                            elevation={1}
                                            sx={{
                                                mb: 2,
                                                borderRadius: 2,
                                                transition:
                                                    "transform 0.2s, box-shadow 0.2s",
                                                "&:hover": {
                                                    transform:
                                                        "translateY(-2px)",
                                                    boxShadow:
                                                        "0 4px 12px rgba(0,0,0,0.1)",
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
                                                    <Grid
                                                        size={{
                                                            xs: 12,
                                                            sm: 6,
                                                            md: 7,
                                                            lg: 8,
                                                        }}>
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 2,
                                                            }}>
                                                            <ListItemAvatar>
                                                                <Avatar
                                                                    src={
                                                                        user.avatar
                                                                    }
                                                                    alt={
                                                                        user.name
                                                                    }
                                                                    sx={{
                                                                        width: 48,
                                                                        height: 48,
                                                                        bgcolor:
                                                                            "info.main",
                                                                    }}>
                                                                    {user.name?.charAt(
                                                                        0
                                                                    )}
                                                                </Avatar>
                                                            </ListItemAvatar>
                                                            <ListItemText
                                                                primary={
                                                                    user.name
                                                                }
                                                                secondary={
                                                                    user.email
                                                                }
                                                                primaryTypographyProps={{
                                                                    fontWeight: 500,
                                                                    variant:
                                                                        "body1",
                                                                    noWrap: true,
                                                                }}
                                                                secondaryTypographyProps={{
                                                                    variant:
                                                                        "body2",
                                                                    color: "text.secondary",
                                                                    noWrap: true,
                                                                }}
                                                            />
                                                        </Box>
                                                    </Grid>
                                                    {(user.communitiesCreated
                                                        ?.length ||
                                                        user.communitiesJoined
                                                            ?.length) > 0 && (
                                                        <Grid
                                                            size={{
                                                                xs: 12,
                                                                sm: 6,
                                                                md: 7,
                                                                lg: 8,
                                                            }}>
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
                                                                    display:
                                                                        "flex",
                                                                    flexWrap:
                                                                        "wrap",
                                                                    gap: 1,
                                                                    px: {
                                                                        xs: 0,
                                                                        sm: 2,
                                                                    },
                                                                }}>
                                                                <Chip
                                                                    icon={
                                                                        <Groups fontSize="small" />
                                                                    }
                                                                    label={`Created: ${
                                                                        user
                                                                            .communitiesCreated
                                                                            ?.length ||
                                                                        0
                                                                    }`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        bgcolor:
                                                                            "background.paper",
                                                                    }}
                                                                />
                                                                <Chip
                                                                    icon={
                                                                        <Groups fontSize="small" />
                                                                    }
                                                                    label={`Joined: ${
                                                                        user
                                                                            .communitiesJoined
                                                                            ?.length ||
                                                                        0
                                                                    }`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        bgcolor:
                                                                            "background.paper",
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Grid>
                                                    )}
                                                    <Grid
                                                        size={{
                                                            xs: 12,
                                                            sm: 6,
                                                            md: 5,
                                                            lg: 4,
                                                        }}>
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                flexDirection: {
                                                                    xs: "column",
                                                                    md: "row",
                                                                },
                                                                gap: 1,
                                                                justifyContent:
                                                                    "flex-end",
                                                                alignItems: {
                                                                    xs: "stretch",
                                                                    md: "center",
                                                                },
                                                            }}>
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={
                                                                    <SwitchAccount />
                                                                }
                                                                onClick={() =>
                                                                    handleRoleChangeClick(
                                                                        user._id,
                                                                        "creator"
                                                                    )
                                                                }
                                                                color="primary"
                                                                size="small"
                                                                sx={{
                                                                    flex: {
                                                                        xs: "1 0 100%",
                                                                        md: "0 1 auto",
                                                                    },
                                                                }}>
                                                                Make Creator
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                component={Link}
                                                                to={`/admin/dashboard/user/${user._id}`}
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
                                    ))}
                                </List>
                            ) : (
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ p: 2 }}>
                                    No regular users found
                                </Typography>
                            )}
                        </>
                    ) : (
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
                                <GroupAdd />
                                Creators
                            </Typography>
                            {creatorRoles?.length > 0 ? (
                                <List>
                                    {creatorRoles.map((user) => (
                                        <Paper
                                            key={user._id}
                                            elevation={1}
                                            sx={{
                                                mb: 2,
                                                borderRadius: 2,
                                                transition:
                                                    "transform 0.2s, box-shadow 0.2s",
                                                "&:hover": {
                                                    transform:
                                                        "translateY(-2px)",
                                                    boxShadow:
                                                        "0 4px 12px rgba(0,0,0,0.1)",
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
                                                    <Grid
                                                        size={{
                                                            xs: 12,
                                                            sm: 6,
                                                            md: 7,
                                                            lg: 8,
                                                        }}>
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: 2,
                                                            }}>
                                                            <ListItemAvatar>
                                                                <Avatar
                                                                    src={
                                                                        user.avatar
                                                                    }
                                                                    alt={
                                                                        user.name
                                                                    }
                                                                    sx={{
                                                                        width: 48,
                                                                        height: 48,
                                                                        bgcolor:
                                                                            "info.main",
                                                                    }}>
                                                                    {user.name?.charAt(
                                                                        0
                                                                    )}
                                                                </Avatar>
                                                            </ListItemAvatar>
                                                            <ListItemText
                                                                primary={
                                                                    <Box
                                                                        sx={{
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            gap: 1,
                                                                            flexWrap:
                                                                                "wrap",
                                                                        }}>
                                                                        {
                                                                            user.name
                                                                        }
                                                                        <Chip
                                                                            label="Creator"
                                                                            size="small"
                                                                            color="primary"
                                                                            variant="outlined"
                                                                        />
                                                                    </Box>
                                                                }
                                                                secondary={
                                                                    user.email
                                                                }
                                                                primaryTypographyProps={{
                                                                    fontWeight: 500,
                                                                    variant:
                                                                        "body1",
                                                                    noWrap: true,
                                                                }}
                                                                secondaryTypographyProps={{
                                                                    variant:
                                                                        "body2",
                                                                    color: "text.secondary",
                                                                    noWrap: true,
                                                                }}
                                                            />
                                                        </Box>
                                                    </Grid>
                                                    {(user.communitiesCreated
                                                        ?.length ||
                                                        user.communitiesJoined
                                                            ?.length) > 0 && (
                                                        <Grid
                                                            size={{
                                                                xs: 12,
                                                                sm: 6,
                                                                md: 7,
                                                                lg: 8,
                                                            }}>
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
                                                                    display:
                                                                        "flex",
                                                                    flexWrap:
                                                                        "wrap",
                                                                    gap: 1,
                                                                    px: {
                                                                        xs: 0,
                                                                        sm: 2,
                                                                    },
                                                                }}>
                                                                <Chip
                                                                    icon={
                                                                        <Groups fontSize="small" />
                                                                    }
                                                                    label={`Created: ${
                                                                        user
                                                                            .communitiesCreated
                                                                            ?.length ||
                                                                        0
                                                                    }`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        bgcolor:
                                                                            "background.paper",
                                                                    }}
                                                                />
                                                                <Chip
                                                                    icon={
                                                                        <Groups fontSize="small" />
                                                                    }
                                                                    label={`Joined: ${
                                                                        user
                                                                            .communitiesJoined
                                                                            ?.length ||
                                                                        0
                                                                    }`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        bgcolor:
                                                                            "background.paper",
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Grid>
                                                    )}
                                                    <Grid
                                                        size={{
                                                            xs: 12,
                                                            sm: 6,
                                                            md: 5,
                                                            lg: 4,
                                                        }}>
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                flexDirection: {
                                                                    xs: "column",
                                                                    md: "row",
                                                                },
                                                                gap: 1,
                                                                justifyContent:
                                                                    "flex-end",
                                                                alignItems: {
                                                                    xs: "stretch",
                                                                    md: "center",
                                                                },
                                                            }}>
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={
                                                                    <SwitchAccount />
                                                                }
                                                                onClick={() =>
                                                                    handleRoleChangeClick(
                                                                        user._id,
                                                                        "user"
                                                                    )
                                                                }
                                                                color="secondary"
                                                                size="small"
                                                                sx={{
                                                                    flex: {
                                                                        xs: "1 0 100%",
                                                                        md: "0 1 auto",
                                                                    },
                                                                }}>
                                                                Make User
                                                            </Button>
                                                            <Button
                                                                variant="contained"
                                                                component={Link}
                                                                to={`/admin/dashboard/user/${user._id}`}
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
                                    ))}
                                </List>
                            ) : (
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ p: 2 }}>
                                    No creators found
                                </Typography>
                            )}
                        </>
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
                        autoFocus>
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
