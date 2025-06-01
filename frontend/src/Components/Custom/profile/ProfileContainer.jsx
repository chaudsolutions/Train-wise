import {
    Box,
    Typography,
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
    Tabs,
    Tab,
    Grid,
    CircularProgress,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import GroupAdd from "@mui/icons-material/GroupAdd";
import EditIcon from "@mui/icons-material/Edit";
import Groups from "@mui/icons-material/Groups";
import CameraIcon from "@mui/icons-material/CameraAlt";
import { Link } from "react-router-dom";
import { useState } from "react";
import NoProfilePhoto from "../../../assets/no-profile.png";

const ProfileContainer = ({
    categories,
    user,
    communities,
    finances,
    handleProfileImage,
}) => {
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [amountError, setAmountError] = useState("");

    const {
        triggerFileInput,
        profileImage,
        fileInputRef,
        handleFileChange,
        withdrawBalance,
        btnLoad,
    } = handleProfileImage || {};

    const { created, joined } = communities || {};
    const { name, email, role, balance, avatar, createdAt } = user || {};
    const {
        communityCreationSpent,
        subscriptionRevenue,
        communityMembershipSpent,
    } = finances || {};

    const getCategoryIcon = (category) => {
        const categoryArr = categories.find((c) => c.name === category);
        return categoryArr ? categoryArr.icon : <Groups />;
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
        setWithdrawAmount("");
        setAmountError("");
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setWithdrawAmount("");
        setAmountError("");
    };

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            setAmountError("Please enter a valid amount");
            return;
        }
        if (amount > balance) {
            setAmountError("Amount exceeds available balance");
            return;
        }

        await withdrawBalance(amount);
        handleCloseDialog();
    };

    const handleAmountChange = (e) => {
        setWithdrawAmount(e.target.value);
        setAmountError("");
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 4,
            }}>
            {/* User Profile Card */}
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
                }}>
                <Box sx={{ position: "relative" }}>
                    <Avatar
                        src={avatar || NoProfilePhoto}
                        sx={{
                            width: 120,
                            height: 120,
                            fontSize: "3rem",
                            bgcolor: theme.palette.info.main,
                        }}>
                        {!avatar && name?.charAt(0).toUpperCase()}
                    </Avatar>
                    {handleProfileImage && (
                        <>
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
                        </>
                    )}
                </Box>
                <Typography variant="h5" fontWeight="bold">
                    {name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {email}
                </Typography>

                {handleProfileImage && (
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
                )}

                <Chip
                    label={role?.charAt(0).toUpperCase() + role?.slice(1)}
                    color={
                        role === "creator"
                            ? "primary"
                            : role === "admin"
                            ? "warning"
                            : "default"
                    }
                    variant="outlined"
                />
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        alignItems: "center",
                        mt: 2,
                    }}>
                    <Chip
                        icon={<CircleIcon color="success" fontSize="small" />}
                        label="Active"
                        variant="outlined"
                        sx={{ color: "success.main" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        Joined {new Date(createdAt)?.toLocaleDateString()}
                    </Typography>
                </Box>
            </Paper>

            {/* Communities and Finances */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4, flex: 2 }}>
                <Typography
                    variant="h5"
                    fontWeight="bold"
                    fontSize="1.3rem"
                    mb={2}>
                    User Analytics
                </Typography>
                <Divider />

                {/* Finances Section */}
                <Box sx={{ my: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                        Financial Overview
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight="bold">
                                    Withdrawable Balance
                                </Typography>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center">
                                    <Typography
                                        variant="h6"
                                        color="success.main">
                                        ${balance?.toFixed(2)}
                                    </Typography>
                                    {handleProfileImage && (
                                        <Button
                                            color="success"
                                            variant="contained"
                                            onClick={handleOpenDialog}
                                            disabled={
                                                !balance ||
                                                balance <= 0 ||
                                                btnLoad
                                            }>
                                            {btnLoad ? (
                                                <CircularProgress size={24} />
                                            ) : (
                                                "Withdraw"
                                            )}
                                        </Button>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight="bold">
                                    Community Subscriptions
                                </Typography>
                                <Typography variant="h6" color="success.main">
                                    ${subscriptionRevenue?.toFixed(2)}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight="bold">
                                    Community Creation
                                </Typography>
                                <Typography variant="h6" color="warning.dark">
                                    ${communityCreationSpent?.toFixed(2)}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight="bold">
                                    Community Memberships
                                </Typography>
                                <Typography variant="h6" color="warning.dark">
                                    ${communityMembershipSpent?.toFixed(2)}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                {/* Withdrawal Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>Withdraw Balance</DialogTitle>
                    <DialogContent>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={2}>
                            Available balance: ${balance?.toFixed(2)}
                        </Typography>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Amount to Withdraw"
                            type="number"
                            fullWidth
                            value={withdrawAmount}
                            onChange={handleAmountChange}
                            error={!!amountError}
                            helperText={amountError}
                            inputProps={{ min: 0, step: "0.01" }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} disabled={btnLoad}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleWithdraw}
                            color="success"
                            variant="contained"
                            disabled={
                                btnLoad || !!amountError || !withdrawAmount
                            }>
                            {btnLoad ? (
                                <CircularProgress size={24} />
                            ) : (
                                "Confirm"
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Communities Section */}
                <Box>
                    <Tabs
                        value={tabValue}
                        onChange={(e, newValue) => setTabValue(newValue)}
                        variant="fullWidth"
                        sx={{ mb: 2 }}>
                        <Tab
                            label={
                                <Typography
                                    component="h6"
                                    fontSize=".7rem"
                                    fontWeight="600">
                                    Created ({created?.length || 0})
                                </Typography>
                            }
                            icon={<GroupAdd />}
                            iconPosition="start"
                        />
                        <Tab
                            label={
                                <Typography
                                    component="h6"
                                    fontSize=".7rem"
                                    fontWeight="600">
                                    Joined ({joined?.length || 0})
                                </Typography>
                            }
                            icon={<Groups />}
                            iconPosition="start"
                        />
                    </Tabs>

                    {tabValue === 0 ? (
                        created?.length > 0 ? (
                            <List sx={{ width: "100%" }}>
                                {created.map((community) => (
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
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "center",
                                                            color: theme.palette
                                                                .info
                                                                .contrastText,
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
                                                <Box>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            gap: 1,
                                                            mt: 0.5,
                                                        }}>
                                                        <Chip
                                                            label="Owner"
                                                            size="small"
                                                            color="info"
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
                                                        component="div"
                                                        color="text.secondary">
                                                        Created:{" "}
                                                        {new Date(
                                                            community.memberSince
                                                        ).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondaryTypographyProps={{
                                                component: "div",
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ p: 2 }}>
                                No communities created
                            </Typography>
                        )
                    ) : joined?.length > 0 ? (
                        <List sx={{ width: "100%" }}>
                            {joined.map((community) => (
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
                                            <Box>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        gap: 1,
                                                        mt: 0.5,
                                                    }}>
                                                    <Chip
                                                        label="Member"
                                                        size="small"
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
                                                    component="div"
                                                    color="text.secondary">
                                                    Member since:{" "}
                                                    {new Date(
                                                        community.memberSince
                                                    ).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        }
                                        secondaryTypographyProps={{
                                            component: "div",
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ p: 2 }}>
                            No communities joined
                        </Typography>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default ProfileContainer;
