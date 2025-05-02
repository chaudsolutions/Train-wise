import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    useTheme,
} from "@mui/material";
import { usePayment } from "../../Hooks/usePayment";
import { CardElement } from "@stripe/react-stripe-js";

export const PaymentDialog = ({
    open,
    onClose,
    amount,
    onPaymentSuccess,
    type,
}) => {
    const theme = useTheme();
    const { handlePayment, paymentProcessing } = usePayment();

    const handleSubmit = async () => {
        const success = await handlePayment(amount, onPaymentSuccess, type);
        if (success) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Pay ${amount}/month to Join Community</DialogTitle>
            <DialogContent>
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
