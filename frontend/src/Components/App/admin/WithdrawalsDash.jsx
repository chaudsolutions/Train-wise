import { Fragment, useState } from "react";
import {
    Box,
    Typography,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Tabs,
    Tab,
    Paper,
    List,
    ListItem,
    Divider,
} from "@mui/material";
import {
    HourglassEmpty as PendingIcon,
    CheckCircle as ApprovedIcon,
    Cancel as RejectedIcon,
    DoneAll as ConfirmedIcon,
} from "@mui/icons-material";
import PageLoader from "../../Animations/PageLoader";
import axios from "axios";
import { serVer, useToken } from "../../Hooks/useVariable";
import toast from "react-hot-toast";
import { useAdminAnalyticsData } from "../../Hooks/useQueryFetch/useQueryData";

const statusIcons = {
    pending: <PendingIcon fontSize="small" />,
    approved: <ApprovedIcon fontSize="small" />,
    rejected: <RejectedIcon fontSize="small" />,
    confirmed: <ConfirmedIcon fontSize="small" />,
};

const statusColors = {
    pending: "warning",
    approved: "success",
    rejected: "error",
    confirmed: "info",
};

const WithdrawalsDash = () => {
    const { analyticsData, isAnalyticsDataLoading, refetchAnalyticsData } =
        useAdminAnalyticsData();
    const { token } = useToken();

    const { withdrawals } = analyticsData || {};

    // State for tabs
    const [tabValue, setTabValue] = useState("pending");

    // State for dialog and action
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [actionType, setActionType] = useState("");
    const [adminNote, setAdminNote] = useState("");
    const [isActionLoading, setIsActionLoading] = useState(false);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleOpenDialog = (withdrawal, action) => {
        setSelectedWithdrawal(withdrawal);
        setActionType(action);
        setAdminNote(withdrawal.adminNote || "");
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedWithdrawal(null);
        setActionType("");
        setAdminNote("");
    };

    const handleAction = async () => {
        if (!selectedWithdrawal || !actionType) return;

        setIsActionLoading(true);
        try {
            const endpoint = `${serVer}/admin/withdrawal/${selectedWithdrawal._id}/${actionType}`;
            await axios.put(
                endpoint,
                { adminNote },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Withdrawal ${actionType}d successfully`);
            refetchAnalyticsData();
            handleCloseDialog();
        } catch (error) {
            toast.error(
                `Failed to ${actionType} withdrawal: ${
                    error.response?.data?.message || error.message
                }`
            );
        } finally {
            setIsActionLoading(false);
        }
    };

    const getRowsForTab = () => {
        if (!withdrawals) return [];
        switch (tabValue) {
            case "pending":
                return withdrawals.pendingWithdrawals || [];
            case "approved":
                return withdrawals.approvedWithdrawals || [];
            case "rejected":
                return withdrawals.rejectedWithdrawals || [];
            case "confirmed":
                return withdrawals.confirmedWithdrawals || [];
            case "all":
            default:
                return withdrawals.withdrawals || [];
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatPaymentMethod = (pd) => {
        if (!pd) return "Not provided";
        switch (pd.methodType) {
            case "bank":
                return `${pd.bankName || "Bank"}, (${
                    pd.accountNumber || "N/A"
                })`;
            case "paypal":
                return `PayPal (${pd.paypalEmail || "N/A"})`;
            case "crypto":
                return `${pd.cryptoWalletName || "Crypto"} (${
                    pd.cryptoWalletAddress || "N/A"
                })`;
            case "other":
                return "Other";
            default:
                return "Unknown";
        }
    };

    const statusTabs = [
        { value: "all", label: "All" },
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
        { value: "confirmed", label: "Confirmed" },
    ];

    const groupedWithdrawals = withdrawals?.withdrawals?.reduce(
        (acc, withdrawal) => {
            if (!acc[withdrawal.status]) {
                acc[withdrawal.status] = [];
            }
            acc[withdrawal.status].push(withdrawal);
            return acc;
        },
        {}
    );

    if (isAnalyticsDataLoading) {
        return <PageLoader />;
    }

    if (!withdrawals?.withdrawals) {
        return (
            <Box
                sx={{
                    p: { xs: 2, sm: 3 },
                    maxWidth: 1400,
                    mx: "auto",
                    overflowX: "hidden",
                }}>
                <Typography
                    variant="h4"
                    sx={{
                        mb: 3,
                        fontWeight: 700,
                        fontSize: { xs: "1.25rem", sm: "2rem" },
                    }}>
                    Withdrawals Dashboard
                </Typography>
                <Typography color="error">
                    No withdrawals data available
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 3 },
            }}>
            <Typography
                variant="h4"
                sx={{
                    mb: 3,
                    fontWeight: 700,
                    fontSize: { xs: "1.25rem", sm: "2rem" },
                }}>
                Withdrawals Dashboard
            </Typography>

            <Paper
                elevation={2}
                sx={{
                    mb: 3,
                    borderRadius: 8,
                    overflowX: "hidden",
                    width: "100%",
                }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{
                        borderBottom: 1,
                        borderColor: "divider",
                        "& .MuiTab-root": {
                            fontSize: { xs: "0.7rem", sm: "0.85rem" },
                            minHeight: { xs: 32, sm: 48 },
                            px: { xs: 1, sm: 2 },
                            textTransform: "none",
                        },
                        "& .MuiTabs-scrollButtons": {
                            color: "primary.main",
                        },
                    }}>
                    {statusTabs.map((tab) => (
                        <Tab
                            key={tab.value}
                            label={
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                    }}>
                                    {tab.value !== "all" &&
                                        statusIcons[tab.value]}
                                    {tab.label}
                                    <Chip
                                        label={
                                            tab.value === "all"
                                                ? withdrawals.withdrawals
                                                      ?.length || 0
                                                : groupedWithdrawals?.[
                                                      tab.value
                                                  ]?.length || 0
                                        }
                                        size="small"
                                        sx={{
                                            ml: 0.5,
                                            fontSize: {
                                                xs: "0.6rem",
                                                sm: "0.7rem",
                                            },
                                        }}
                                    />
                                </Box>
                            }
                            value={tab.value}
                        />
                    ))}
                </Tabs>
            </Paper>

            <List sx={{ width: "100%" }}>
                {getRowsForTab().length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="body1" color="text.secondary">
                            No {tabValue} withdrawals found
                        </Typography>
                    </Box>
                ) : (
                    getRowsForTab().map((withdrawal, index) => (
                        <Fragment key={withdrawal._id}>
                            <Paper
                                elevation={4}
                                sx={{
                                    m: { xs: 1, sm: 2 },
                                    borderRadius: 8,
                                    overflow: "hidden",
                                    maxWidth: "100%",
                                    boxSizing: "border-box",
                                    transition: "box-shadow 0.2s",
                                    "&:hover": {
                                        boxShadow: 6,
                                    },
                                }}>
                                <ListItem
                                    sx={{
                                        py: { xs: 1, sm: 1.5 },
                                        px: { xs: 1.5, sm: 2 },
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "flex-start",
                                        minHeight: { xs: "auto", sm: 180 },
                                    }}>
                                    <Box
                                        sx={{
                                            width: "100%",
                                            bgcolor: "grey.100",
                                            p: 1,
                                            borderRadius: "8px 8px 0 0",
                                            mb: 1,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}>
                                        <Typography
                                            variant="body1"
                                            fontWeight="medium"
                                            sx={{
                                                fontSize: {
                                                    xs: "0.85rem",
                                                    sm: "1rem",
                                                },
                                            }}>
                                            ${withdrawal.amount.toFixed(2)}
                                        </Typography>
                                        <Chip
                                            icon={
                                                statusIcons[withdrawal.status]
                                            }
                                            label={withdrawal.status}
                                            color={
                                                statusColors[withdrawal.status]
                                            }
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                fontSize: {
                                                    xs: "0.65rem",
                                                    sm: "0.75rem",
                                                },
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ width: "100%", px: 0.5 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                mb: 0.5,
                                                wordBreak: "break-word",
                                            }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    fontWeight: 600,
                                                    width: { xs: 80, sm: 100 },
                                                    fontSize: {
                                                        xs: "0.75rem",
                                                        sm: "0.85rem",
                                                    },
                                                }}>
                                                User:
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: {
                                                        xs: "0.75rem",
                                                        sm: "0.85rem",
                                                    },
                                                }}>
                                                {withdrawal.userId.name ||
                                                    "Unknown"}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                mb: 0.5,
                                                wordBreak: "break-word",
                                            }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    fontWeight: 600,
                                                    width: { xs: 80, sm: 100 },
                                                    fontSize: {
                                                        xs: "0.75rem",
                                                        sm: "0.85rem",
                                                    },
                                                }}>
                                                Email:
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: {
                                                        xs: "0.75rem",
                                                        sm: "0.85rem",
                                                    },
                                                }}>
                                                {withdrawal.userId.email ||
                                                    "N/A"}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                mb: 0.5,
                                                wordBreak: "break-word",
                                            }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    fontWeight: 600,
                                                    width: { xs: 80, sm: 100 },
                                                    fontSize: {
                                                        xs: "0.75rem",
                                                        sm: "0.85rem",
                                                    },
                                                }}>
                                                Method:
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: {
                                                        xs: "0.75rem",
                                                        sm: "0.85rem",
                                                    },
                                                }}>
                                                {formatPaymentMethod(
                                                    withdrawal.paymentDetails
                                                )}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                mb: 0.5,
                                                wordBreak: "break-word",
                                            }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    fontWeight: 600,
                                                    width: { xs: 80, sm: 100 },
                                                    fontSize: {
                                                        xs: "0.75rem",
                                                        sm: "0.85rem",
                                                    },
                                                }}>
                                                Requested:
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: {
                                                        xs: "0.75rem",
                                                        sm: "0.85rem",
                                                    },
                                                }}>
                                                {formatDate(
                                                    withdrawal.createdAt
                                                )}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                mb: 0.5,
                                                wordBreak: "break-word",
                                            }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    fontWeight: 600,
                                                    width: { xs: 80, sm: 100 },
                                                    fontSize: {
                                                        xs: "0.75rem",
                                                        sm: "0.85rem",
                                                    },
                                                }}>
                                                Note:
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: {
                                                        xs: "0.75rem",
                                                        sm: "0.85rem",
                                                    },
                                                }}>
                                                {withdrawal.adminNote || "N/A"}
                                            </Typography>
                                        </Box>
                                        {withdrawal.status === "rejected" &&
                                            withdrawal.adminNote && (
                                                <Typography
                                                    variant="caption"
                                                    color="error.main"
                                                    sx={{
                                                        mt: 0.5,
                                                        fontSize: {
                                                            xs: "0.65rem",
                                                            sm: "0.75rem",
                                                        },
                                                        wordBreak: "break-word",
                                                    }}>
                                                    Rejection Note:{" "}
                                                    {withdrawal.adminNote}
                                                </Typography>
                                            )}
                                        {withdrawal.status === "confirmed" && (
                                            <Typography
                                                variant="caption"
                                                color="success.main"
                                                sx={{
                                                    mt: 0.5,
                                                    fontSize: {
                                                        xs: "0.65rem",
                                                        sm: "0.75rem",
                                                    },
                                                }}>
                                                Processed:{" "}
                                                {formatDate(
                                                    withdrawal.updatedAt
                                                )}
                                            </Typography>
                                        )}
                                    </Box>
                                    {withdrawal.status === "pending" && (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 1,
                                                flexWrap: "wrap",
                                                width: "100%",
                                                justifyContent: {
                                                    xs: "flex-start",
                                                    sm: "flex-end",
                                                },
                                                mt: 1,
                                            }}>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                onClick={() =>
                                                    handleOpenDialog(
                                                        withdrawal,
                                                        "approve"
                                                    )
                                                }
                                                sx={{
                                                    fontSize: {
                                                        xs: "0.7rem",
                                                        sm: "0.8rem",
                                                    },
                                                    minWidth: {
                                                        xs: 90,
                                                        sm: 100,
                                                    },
                                                    borderRadius: 6,
                                                    bgcolor: "success.dark",
                                                    "&:hover": {
                                                        bgcolor: "success.main",
                                                    },
                                                }}>
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() =>
                                                    handleOpenDialog(
                                                        withdrawal,
                                                        "reject"
                                                    )
                                                }
                                                sx={{
                                                    fontSize: {
                                                        xs: "0.7rem",
                                                        sm: "0.8rem",
                                                    },
                                                    minWidth: {
                                                        xs: 90,
                                                        sm: 100,
                                                    },
                                                    borderRadius: 6,
                                                    borderColor: "error.dark",
                                                    color: "error.dark",
                                                    "&:hover": {
                                                        borderColor:
                                                            "error.main",
                                                        color: "error.main",
                                                    },
                                                }}>
                                                Reject
                                            </Button>
                                        </Box>
                                    )}
                                </ListItem>
                            </Paper>
                            {index < getRowsForTab().length - 1 && (
                                <Divider sx={{ my: 1 }} />
                            )}
                        </Fragment>
                    ))
                )}
            </List>

            {/* Action Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="xs"
                fullWidth
                sx={{
                    "& .MuiDialog-paper": {
                        mx: { xs: 1, sm: 2 },
                        borderRadius: 8,
                    },
                }}>
                <DialogTitle sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                    {actionType === "approve"
                        ? "Approve Withdrawal"
                        : "Reject Withdrawal"}
                </DialogTitle>
                <DialogContent>
                    <Typography
                        sx={{
                            mb: 2,
                            fontSize: { xs: "0.75rem", sm: "0.85rem" },
                        }}>
                        {actionType === "approve"
                            ? `Approve withdrawal of $${selectedWithdrawal?.amount?.toFixed(
                                  2
                              )} for ${selectedWithdrawal?.userId?.name}?`
                            : `Reject withdrawal of $${selectedWithdrawal?.amount?.toFixed(
                                  2
                              )} for ${selectedWithdrawal?.userId?.name}?`}
                    </Typography>
                    <TextField
                        label="Admin Note (optional)"
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        fullWidth
                        multiline
                        variant="outlined"
                        placeholder="Enter reason or note for this action"
                        sx={{
                            "& .MuiInputBase-root": {
                                fontSize: { xs: "0.75rem", sm: "0.85rem" },
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ gap: 1, px: { xs: 2, sm: 3 } }}>
                    <Button
                        onClick={handleCloseDialog}
                        color="primary"
                        disabled={isActionLoading}
                        sx={{
                            fontSize: { xs: "0.7rem", sm: "0.8rem" },
                            borderRadius: 6,
                        }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAction}
                        variant="contained"
                        color={actionType === "approve" ? "success" : "error"}
                        disabled={isActionLoading}
                        sx={{
                            fontSize: { xs: "0.7rem", sm: "0.8rem" },
                            minWidth: 100,
                            borderRadius: 6,
                            bgcolor:
                                actionType === "approve"
                                    ? "success.dark"
                                    : "error.dark",
                            "&:hover": {
                                bgcolor:
                                    actionType === "approve"
                                        ? "success.main"
                                        : "error.main",
                            },
                        }}>
                        {isActionLoading ? (
                            <CircularProgress size={20} />
                        ) : actionType === "approve" ? (
                            "Approve"
                        ) : (
                            "Reject"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WithdrawalsDash;
