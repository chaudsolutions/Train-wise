import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
    Chip,
    Divider,
    List,
    ListItem,
    TextField,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Collapse,
    IconButton,
} from "@mui/material";
import {
    HourglassEmpty as PendingIcon,
    CheckCircle as ApprovedIcon,
    Cancel as RejectedIcon,
    DoneAll as ConfirmedIcon,
    Close as CloseIcon,
    Edit as EditIcon,
} from "@mui/icons-material";
import PageLoader from "../../Animations/PageLoader";
import { useUserWithdrawals } from "../../Hooks/useQueryFetch/useQueryData";
import { format } from "date-fns";
import axios from "axios";
import toast from "react-hot-toast";
import { serVer, useToken } from "../../Hooks/useVariable";

const statusIcons = {
    pending: <PendingIcon fontSize="small" />,
    approved: <ApprovedIcon fontSize="small" />,
    rejected: <RejectedIcon fontSize="small" />,
    confirmed: <ConfirmedIcon fontSize="small" />,
};

const statusColors = {
    pending: "warning",
    approved: "info",
    rejected: "error",
    confirmed: "success",
};

const paymentMethodOptions = [
    { value: "bank", label: "Bank Transfer" },
    { value: "paypal", label: "PayPal" },
    { value: "crypto", label: "Crypto Wallet" },
];

const Withdrawals = () => {
    const [tabValue, setTabValue] = useState(0);
    const [editMode, setEditMode] = useState(false);
    const [successAlert, setSuccessAlert] = useState(false);
    const {
        withdrawalsData,
        isWithdrawalsDataLoading,
        refetchWithdrawalsData,
    } = useUserWithdrawals();
    const { withdrawals, paymentDetails } = withdrawalsData || {};
    const { token } = useToken();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            methodType: paymentDetails?.methodType || "bank",
            bankName: paymentDetails?.bankName || "",
            accountNumber: paymentDetails?.accountNumber || "",
            accountRouting: paymentDetails?.accountRouting || "",
            accountName: paymentDetails?.accountName || "",
            paypalEmail: paymentDetails?.paypalEmail || "",
            cryptoWalletName: paymentDetails?.cryptoWalletName || "",
            cryptoWalletAddress: paymentDetails?.cryptoWalletAddress || "",
        },
    });

    const onSubmit = async (data) => {
        try {
            // Filter out empty fields based on payment method
            const payload = {
                methodType: data.methodType,
                ...(data.methodType === "bank"
                    ? {
                          bankName: data.bankName,
                          accountNumber: data.accountNumber,
                          accountRouting: data.accountRouting,
                          accountName: data.accountName,
                      }
                    : {}),
                ...(data.methodType === "paypal"
                    ? {
                          paypalEmail: data.paypalEmail,
                      }
                    : {}),
                ...(data.methodType === "crypto"
                    ? {
                          cryptoWalletName: data.cryptoWalletName,
                          cryptoWalletAddress: data.cryptoWalletAddress,
                      }
                    : {}),
            };

            const res = await axios.put(
                `${serVer}/user/payment-details`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(res.data);

            setSuccessAlert(true);
            setEditMode(false);
            refetchWithdrawalsData();
        } catch (error) {
            toast.error(error.response.data || "Failed to update");
            console.error("Error updating payment details:", error);
        }
    };

    const handleEditClick = () => {
        reset({
            methodType: paymentDetails?.methodType || "bank",
            bankName: paymentDetails?.bankName || "",
            accountNumber: paymentDetails?.accountNumber || "",
            accountName: paymentDetails?.accountName || "",
            accountRouting: paymentDetails?.accountRouting || "",
            paypalEmail: paymentDetails?.paypalEmail || "",
            cryptoWalletCoin: paymentDetails?.cryptoWalletCoin || "",
            cryptoWalletAddress: paymentDetails?.cryptoWalletAddress || "",
        });
        setEditMode(true);
    };

    if (isWithdrawalsDataLoading) {
        return <PageLoader />;
    }

    // Group withdrawals by status
    const groupedWithdrawals = withdrawals?.reduce((acc, withdrawal) => {
        if (!acc[withdrawal.status]) {
            acc[withdrawal.status] = [];
        }
        acc[withdrawal.status].push(withdrawal);
        return acc;
    }, {});

    const statusTabs = [
        { value: "pending", label: "Pending" },
        { value: "rejected", label: "Rejected" },
        { value: "approved", label: "Approved" },
        { value: "confirmed", label: "Confirmed" },
    ];

    const currentStatus = statusTabs[tabValue]?.value;
    const currentWithdrawals = groupedWithdrawals?.[currentStatus] || [];

    const handleChangeTab = (event, newValue) => {
        setTabValue(newValue);
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), "MMM dd, yyyy - hh:mm a");
    };

    const maskAccountNumber = (number) => {
        if (!number) return "";
        return "••••" + number.slice(-4);
    };

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
                Withdrawal History
            </Typography>

            <Collapse in={successAlert}>
                <Alert
                    severity="success"
                    action={
                        <IconButton
                            size="small"
                            onClick={() => setSuccessAlert(false)}>
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                    sx={{ mb: 3 }}>
                    Payment details updated successfully!
                </Alert>
            </Collapse>

            {/* Payment Details Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}>
                    <Typography variant="h6" fontWeight="bold">
                        Payment Details
                    </Typography>
                    {!editMode && (
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={handleEditClick}>
                            Edit
                        </Button>
                    )}
                </Box>

                {editMode ? (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Payment Method</InputLabel>
                            <Select
                                label="Payment Method"
                                {...register("methodType", {
                                    required: "Payment method is required",
                                })}
                                error={!!errors.methodType}>
                                {paymentMethodOptions.map((option) => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {watch("methodType") === "bank" && (
                            <>
                                <TextField
                                    label="Bank Name"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    {...register("bankName", {
                                        required:
                                            "Bank name is required for bank transfers",
                                    })}
                                    error={!!errors.bankName}
                                    helperText={errors.bankName?.message}
                                />
                                <TextField
                                    type="number"
                                    label="Account Number"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    {...register("accountNumber", {
                                        required: "Account number is required",
                                        minLength: {
                                            value: 8,
                                            message:
                                                "Account number must be at least 8 characters",
                                        },
                                    })}
                                    error={!!errors.accountNumber}
                                    helperText={errors.accountNumber?.message}
                                />
                                <TextField
                                    type="number"
                                    label="Routing Number"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    {...register("accountRouting")}
                                />
                                <TextField
                                    label="Account Holder Name"
                                    fullWidth
                                    {...register("accountName", {
                                        required:
                                            "Account holder name is required",
                                    })}
                                    error={!!errors.accountName}
                                    helperText={errors.accountName?.message}
                                />
                            </>
                        )}

                        {watch("methodType") === "paypal" && (
                            <TextField
                                label="PayPal Email"
                                fullWidth
                                {...register("paypalEmail", {
                                    required: "PayPal email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address",
                                    },
                                })}
                                error={!!errors.paypalEmail}
                                helperText={errors.paypalEmail?.message}
                            />
                        )}

                        {watch("methodType") === "crypto" && (
                            <>
                                <TextField
                                    label="Wallet Name"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    {...register("cryptoWalletName", {
                                        required: "Wallet name is required",
                                    })}
                                    error={!!errors.cryptoWalletName}
                                    helperText={
                                        errors.cryptoWalletName?.message
                                    }
                                />
                                <TextField
                                    label="Wallet Address"
                                    fullWidth
                                    {...register("cryptoWalletAddress", {
                                        required: "Wallet address is required",
                                        minLength: {
                                            value: 20,
                                            message:
                                                "Wallet address must be at least 20 characters",
                                        },
                                    })}
                                    error={!!errors.cryptoWalletAddress}
                                    helperText={
                                        errors.cryptoWalletAddress?.message
                                    }
                                />
                            </>
                        )}

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 2,
                                mt: 3,
                            }}>
                            <Button
                                variant="outlined"
                                onClick={() => setEditMode(false)}
                                disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </Box>
                    </form>
                ) : paymentDetails ? (
                    <>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Method:</strong>{" "}
                            {paymentDetails.methodType.toUpperCase()}
                        </Typography>

                        {paymentDetails.methodType === "bank" && (
                            <>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Bank:</strong>{" "}
                                    {paymentDetails.bankName}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Account:</strong>{" "}
                                    {maskAccountNumber(
                                        paymentDetails.accountNumber
                                    )}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    <strong>Routing:</strong>{" "}
                                    {maskAccountNumber(
                                        paymentDetails.accountRouting
                                    )}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Name:</strong>{" "}
                                    {paymentDetails.accountName}
                                </Typography>
                            </>
                        )}

                        {paymentDetails.methodType === "paypal" && (
                            <Typography variant="body1">
                                <strong>Email:</strong>{" "}
                                {paymentDetails.paypalEmail}
                            </Typography>
                        )}

                        {paymentDetails.methodType === "crypto" && (
                            <>
                                <Typography variant="body1">
                                    <strong>Name:</strong>{" "}
                                    {paymentDetails.cryptoWalletName}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Wallet:</strong>{" "}
                                    {maskAccountNumber(
                                        paymentDetails.cryptoWalletAddress
                                    )}
                                </Typography>
                            </>
                        )}

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 2, display: "block" }}>
                            Last updated: {formatDate(paymentDetails.updatedAt)}
                        </Typography>
                    </>
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        No payment details found. Please add your payment
                        information.
                    </Typography>
                )}
            </Paper>

            {/* Withdrawals History Section */}
            <Paper elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleChangeTab}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderRadius: 2 }}>
                    {statusTabs.map((tab) => (
                        <Tab
                            key={tab.value}
                            label={
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}>
                                    {statusIcons[tab.value]}
                                    {tab.label}
                                    <Chip
                                        label={
                                            groupedWithdrawals?.[tab.value]
                                                ?.length || 0
                                        }
                                        size="small"
                                        sx={{ ml: 1 }}
                                    />
                                </Box>
                            }
                        />
                    ))}
                </Tabs>
            </Paper>

            <Paper elevation={3} sx={{ borderRadius: 2 }}>
                {currentWithdrawals.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="body1" color="text.secondary">
                            No {currentStatus} withdrawals found
                        </Typography>
                    </Box>
                ) : (
                    <List>
                        {currentWithdrawals.map((withdrawal, index) => (
                            <Fragment key={withdrawal._id}>
                                <ListItem sx={{ py: 2 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            width: "100%",
                                        }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 1,
                                            }}>
                                            <Typography
                                                variant="body1"
                                                fontWeight="medium">
                                                ${withdrawal.amount.toFixed(2)}
                                            </Typography>
                                            <Chip
                                                icon={
                                                    statusIcons[
                                                        withdrawal.status
                                                    ]
                                                }
                                                label={withdrawal.status}
                                                color={
                                                    statusColors[
                                                        withdrawal.status
                                                    ]
                                                }
                                                variant="outlined"
                                                size="small"
                                            />
                                        </Box>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary">
                                            Requested:{" "}
                                            {formatDate(withdrawal.createdAt)}
                                        </Typography>

                                        {withdrawal.status === "rejected" &&
                                            withdrawal.adminNote && (
                                                <Typography
                                                    variant="caption"
                                                    color="error.main"
                                                    sx={{ mt: 1 }}>
                                                    Note: {withdrawal.adminNote}
                                                </Typography>
                                            )}

                                        {withdrawal.status === "confirmed" && (
                                            <Typography
                                                variant="caption"
                                                color="success.main"
                                                sx={{ mt: 1 }}>
                                                Processed:{" "}
                                                {formatDate(
                                                    withdrawal.updatedAt
                                                )}
                                            </Typography>
                                        )}
                                    </Box>
                                </ListItem>
                                {index < currentWithdrawals.length - 1 && (
                                    <Divider />
                                )}
                            </Fragment>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
};

export default Withdrawals;
