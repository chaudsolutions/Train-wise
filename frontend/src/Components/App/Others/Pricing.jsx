import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    Button,
    useTheme,
    Divider,
} from "@mui/material";
import {
    CheckCircle as CheckCircleIcon,
    Star as StarIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useAuthContext } from "../../Context/AuthContext";
import toast from "react-hot-toast";
import { redirectSessionKey } from "../../Hooks/useVariable";
import Auth from "../../Custom/Auth/Auth";

const Pricing = () => {
    const theme = useTheme();
    const [authContain, setAuthContain] = useState(false);
    const { user } = useAuthContext();

    const features = [
        `1 group`,
        `All features`,
        `Unlimited courses`,
        `Unlimited members`,
        `2.0% transaction fee`,
    ];

    const subscribe = async () => {
        if (!user) {
            toast.error("Please log in to subscribe");
            sessionStorage.setItem(redirectSessionKey, location.pathname);
            setAuthContain(true);
        } else {
            // run subscription function
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            {/* Header Section */}
            <Box textAlign="center" mb={6}>
                <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    sx={{
                        color: theme.palette.info.main,
                        fontWeight: 700,
                    }}>
                    Simple Pricing
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    One plan with everything included. No hidden fees. Get
                    started with a 3-day free trial. Cancel anytime.
                </Typography>
            </Box>

            {/* Pricing Card */}
            <Box display="flex" justifyContent="center">
                <Card
                    sx={{
                        width: "100%",
                        maxWidth: 500,
                        borderRadius: 4,
                        boxShadow: theme.shadows[4],
                        border: `2px solid ${theme.palette.info.light}`,
                        "&:hover": {
                            boxShadow: theme.shadows[8],
                            transform: "translateY(-4px)",
                            transition: "all 0.3s ease",
                        },
                    }}>
                    <CardContent sx={{ p: 4 }}>
                        {/* Price Header */}
                        <Box textAlign="center" mb={4}>
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="flex-end"
                                mb={1}>
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 700,
                                        color: theme.palette.info.main,
                                    }}>
                                    $99
                                </Typography>
                                <Typography
                                    variant="h6"
                                    color="text.secondary"
                                    sx={{ ml: 1, mb: 0.5 }}>
                                    /month
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                7-days free trial • Cancel anytime
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* Features List */}
                        <List sx={{ mb: 4 }}>
                            {features.map((feature, i) => {
                                const [boldText, ...rest] = feature.split(" ");
                                const remainingText = rest.join(" ");

                                return (
                                    <ListItem key={i} sx={{ px: 0, py: 1 }}>
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <CheckCircleIcon color="info" />
                                        </ListItemIcon>
                                        <Typography variant="body1">
                                            <Box
                                                component="span"
                                                fontWeight="600">
                                                {boldText}
                                            </Box>{" "}
                                            {remainingText}
                                        </Typography>
                                    </ListItem>
                                );
                            })}
                        </List>

                        {/* Subscribe Button */}
                        <Button
                            fullWidth
                            variant="contained"
                            color="info"
                            size="large"
                            onClick={subscribe}
                            sx={{
                                py: 2,
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: "1.1rem",
                            }}>
                            Get Started
                        </Button>

                        {/* Trial Note */}
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            textAlign="center"
                            mt={2}>
                            Start your 7-days free trial today
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Additional Info */}
            <Box mt={6} textAlign="center">
                <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                    <StarIcon color="info" sx={{ mr: 1 }} /> Everything included
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    No hidden fees • No credit card required for trial • Cancel
                    anytime
                </Typography>
            </Box>

            {/* Auth Modal */}
            {authContain && (
                <Auth
                    setAuthContain={setAuthContain}
                    authContain={authContain}
                />
            )}
        </Container>
    );
};

export default Pricing;
