import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    useTheme,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { usePayment, useRenewalPayment } from "../../Hooks/usePayment";
import { CardElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const PaymentDialog = ({
    open,
    onClose,
    amount: initialAmount,
    data,
    onPaymentSuccess,
    type,
}) => {
    const theme = useTheme();
    const { handlePayment, paymentProcessing } = usePayment();
    const [subscriptionPeriod, setSubscriptionPeriod] = useState("monthly");
    const [currentAmount, setCurrentAmount] = useState(initialAmount);

    const isCommunityCreation = type === "community_creation";
    const isCommunityMemberSubscription = type === "community_subscription";
    const isCommunityMembershipRenewal = type === "community_renewal";
    const isStoragePurchase = type === "storage_purchase";

    const handleType = {
        isCommunityCreation,
        isCommunityMemberSubscription,
        isCommunityMembershipRenewal,
        isStoragePurchase,
    };

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setSubscriptionPeriod("monthly");
            setCurrentAmount(initialAmount);
        }
    }, [open, initialAmount]);

    // Update amount when subscription period changes
    useEffect(() => {
        if (handleType.isCommunityMemberSubscription) {
            const newAmount =
                subscriptionPeriod === "yearly"
                    ? initialAmount * 12
                    : initialAmount;
            setCurrentAmount(newAmount);
        }
    }, [
        subscriptionPeriod,
        initialAmount,
        handleType.isCommunityMemberSubscription,
    ]);

    const handleSubmit = async () => {
        const success = await handlePayment({
            amount: currentAmount,
            onSuccess: onPaymentSuccess,
            type,
            handleType,
            data,
        });
        if (success) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Pay ${currentAmount}
                {handleType.isCommunityMemberSubscription &&
                    `${
                        subscriptionPeriod === "yearly" ? "year" : "month"
                    } to join`}
                {handleType.isCommunityCreation && "/year to create"}
                {handleType.isStoragePurchase && " for storage upgrade"}
            </DialogTitle>
            <DialogContent>
                {/* Subscription period selector */}
                {handleType.isCommunityMemberSubscription && (
                    <FormControl fullWidth sx={{ mb: 5 }}>
                        <InputLabel>Subscription Type</InputLabel>
                        <Select
                            value={subscriptionPeriod}
                            onChange={(e) =>
                                setSubscriptionPeriod(e.target.value)
                            }
                            label="Subscription Type"
                            disabled={paymentProcessing}>
                            <MenuItem value="monthly">
                                Monthly (${initialAmount}/month)
                            </MenuItem>
                            <MenuItem value="yearly">
                                Yearly (${initialAmount * 12}/year)
                            </MenuItem>
                        </Select>
                    </FormControl>
                )}

                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: "16px",
                                color: theme.palette.text.primary,
                                "::placeholder": {
                                    color: theme.palette.text.secondary,
                                },
                            },
                        },
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color="error"
                    variant="outlined"
                    onClick={onClose}
                    disabled={paymentProcessing}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disabled={paymentProcessing}>
                    {paymentProcessing ? (
                        <CircularProgress size={24} />
                    ) : (
                        "Pay Now"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// renew subscription dialog
export const RenewSubscriptionDialog = ({
    open,
    onClose,
    status,
    amount,
    communityId,
    refetchUserMembership,
}) => {
    const theme = useTheme();
    const {
        handlePaymentRenewal,
        handleCancelSubscription,
        paymentRenewalProcessing,
        paymentCancel,
    } = useRenewalPayment();

    const navigate = useNavigate();

    const handleSubmit = async () => {
        const success = await handlePaymentRenewal({
            amount,
            communityId,
            type: "community_subscription",
        });
        if (success) {
            await refetchUserMembership();
            onClose();
        }
    };

    const handelCancel = async () => {
        if (status === "canceled") {
            navigate("/");
        } else {
            await handleCancelSubscription({
                communityId,
                refetchUserMembership,
            });
        }
    };

    return (
        <Dialog open={open} maxWidth="xs" fullWidth>
            <DialogTitle fontSize="1.1rem">
                Your Community Subscription is{" "}
                {status === "canceled" ? "Canceled" : "Expired"}!
            </DialogTitle>
            <DialogContent>
                <Box mb={4}>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom>
                        Pay ${amount} to renew your subscription to continue
                        enjoying the benefits of being a member of this
                        community.
                    </Typography>
                    {status !== "canceled" && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom>
                            Canceling your subscription will remove you from the
                            community and you will lose access to all its data.
                        </Typography>
                    )}
                </Box>
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: "16px",
                                color: theme.palette.text.primary,
                                "::placeholder": {
                                    color: theme.palette.text.secondary,
                                },
                            },
                        },
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    color="error"
                    variant="outlined"
                    onClick={handelCancel}
                    disabled={paymentRenewalProcessing || paymentCancel}>
                    {paymentCancel ? (
                        <CircularProgress size={24} color="error" />
                    ) : status === "canceled" ? (
                        "Go Home"
                    ) : (
                        "Cancel Subscription"
                    )}
                </Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disabled={paymentRenewalProcessing || paymentCancel}>
                    {paymentRenewalProcessing ? (
                        <CircularProgress size={24} />
                    ) : (
                        "Pay Now"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
