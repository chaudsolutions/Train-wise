import {
    Box,
    Typography,
    Card,
    CardContent,
    useTheme,
    IconButton,
} from "@mui/material";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import GroupAdd from "@mui/icons-material/GroupAdd";
import GroupWork from "@mui/icons-material/GroupWork";
import School from "@mui/icons-material/School";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import Forum from "@mui/icons-material/Forum";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import useResponsive from "../../Hooks/useResponsive";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

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

    // Embla Carousel setup
    const autoplayOptions = { delay: 5000, stopOnInteraction: false };
    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            align: "start",
            skipSnaps: false,
            containScroll: "trimSnaps",
        },
        [Autoplay(autoplayOptions)]
    );

    const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
    const scrollNext = () => emblaApi && emblaApi.scrollNext();

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
                    Why Join Our Platform?
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

                {/* Carousel Container */}
                <Box
                    sx={{
                        position: "relative",
                        maxWidth: "1400px",
                        mx: "auto",
                        px: { xs: 0, md: 4 },
                    }}>
                    {/* Navigation Arrows */}
                    <IconButton
                        onClick={scrollPrev}
                        sx={{
                            position: "absolute",
                            left: { xs: -10, sm: -20, md: -30 },
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 10,
                            background: "rgba(255,255,255,0.9)",
                            boxShadow: theme.shadows[4],
                            "&:hover": {
                                background: "white",
                            },
                            display: { xs: "none", sm: "flex" },
                        }}>
                        <ArrowBackIos />
                    </IconButton>

                    <IconButton
                        onClick={scrollNext}
                        sx={{
                            position: "absolute",
                            right: { xs: -10, sm: -20, md: -30 },
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 10,
                            background: "rgba(255,255,255,0.9)",
                            boxShadow: theme.shadows[4],
                            "&:hover": {
                                background: "white",
                            },
                            display: { xs: "none", sm: "flex" },
                        }}>
                        <ArrowForwardIos />
                    </IconButton>

                    {/* Embla Viewport */}
                    <Box
                        className="embla"
                        ref={emblaRef}
                        p={2}
                        sx={{
                            overflow: "hidden",
                            cursor: "grab",
                            "&:active": {
                                cursor: "grabbing",
                            },
                        }}>
                        <Box
                            className="embla__container"
                            sx={{
                                display: "flex",
                                gap: { xs: 2, sm: 3, md: 4 },
                                ml: { xs: 2, sm: 0 },
                            }}>
                            {benefits.map((benefit, index) => (
                                <Box
                                    className="embla__slide"
                                    key={index}
                                    sx={{
                                        flex: "0 0 auto",
                                        minWidth: 0,
                                        width: {
                                            xs: "calc(85% - 16px)",
                                            sm: "calc(50% - 20px)",
                                            md: "calc(33.333% - 24px)",
                                        },
                                        position: "relative",
                                    }}>
                                    <Card
                                        sx={{
                                            height: "100%",
                                            borderRadius: 4,
                                            boxShadow:
                                                "0 8px 30px rgba(0,0,0,0.08)",
                                            transition: "all 0.3s ease",
                                            border: "1px solid rgba(0,0,0,0.05)",
                                            "&:hover": {
                                                transform: "translateY(-10px)",
                                                boxShadow:
                                                    "0 12px 40px rgba(0,0,0,0.15)",
                                                borderColor:
                                                    theme.palette.primary.light,
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
                                                        color: theme.palette
                                                            .primary.dark,
                                                    }}>
                                                    {benefit.title}
                                                </Typography>
                                            </Box>

                                            <Typography
                                                variant="body1"
                                                fontSize=".8rem"
                                                sx={{
                                                    color: theme.palette.text
                                                        .secondary,
                                                    lineHeight: 1.6,
                                                }}>
                                                {benefit.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Dots for mobile */}
                    {isMobile && (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: 4,
                                gap: 1,
                            }}>
                            {benefits.map((_, index) => (
                                <Box
                                    key={index}
                                    onClick={() =>
                                        emblaApi && emblaApi.scrollTo(index)
                                    }
                                    sx={{
                                        width: 5,
                                        height: 5,
                                        borderRadius: "50%",
                                        bgcolor: "rgba(0,0,0,0.2)",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            bgcolor: "rgba(0,0,0,0.4)",
                                        },
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default SectionOne;
