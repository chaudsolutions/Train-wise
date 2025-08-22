import { Box, Typography, Card, CardContent, useTheme } from "@mui/material";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import GroupAdd from "@mui/icons-material/GroupAdd";
import GroupWork from "@mui/icons-material/GroupWork";
import School from "@mui/icons-material/School";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import Forum from "@mui/icons-material/Forum";
import useResponsive from "../../Hooks/useResponsive";

const benefits = [
    {
        icon: <ChatBubbleOutline fontSize="medium" />,
        title: "Live Chatting",
        description:
            "Engage in real-time conversations with community members through our seamless chat interface. Share ideas and build meaningful connections.",
    },
    {
        icon: <GroupAdd fontSize="medium" />,
        title: "Create Your Community",
        description:
            "Start your own community space with custom branding, rules, and subscription options. Build your tribe around shared interests.",
    },
    {
        icon: <GroupWork fontSize="medium" />,
        title: "Join Thriving Community",
        description:
            "Discover and join diverse communities across various topics. Connect with like-minded individuals and expand your network.",
    },
    {
        icon: <School fontSize="medium" />,
        title: "Learn & Grow",
        description:
            "Access exclusive educational content, workshops, and resources. Elevate your skills through community-driven knowledge sharing.",
    },
    {
        icon: <EmojiEvents fontSize="medium" />,
        title: "Earn Rewards",
        description:
            "Monetize your expertise through community subscriptions. Earn recognition and financial rewards for your contributions.",
    },
    {
        icon: <Forum fontSize="medium" />,
        title: "Discussion Forums",
        description:
            "Participate in structured topic discussions with threaded conversations. Organize knowledge and maintain context easily.",
    },
];

const SectionOne = () => {
    const theme = useTheme();
    const { isMobile } = useResponsive();

    return (
        <Box
            sx={{
                py: 10,
                px: { xs: 2, sm: 4, md: 8 },
                background: "linear-gradient(to bottom, #f9fbfd, #ffffff)",
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
            <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography
                    variant={isMobile ? "h4" : "h3"}
                    component="h2"
                    sx={{
                        fontWeight: 800,
                        textAlign: "center",
                        mb: 2,
                        color: theme.palette.primary.dark,
                    }}>
                    Why Join Skillbay?
                </Typography>

                <Typography
                    variant={isMobile ? "h6" : "h5"}
                    component="p"
                    fontSize="1rem"
                    sx={{
                        fontWeight: 400,
                        textAlign: "center",
                        mb: 8,
                        maxWidth: 800,
                        mx: "auto",
                        color: theme.palette.text.secondary,
                    }}>
                    Discover the unique advantages of our community learning
                    platform designed to connect, educate, and empower members
                    worldwide.
                </Typography>

                {/* Grid Container */}
                <Box
                    sx={{
                        maxWidth: "1400px",
                        mx: "auto",
                        px: { xs: 0, md: 4 },
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                        },
                        gap: { xs: 2, sm: 3, md: 4 },
                    }}>
                    {benefits.map((benefit, index) => (
                        <Card
                            key={index}
                            sx={{
                                height: "100%",
                                borderRadius: 4,
                                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                                transition: "all 0.3s ease",
                                border: "1px solid rgba(0,0,0,0.05)",
                                "&:hover": {
                                    transform: "translateY(-10px)",
                                    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                                    borderColor: theme.palette.primary.light,
                                },
                            }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                    mb={2}>
                                    <Box
                                        sx={{
                                            color: "white",
                                            background:
                                                "linear-gradient(135deg, #1976d2 0%, #5e35b1 100%)",
                                            padding: 2,
                                            borderRadius: "50%",
                                        }}>
                                        {benefit.icon}
                                    </Box>

                                    <Typography
                                        variant="h6"
                                        component="h3"
                                        fontSize="1.1rem"
                                        sx={{
                                            fontWeight: 700,
                                            color: theme.palette.primary.dark,
                                        }}>
                                        {benefit.title}
                                    </Typography>
                                </Box>

                                <Typography
                                    variant="body1"
                                    fontSize=".8rem"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        lineHeight: 1.6,
                                    }}>
                                    {benefit.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default SectionOne;
