import { useState } from "react";
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Button,
    TextField,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
} from "@mui/material";
import { Email, Visibility, VisibilityOff } from "@mui/icons-material";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import LockResetIcon from "@mui/icons-material/LockReset";
import axios from "axios";
import { serVer } from "../../Hooks/useVariable";
import toast from "react-hot-toast";
import Auth from "../../Custom/Auth/Auth";

function CircularProgressWithLabel(props) {
    return (
        <Box sx={{ position: "relative", display: "inline-flex" }}>
            <CircularProgress
                size={25}
                color="error"
                variant="determinate"
                {...props}
            />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                <Typography
                    variant="caption"
                    component="div"
                    fontSize=".5rem"
                    sx={{ color: "text.secondary" }}>
                    {`${Math.round(props.value)}%`}
                </Typography>
            </Box>
        </Box>
    );
}

const PasswordReset = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [authContain, setAuthContain] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);

    const handleEmail = async () => {
        setError("");
        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await axios.post(
                `${serVer}/auth/reset-password/email`,
                {
                    email,
                }
            );

            const { data } = res;

            setActiveStep(1);
            startResendTimer();
            toast.success(data);
        } catch (err) {
            setError(err.response.data);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            setError("Please enter a 6-digit code");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await axios.post(
                `${serVer}/auth/reset-password/verify-otp`,
                {
                    email,
                    otp,
                }
            );

            const { data } = res;

            setActiveStep(2);
            toast.success(data);
        } catch (err) {
            setError(err.response.data);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await axios.post(
                `${serVer}/auth/reset-password/new-password`,
                {
                    email,
                    otp,
                    newPassword: password,
                }
            );

            const { data } = res;

            toast.success(data);
            setAuthContain(true);
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(err.response.data);
        } finally {
            setLoading(false);
        }
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const startResendTimer = () => {
        let timer = 60;
        const interval = setInterval(() => {
            timer -= 1;
            setResendTimer(timer);
            if (timer === 0) clearInterval(interval);
        }, 1000);
    };

    const handleResendOtp = async () => {
        await handleEmail();
        setResendTimer(60);
        startResendTimer();
    };

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
                {/* Step 1: Email Verification */}
                <Step>
                    <StepLabel>Enter your email</StepLabel>
                    <StepContent>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Button
                            variant="contained"
                            onClick={handleEmail}
                            startIcon={
                                loading ? (
                                    <CircularProgress
                                        size={20}
                                        color="inherit"
                                    />
                                ) : (
                                    <Email />
                                )
                            }
                            disabled={loading}>
                            {loading ? "Submitting..." : "Submit"}
                        </Button>
                    </StepContent>
                </Step>

                {/* Step 2: OTP Verification */}
                <Step>
                    <StepLabel>Verify your email</StepLabel>
                    <StepContent>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            We&apos;ve sent a 6-digit code to {email}
                        </Typography>
                        <TextField
                            fullWidth
                            label="Verification Code"
                            variant="outlined"
                            type="text"
                            value={otp}
                            onChange={(e) =>
                                setOtp(e.target.value.toUpperCase().slice(0, 6))
                            }
                            sx={{ mb: 2 }}
                        />
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "center",
                            }}>
                            <Button
                                variant="contained"
                                onClick={handleVerifyOtp}
                                startIcon={
                                    loading ? (
                                        <CircularProgress
                                            size={20}
                                            color="inherit"
                                        />
                                    ) : (
                                        <FingerprintIcon />
                                    )
                                }
                                disabled={loading || otp.length !== 6}>
                                {loading ? "Verifying..." : "Verify"}
                            </Button>
                            <Button
                                color="error"
                                variant="outlined"
                                onClick={handleResendOtp}
                                startIcon={
                                    resendTimer > 0 && (
                                        <CircularProgressWithLabel
                                            value={(resendTimer / 60) * 100}
                                        />
                                    )
                                }
                                disabled={resendTimer > 0}>
                                Resend OTP
                            </Button>
                        </Box>
                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </StepContent>
                </Step>

                {/* Step 3: Password Reset */}
                <Step>
                    <StepLabel>Create new password</StepLabel>
                    <StepContent>
                        <TextField
                            fullWidth
                            label="New Password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mb: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            edge="end">
                                            {showPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Button
                            variant="contained"
                            onClick={handlePasswordReset}
                            startIcon={
                                loading ? (
                                    <CircularProgress
                                        size={20}
                                        color="inherit"
                                    />
                                ) : (
                                    <LockResetIcon />
                                )
                            }
                            disabled={loading || password !== confirmPassword}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </StepContent>
                </Step>
            </Stepper>

            <Auth authContain={authContain} setAuthContain={setAuthContain} />
        </Box>
    );
};

export default PasswordReset;
