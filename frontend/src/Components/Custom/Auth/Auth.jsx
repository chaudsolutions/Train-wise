import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    Button,
    Box,
    Divider,
    useTheme,
    IconButton,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LoginForm, RegisterForm } from "../Forms/Forms";

const Auth = ({ setAuthContain, authContain }) => {
    const theme = useTheme();
    const [view, setView] = useState("login");

    const handleClose = () => {
        setAuthContain(false);
    };

    return (
        <Dialog
            open={authContain}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    p: 2,
                    position: "relative",
                },
            }}>
            {/* Close Button */}
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: "absolute",
                    right: 16,
                    top: 16,
                    color: theme.palette.grey[500],
                }}>
                <CloseIcon />
            </IconButton>

            {/* Title */}
            <DialogTitle
                textAlign="center"
                sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    px: 0,
                    pt: 0,
                }}>
                {view === "login" ? `Log in` : `Create a new account`}
            </DialogTitle>

            <DialogContent sx={{ px: 0 }}>
                {/* Form */}
                {view === "login" ? (
                    <LoginForm setAuthContainer={setAuthContain} />
                ) : (
                    <RegisterForm setAuthContainer={setAuthContain} />
                )}

                {/* Divider */}
                <Box sx={{ position: "relative", mt: 2, mb: 1 }}>
                    <Divider />
                    <Typography
                        variant="body2"
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            px: 2,
                            backgroundColor: "background.paper",
                            color: "text.secondary",
                        }}>
                        or
                    </Typography>
                </Box>

                {/* Toggle between login/register */}
                <DialogContentText component="div" textAlign="center">
                    <Box component="div" fontSize=".9rem">
                        {view === "login"
                            ? "Don't have an account?"
                            : "Already have an account?"}
                    </Box>
                    <Button
                        color="warning"
                        variant="contained"
                        onClick={() =>
                            setView(view === "login" ? "register" : "login")
                        }
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                        }}>
                        {view === "login" ? "Sign up for free" : "Login"}
                    </Button>
                </DialogContentText>
            </DialogContent>
        </Dialog>
    );
};

export default Auth;
