import {
    Box,
    TextField,
    Button,
    Typography,
    Link,
    CircularProgress,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import {
    companyName,
    redirectSessionKey,
    serVer,
    useToken,
} from "../../Hooks/useVariable";
import { useAuthContext } from "../../Context/AuthContext";
import { useReactRouter } from "../../Hooks/useReactRouter";
import axios from "axios";
import { Link as NavLink } from "react-router-dom";

export const LoginForm = ({ setAuthContainer }) => {
    const theme = useTheme();
    const { login } = useAuthContext();

    const { useNavigate } = useReactRouter();

    const navigate = useNavigate();

    // react form
    const form = useForm();
    const { register, handleSubmit, formState } = form;
    const { errors, isSubmitting } = formState;

    //  function to login
    const onSubmit = async (data) => {
        const url = `${serVer}/auth/login`;
        const { email, password } = data;

        try {
            const response = await axios.post(url, { email, password });

            if (response.status === 200) {
                //update the auth Context
                login(response.data);

                if (setAuthContainer) {
                    setAuthContainer(false);
                }

                toast.success(`Welcome back to ${companyName}`);

                // Check if there's a saved path
                const redirectPath = sessionStorage.getItem(redirectSessionKey);

                if (redirectPath) {
                    // Remove the saved path from local storage
                    sessionStorage.removeItem(redirectSessionKey);
                    // Redirect to the saved path
                    navigate(redirectPath);
                }
            } else {
                toast.error(response.data);
            }
        } catch (error) {
            const { response } = error;
            toast.error(response.data);
        }
    };

    const onError = () => {
        toast.error("Failed to submit, check inputs and try again");
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit, onError)}
            noValidate
            sx={{ width: "100%", mt: 3 }}>
            {/* Email Field */}
            <TextField
                fullWidth
                margin="normal"
                label="Email Address"
                type="email"
                variant="outlined"
                {...register("email", {
                    required: "Email is required",
                    pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                    },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                    },
                }}
            />

            {/* Password Field */}
            <TextField
                fullWidth
                margin="normal"
                label="Password"
                type="password"
                variant="outlined"
                {...register("password", {
                    required: "Password is required",
                    minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                    },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                    },
                }}
            />

            {/* Forgot Password Link */}
            <Box textAlign="right" mt={1}>
                <Link
                    component={NavLink}
                    onClick={() => setAuthContainer(false)}
                    to="/forgot-password"
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        textDecoration: "none",
                        "&:hover": {
                            color: theme.palette.primary.main,
                        },
                    }}>
                    Forgot password?
                </Link>
            </Box>

            {/* Submit Button */}
            <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={isSubmitting}
                sx={{
                    mt: 2,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: "1rem",
                    textTransform: "none",
                }}>
                {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    "Log In"
                )}
            </Button>
        </Box>
    );
};

export const RegisterForm = ({ setAuthContainer }) => {
    const { login } = useAuthContext();

    const { useNavigate } = useReactRouter();

    const navigate = useNavigate();

    // react form
    const form = useForm();
    const { register, handleSubmit, formState } = form;
    const { errors, isSubmitting } = formState;

    //  function to register
    const onSubmit = async (data) => {
        const url = `${serVer}/auth/register`;
        const { name, email, password } = data;

        try {
            const response = await axios.post(url, { name, email, password });

            if (response.status === 200) {
                //update the auth Context
                login(response.data);

                if (setAuthContainer) {
                    setAuthContainer(false);
                }

                toast.success(`Welcome back to ${companyName}`);

                // Check if there's a saved path
                const redirectPath = sessionStorage.getItem(redirectSessionKey);

                if (redirectPath) {
                    // Remove the saved path from local storage
                    sessionStorage.removeItem(redirectSessionKey);
                    // Redirect to the saved path
                    navigate(redirectPath);
                }
            } else {
                toast.error(response.data);
            }
        } catch (error) {
            const { response } = error;
            toast.error(response.data);
        }
    };

    const onError = () => {
        toast.error("Failed to submit, check inputs and try again");
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit, onError)}
            noValidate
            sx={{ width: "100%", mt: 1 }}>
            {/* Name Field */}
            <TextField
                fullWidth
                margin="normal"
                label="Full Name"
                variant="outlined"
                {...register("name", {
                    required: "Full name is required",
                    minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                    },
                })}
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                    },
                }}
            />

            {/* Email Field */}
            <TextField
                fullWidth
                margin="normal"
                label="Email Address"
                type="email"
                variant="outlined"
                {...register("email", {
                    required: "Email is required",
                    pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                    },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                    },
                }}
            />

            {/* Password Field */}
            <TextField
                fullWidth
                margin="normal"
                label="Password"
                type="password"
                variant="outlined"
                {...register("password", {
                    required: "Password is required",
                    minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                    },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                    },
                }}
            />

            {/* Submit Button */}
            <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                type="submit"
                disabled={isSubmitting}
                sx={{
                    mt: 2,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: "1rem",
                    textTransform: "none",
                }}>
                {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    "Create Account"
                )}
            </Button>

            {/* Terms and Conditions */}
            <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                mt={2}>
                By registering, you agree to our Terms of Service and Privacy
                Policy
            </Typography>
        </Box>
    );
};

// Report Community Form
export const ReportCommunityForm = ({ open, onClose, communityId }) => {
    const { token } = useToken();
    // react form
    const form = useForm();
    const { register, handleSubmit, formState, reset } = form;
    const { errors, isSubmitting } = formState;

    //  function to register
    const onSubmit = async (data) => {
        const url = `${serVer}/user/report-community/${communityId}`;
        const { reason } = data;

        try {
            const response = await axios.put(
                url,
                { reason },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(response.data);
            reset();
            onClose();
        } catch (error) {
            const { response } = error;
            toast.error(response.data);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Report Community</DialogTitle>
            {/* Wrap entire content in form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Reason"
                            variant="outlined"
                            multiline
                            rows={1} // Increased rows for better UX
                            {...register("reason", {
                                required: "Reason is required",
                                minLength: {
                                    value: 10, // More reasonable minimum
                                    message:
                                        "Reason must be at least 10 characters",
                                },
                            })}
                            error={!!errors.reason}
                            helperText={errors.reason?.message}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                },
                            }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} color="error" variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        disabled={isSubmitting}>
                        {isSubmitting ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            "Submit Report"
                        )}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};
