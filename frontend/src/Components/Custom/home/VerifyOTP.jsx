import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
    Alert,
} from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import { serVer, useToken } from "../../Hooks/useVariable";
import { useUserData } from "../../Hooks/useQueryFetch/useQueryData";
import Logout from "../Buttons/Logout";
import { OtpKit } from "react-otp-kit";
import "react-otp-kit/dist/index.css";
import { useLogout } from "../../Hooks/useLogout";
import { useQueryClient } from "@tanstack/react-query";

const VerifyOTP = ({ email }) => {
    const { logout } = useLogout();
    const queryClient = useQueryClient(); // Get the query client

    const { userData, isUserDataLoading, refetchUserData } = useUserData();

    const { isVerified } = userData || {};

    const { token } = useToken();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [otp, setOtp] = useState("");

    const handleChange = (newOtp) => {
        setOtp(newOtp);
    };

    const handleVerify = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${serVer}/user/verify-account`,
                { otp },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(response?.data || "Verification successful");

            refetchUserData();
        } catch (err) {
            setError(err.response?.data || "Verification failed");
            console.error("Verification error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${serVer}/user/resend-verification`,
                { email },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(res.data || "OTP resent successfully");
        } catch (err) {
            setError(err.response?.data || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setLoading(true);
        setError(null);

        try {
            await axios.delete(`${serVer}/user/delete-account`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success("Account deleted successfully");

            logout();
            queryClient.clear(); // Invalidate all queries
        } catch (err) {
            setError(err.response?.data || "Failed to delete account");
            console.error("Delete account error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (isUserDataLoading) {
        return;
    }

    return (
        <Dialog
            open={!isVerified}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 2,
                },
            }}>
            <DialogTitle sx={{ textAlign: "center", py: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    Verify Your Account
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                    Enter the 6-digit OTP sent to {email}
                </Typography>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <OtpKit
                    value={otp}
                    onChange={handleChange}
                    type={"text"}
                    submitOtpButton={{ show: false }}
                />

                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center">
                    Didn&apos;t receive the code?{" "}
                    <Button
                        onClick={handleResendOTP}
                        disabled={loading}
                        sx={{
                            textTransform: "none",
                            p: 0,
                            minWidth: "auto",
                            color: "primary.main",
                            "&:hover": {
                                backgroundColor: "transparent",
                                textDecoration: "underline",
                            },
                        }}>
                        Resend OTP
                    </Button>
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={handleDeleteAccount}
                    color="warning"
                    variant="contained"
                    disabled={loading}>
                    {loading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        "Delete Acct."
                    )}
                </Button>
                <Logout />
                <Button
                    onClick={handleVerify}
                    variant="contained"
                    disabled={loading}>
                    {loading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        "Verify"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default VerifyOTP;
