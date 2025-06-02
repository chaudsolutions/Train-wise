import { useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import useResponsive from "../../Hooks/useResponsive";
import HeroBg from "../../../assets/heroBg.png";

const Hero = () => {
    const { isMobile } = useResponsive();
    const autoplayOptions = { delay: 7000, stopOnInteraction: false };
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay(autoplayOptions),
    ]);
    const textSliderRef = useRef(null);

    const heroContent = [
        {
            title: "Associate More - Learn More",
            description:
                "Join vibrant Hubs of learners and experts to share knowledge, collaborate on projects, and grow together in a supportive environment.",
            buttonText: "Explore Learning Hubs",
        },
        {
            title: "Create A Learning Hub - Earn More",
            description:
                "Launch your own community, share your expertise, and earn from subscriptions. Build your tribe and monetize your knowledge effortlessly.",
            buttonText: "Start Creating",
        },
    ];

    return (
        <Box
            component="header"
            sx={{
                height: isMobile ? "70vh" : "100vh",
                backgroundImage: `url(${HeroBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: isMobile ? "scroll" : "fixed",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                backgroundBlendMode: "overlay",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                color: "white",
                px: 2,
                position: "relative",
                overflow: "hidden",
            }}>
            {/* Decorative animated elements */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                        "linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(94, 53, 177, 0.15) 100%)",
                    zIndex: 1,
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    top: "20%",
                    left: "10%",
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)",
                    animation: "pulse 6s infinite",
                    "@keyframes pulse": {
                        "0%": { transform: "scale(0.8)", opacity: 0.7 },
                        "50%": { transform: "scale(1.3)", opacity: 0.3 },
                        "100%": { transform: "scale(0.8)", opacity: 0.7 },
                    },
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    bottom: "30%",
                    right: "15%",
                    width: "25px",
                    height: "25px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    animation: "float 10s infinite ease-in-out",
                    "@keyframes float": {
                        "0%, 100%": { transform: "translateY(0)" },
                        "50%": { transform: "translateY(-40px)" },
                    },
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    top: "40%",
                    right: "5%",
                    width: "15px",
                    height: "15px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.15)",
                    animation: "float 8s infinite ease-in-out",
                    animationDelay: "2s",
                }}
            />

            {/* Text Slider */}
            <Box
                ref={emblaRef}
                sx={{
                    width: "100%",
                    maxWidth: 900,
                    position: "relative",
                    zIndex: 2,
                    overflow: "hidden",
                }}>
                <Box
                    ref={textSliderRef}
                    sx={{
                        display: "flex",
                        willChange: "transform",
                    }}>
                    {heroContent.map((content, index) => (
                        <Box
                            key={index}
                            sx={{
                                flex: "0 0 100%",
                                minWidth: 0,
                                px: 2,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                textAlign: "center",
                                position: "relative",
                                opacity: 0.9,
                            }}>
                            <Typography
                                variant={isMobile ? "h4" : "h2"}
                                component="h1"
                                sx={{
                                    fontWeight: 800,
                                    mb: 3,
                                    lineHeight: 1.2,
                                    textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                                    letterSpacing: "1px",
                                    animation: "fadeInUp 0.8s ease-out",
                                    "@keyframes fadeInUp": {
                                        "0%": {
                                            opacity: 0,
                                            transform: "translateY(40px)",
                                        },
                                        "100%": {
                                            opacity: 1,
                                            transform: "translateY(0)",
                                        },
                                    },
                                }}>
                                {content.title}
                            </Typography>

                            <Typography
                                variant={isMobile ? "h6" : "h5"}
                                component="p"
                                fontSize="1rem"
                                sx={{
                                    fontWeight: 400,
                                    mb: 4,
                                    textShadow: "0 1px 5px rgba(0,0,0,0.3)",
                                    animation:
                                        "fadeInUp 0.8s ease-out 0.2s forwards",
                                    opacity: 0,
                                    maxWidth: 700,
                                    mx: "auto",
                                    lineHeight: 1.6,
                                }}>
                                {content.description}
                            </Typography>

                            <Button
                                component={Link}
                                to={
                                    index === 0
                                        ? "/communities"
                                        : "/create-a-community"
                                }
                                variant="contained"
                                size="large"
                                sx={{
                                    py: 2,
                                    px: 4,
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    borderRadius: "50px",
                                    background:
                                        "linear-gradient(45deg, #1976d2 0%, #5e35b1 100%)",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                                    transition: "all 0.3s ease",
                                    animation:
                                        "fadeInUp 0.8s ease-out 0.4s forwards",
                                    opacity: 0,
                                    "&:hover": {
                                        transform: "translateY(-3px)",
                                        boxShadow: "0 6px 25px rgba(0,0,0,0.4)",
                                        background:
                                            "linear-gradient(45deg, #1565c0 0%, #4527a0 100%)",
                                    },
                                }}>
                                {content.buttonText}
                            </Button>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Slider indicators */}
            <Box
                sx={{
                    position: "absolute",
                    bottom: 40,
                    zIndex: 3,
                    display: "flex",
                    gap: 1,
                }}>
                {heroContent.map((_, index) => (
                    <Box
                        key={index}
                        onClick={() => emblaApi && emblaApi.scrollTo(index)}
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: "rgba(255,255,255,0.3)",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            "&:hover": {
                                bgcolor: "rgba(255,255,255,0.5)",
                                transform: "scale(1.2)",
                            },
                        }}
                    />
                ))}
            </Box>

            {/* Bottom decorative bar */}
            <Box
                sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "60px",
                    background:
                        "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                    backdropFilter: "blur(3px)",
                    zIndex: 2,
                }}
            />
        </Box>
    );
};

export default Hero;
