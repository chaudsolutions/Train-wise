import { useState } from "react";
import {
    Box,
    Grid,
    Typography,
    useTheme,
    useMediaQuery,
    Button,
    Divider,
    IconButton,
} from "@mui/material";
import { RegisterForm } from "../../Custom/Forms/Forms";
import { Link } from "react-router-dom";

const SignUp = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [isBusiness, setIsBusiness] = useState(false);

    return (
        <Box
            sx={{
                bgcolor: theme.palette.background.default,
                p: isMobile ? 2 : 4,
                backgroundImage:
                    "linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(94, 53, 177, 0.03) 100%)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -100,
                    right: -100,
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    background:
                        "linear-gradient(120deg, rgba(25, 118, 210, 0.05) 0%, rgba(94, 53, 177, 0.05) 100%)",
                    zIndex: 0,
                },
                "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: -150,
                    left: -150,
                    width: 400,
                    height: 400,
                    borderRadius: "50%",
                    background:
                        "linear-gradient(45deg, rgba(94, 53, 177, 0.05) 0%, rgba(25, 118, 210, 0.05) 100%)",
                    zIndex: 0,
                },
            }}>
            <Grid
                container
                sx={{
                    maxWidth: 1200,
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: isMobile ? theme.shadows[2] : theme.shadows[10],
                    zIndex: 1,
                    height: isMobile ? "auto" : "80vh",
                    bgcolor: "background.paper",
                }}>
                {/* Image Section - Hidden on mobile */}
                {!isMobile && (
                    <Grid
                        item
                        xs={12}
                        md={6}
                        sx={{
                            position: "relative",
                            backgroundImage:
                                "linear-gradient(rgba(25, 118, 210, 0.5), rgba(94, 53, 177, 0.5)), url(https://images.unsplash.com/photo-1543269664-76bc3997d9ea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            p: 6,
                            color: "white",
                        }}>
                        <Box sx={{ textAlign: "center", zIndex: 2 }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 800,
                                    mb: 3,
                                    textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                                }}>
                                Join Our Community
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 4,
                                    textShadow: "0 1px 5px rgba(0,0,0,0.2)",
                                }}>
                                Connect with learners and experts worldwide
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: 2,
                                    mt: 4,
                                }}>
                                {[1, 2, 3, 4].map((item) => (
                                    <Box
                                        key={item}
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: "50%",
                                            border: "2px solid rgba(255,255,255,0.3)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            overflow: "hidden",
                                        }}>
                                        <Box
                                            component="img"
                                            src={`https://i.pravatar.cc/80?img=${item}`}
                                            alt="Community member"
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Grid>
                )}

                {/* Form Section */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        p: isMobile ? 3 : 6,
                        position: "relative",
                        overflowY: "auto",
                    }}>
                    <Box
                        sx={{ mb: 4, textAlign: isMobile ? "center" : "left" }}>
                        <Typography
                            variant={isMobile ? "h4" : "h3"}
                            sx={{
                                fontWeight: 800,
                                color: theme.palette.primary.dark,
                                mb: 1,
                            }}>
                            Create an Account
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Join thousands of learners and experts on our
                            platform
                        </Typography>
                    </Box>

                    {/* Account type selector */}
                    <Box sx={{ mb: 3 }}>
                        <Button
                            variant={isBusiness ? "outlined" : "contained"}
                            onClick={() => setIsBusiness(false)}
                            sx={{
                                mr: 2,
                                borderRadius: "50px",
                                px: 4,
                                fontWeight: 600,
                                textTransform: "none",
                            }}>
                            Personal Account
                        </Button>
                        <Button
                            disabled={true}
                            variant={isBusiness ? "contained" : "outlined"}
                            onClick={() => setIsBusiness(true)}
                            sx={{
                                borderRadius: "50px",
                                px: 4,
                                fontWeight: 600,
                                textTransform: "none",
                            }}>
                            Creator Account
                        </Button>
                    </Box>

                    <RegisterForm isBusiness={isBusiness} />

                    <Divider sx={{ my: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            Or sign up with
                        </Typography>
                    </Divider>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                        mt={2}>
                        Already have an account?
                        <Button
                            component={Link}
                            to="/login"
                            variant="outlined"
                            sx={{
                                ml: 0.5,
                                fontWeight: 600,
                                textTransform: "none",
                                color: theme.palette.primary.main,
                            }}>
                            Sign in
                        </Button>
                    </Typography>

                    <Typography
                        variant="caption"
                        color="text.disabled"
                        textAlign="center"
                        mt={3}
                        display="block">
                        By signing up, you agree to our Terms of Service and
                        Privacy Policy
                    </Typography>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SignUp;
