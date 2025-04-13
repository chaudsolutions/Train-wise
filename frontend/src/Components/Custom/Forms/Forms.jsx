import {
    Box,
    TextField,
    Button,
    Typography,
    Link,
    CircularProgress,
    useTheme,
} from "@mui/material";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import "./forms.css";
import {
    companyName,
    redirectSessionKey,
    serVer,
} from "../../Hooks/useVariable";
import { useAuthContext } from "../../Context/AuthContext";
import { useReactRouter } from "../../Hooks/useReactRouter";
import axios from "axios";

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
                    href="/forgot-password"
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        textDecoration: "none",
                        "&:hover": {
                            color: theme.palette.info.main,
                        },
                    }}>
                    Forgot password?
                </Link>
            </Box>

            {/* Submit Button */}
            <Button
                fullWidth
                variant="contained"
                color="info"
                size="large"
                type="submit"
                disabled={isSubmitting}
                sx={{
                    mt: 3,
                    py: 1.5,
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

            {/* Password Requirements */}
            <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={1}>
                Password must be at least 6 characters
            </Typography>

            {/* Submit Button */}
            <Button
                fullWidth
                variant="contained"
                color="info"
                size="large"
                type="submit"
                disabled={isSubmitting}
                sx={{
                    mt: 3,
                    py: 1.5,
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
