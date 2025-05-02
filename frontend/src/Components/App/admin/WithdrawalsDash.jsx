import { useState } from "react";
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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import useResponsive from "../../Hooks/useResponsive";
import PageLoader from "../../Animations/PageLoader";
import axios from "axios";
import { serVer, useToken } from "../../Hooks/useVariable";
import toast from "react-hot-toast";
import { useAdminAnalyticsData } from "../../Hooks/useQueryFetch/useQueryData";

const WithdrawalsDash = () => {
    const { isMobile } = useResponsive();
    const { analyticsData, isAnalyticsDataLoading, refetchAnalyticsData } =
        useAdminAnalyticsData();
    const { token } = useToken();

    const { withdrawals } = analyticsData || {};

    // State for tabs
    const [tabValue, setTabValue] = useState("all");

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
            await axios.post(
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

    const columns = [
        {
            field: "userName",
            headerName: "User",
            width: isMobile ? 100 : 150,
            valueGetter: (params) => params?.row?.userId.name || "Unknown",
        },
        {
            field: "email",
            headerName: "Email",
            width: isMobile ? 120 : 180,
            valueGetter: (params) => params?.row?.userId.email || "N/A",
            hide: isMobile, // Hide on mobile
        },
        {
            field: "amount",
            headerName: "Amount",
            width: isMobile ? 70 : 100,
            renderCell: (params) => `$${params.value.toFixed(2)}`,
        },
        {
            field: "status",
            headerName: "Status",
            width: isMobile ? 90 : 120,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={
                        params.value === "pending"
                            ? "warning"
                            : params.value === "approved"
                            ? "success"
                            : params.value === "rejected"
                            ? "error"
                            : "info"
                    }
                    size="small"
                    sx={{ fontSize: isMobile ? "0.7rem" : "0.8rem" }}
                />
            ),
        },
        {
            field: "paymentMethod",
            headerName: "Method",
            width: isMobile ? 120 : 180,
            renderCell: (params) => {
                const pd = params.row.paymentDetails;
                if (!pd) return "Not provided";
                switch (pd.methodType) {
                    case "bank":
                        return `${pd.bankName || "Bank"} (...${
                            pd.accountNumber?.slice(-4) || "N/A"
                        })`;
                    case "paypal":
                        return `PayPal (${pd.paypalEmail || "N/A"})`;
                    case "crypto":
                        return `${pd.cryptoType || "Crypto"} (...${
                            pd.cryptoWalletAddress?.slice(-4) || "N/A"
                        })`;
                    case "other":
                        return "Other";
                    default:
                        return "Unknown";
                }
            },
        },
        {
            field: "createdAt",
            headerName: "Requested",
            width: isMobile ? 90 : 120,
            renderCell: (params) => new Date(params.value).toLocaleDateString(),
        },
        {
            field: "adminNote",
            headerName: "Note",
            width: isMobile ? 100 : 180,
            renderCell: (params) => params.value || "N/A",
            hide: isMobile, // Hide on mobile
        },
        {
            field: "actions",
            headerName: "Actions",
            width: isMobile ? 140 : 200,
            renderCell: (params) =>
                params.row.status === "pending" && (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 1,
                            width: "100%",
                        }}>
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() =>
                                handleOpenDialog(params.row, "approve")
                            }
                            sx={{
                                fontSize: isMobile ? "0.7rem" : "0.8rem",
                                minWidth: { xs: "100%", sm: "auto" },
                                py: { xs: 0.5, sm: 0.75 },
                            }}>
                            Approve
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() =>
                                handleOpenDialog(params.row, "reject")
                            }
                            sx={{
                                fontSize: isMobile ? "0.7rem" : "0.8rem",
                                minWidth: { xs: "100%", sm: "auto" },
                                py: { xs: 0.5, sm: 0.75 },
                            }}>
                            Reject
                        </Button>
                    </Box>
                ),
        },
    ];

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

    if (isAnalyticsDataLoading) {
        return <PageLoader />;
    }

    if (!withdrawals?.withdrawals) {
        return (
            <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 1400, mx: "auto" }}>
                <Typography
                    variant="h4"
                    sx={{
                        mb: 2,
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
        <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 1400, mx: "auto" }}>
            <Typography
                variant="h4"
                sx={{
                    mb: 2,
                    fontWeight: 700,
                    fontSize: { xs: "1.25rem", sm: "2rem" },
                }}>
                Withdrawals Dashboard
            </Typography>
            <Box
                sx={{
                    bgcolor: "background.paper",
                    borderRadius: 4,
                    boxShadow: 3,
                    overflow: "hidden",
                }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant={isMobile ? "scrollable" : "standard"}
                    scrollButtons="auto"
                    sx={{
                        borderBottom: 1,
                        borderColor: "divider",
                        "& .MuiTab-root": {
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            minHeight: { xs: 40, sm: 48 },
                            px: { xs: 1, sm: 2 },
                        },
                    }}>
                    <Tab label="All" value="all" />
                    <Tab label="Pending" value="pending" />
                    <Tab label="Approved" value="approved" />
                    <Tab label="Rejected" value="rejected" />
                    <Tab label="Confirmed" value="confirmed" />
                </Tabs>
                <Box sx={{ overflowX: "auto", px: { xs: 0, sm: 1 } }}>
                    <DataGrid
                        rows={getRowsForTab()}
                        columns={columns}
                        getRowId={(row) => row._id}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                        }}
                        autoHeight
                        disableRowSelectionOnClick
                        sx={{
                            "& .MuiDataGrid-cell": {
                                py: { xs: 0.5, sm: 1 },
                                fontSize: { xs: "0.7rem", sm: "0.9rem" },
                            },
                            "& .MuiDataGrid-columnHeaderTitle": {
                                fontWeight: 600,
                                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            },
                            "& .MuiDataGrid-columnHeader": {
                                py: { xs: 0.5, sm: 1 },
                            },
                            "& .MuiDataGrid-footerContainer": {
                                fontSize: { xs: "0.7rem", sm: "0.8rem" },
                            },
                            minWidth: isMobile ? 600 : "auto", // Ensure scrollable on mobile
                        }}
                    />
                </Box>
            </Box>

            {/* Action Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="xs"
                fullWidth
                sx={{ "& .MuiDialog-paper": { mx: { xs: 1, sm: 2 } } }}>
                <DialogTitle sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                    {actionType === "approve"
                        ? "Approve Withdrawal"
                        : "Reject Withdrawal"}
                </DialogTitle>
                <DialogContent>
                    <Typography
                        sx={{
                            mb: 2,
                            fontSize: { xs: "0.8rem", sm: "0.9rem" },
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
                        rows={3}
                        variant="outlined"
                        placeholder="Enter reason or note for this action"
                        sx={{
                            "& .MuiInputBase-root": {
                                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ gap: 1, px: { xs: 2, sm: 3 } }}>
                    <Button
                        onClick={handleCloseDialog}
                        color="primary"
                        disabled={isActionLoading}
                        sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" } }}>
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
