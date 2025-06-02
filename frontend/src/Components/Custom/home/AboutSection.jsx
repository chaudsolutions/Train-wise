import {
    Box,
    Typography,
    Button,
    useTheme,
    Grid,
    Avatar,
    Stack,
} from "@mui/material";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SchoolIcon from "@mui/icons-material/School";
import PublicIcon from "@mui/icons-material/Public";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import useResponsive from "../../Hooks/useResponsive";
import AboutImg from "../../../assets/aboutImg.png";

const AboutSection = () => {
    const theme = useTheme();
    const { isMobile } = useResponsive();

    const stats = [
        {
            icon: <PeopleAltIcon fontSize="large" />,
            value: "1K+",
            label: "Active Members",
        },
        {
            icon: <SchoolIcon fontSize="large" />,
            value: "50+",
            label: "Communities",
        },
        {
            icon: <PublicIcon fontSize="large" />,
            value: "12+",
            label: "Countries",
        },
        {
            icon: <EmojiEventsIcon fontSize="large" />,
            value: "95%",
            label: "Satisfaction Rate",
        },
    ];

    return (
        <Box
            sx={{
                py: 10,
                px: { xs: 2, sm: 4, md: 8 },
                background: "linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)",
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
                        "linear-gradient(120deg, rgba(25, 118, 210, 0.1) 0%, rgba(94, 53, 177, 0.1) 100%)",
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
                        "linear-gradient(45deg, rgba(94, 53, 177, 0.1) 0%, rgba(25, 118, 210, 0.1) 100%)",
                    zIndex: 0,
                },
            }}>
            <Box
                sx={{
                    position: "relative",
                    zIndex: 2,
                    maxWidth: 1200,
                    mx: "auto",
                }}>
                <Grid container spacing={6} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}>
                            <Box
                                sx={{
                                    position: "relative",
                                    borderRadius: 4,
                                    overflow: "hidden",
                                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                                    height: isMobile ? 300 : 400,
                                    "&::before": {
                                        content: '""',
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background:
                                            "linear-gradient(45deg, rgba(25, 118, 210, 0.2) 0%, rgba(94, 53, 177, 0.2) 100%)",
                                        zIndex: 1,
                                    },
                                }}>
                                <Box
                                    component="img"
                                    src={AboutImg}
                                    alt="Community learning"
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        position: "relative",
                                        zIndex: 0,
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: "absolute",
                                        bottom: 20,
                                        left: 20,
                                        zIndex: 2,
                                        background: "rgba(255,255,255,0.9)",
                                        p: 2,
                                        borderRadius: 3,
                                        maxWidth: 300,
                                    }}>
                                    <Typography
                                        variant="h6"
                                        fontWeight={700}
                                        color="primary">
                                        "The best platform for collaborative
                                        learning"
                                    </Typography>
                                    <Typography variant="body2" mt={1}>
                                        - Sarah Johnson, Community Leader
                                    </Typography>
                                </Box>
                            </Box>
                        </motion.div>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}>
                            <Typography
                                variant={isMobile ? "h4" : "h3"}
                                component="h2"
                                sx={{
                                    fontWeight: 800,
                                    mb: 3,
                                    color: theme.palette.primary.dark,
                                    lineHeight: 1.2,
                                }}>
                                Connecting Learners Worldwide
                            </Typography>

                            <Typography
                                variant="h6"
                                component="p"
                                sx={{
                                    fontWeight: 400,
                                    mb: 3,
                                    color: theme.palette.text.secondary,
                                    lineHeight: 1.6,
                                }}>
                                We're a passionate team dedicated to creating
                                spaces where knowledge flows freely. Our
                                platform brings together curious minds from
                                around the globe to share, learn, and grow in
                                collaborative communities.
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    mb: 4,
                                    color: theme.palette.text.secondary,
                                    lineHeight: 1.7,
                                }}>
                                Founded in 2023, we've built a thriving
                                ecosystem of specialized communities where
                                experts and enthusiasts connect. Whether you're
                                looking to master a new skill, share your
                                expertise, or find your tribe, we provide the
                                tools and environment for meaningful knowledge
                                exchange.
                            </Typography>

                            <Button
                                component={Link}
                                to="/about-us"
                                variant="contained"
                                size="large"
                                sx={{
                                    py: 1.5,
                                    px: 5,
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    borderRadius: "50px",
                                    background:
                                        "linear-gradient(45deg, #1976d2 0%, #5e35b1 100%)",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-3px)",
                                        boxShadow:
                                            "0 6px 25px rgba(0,0,0,0.25)",
                                        background:
                                            "linear-gradient(45deg, #1565c0 0%, #4527a0 100%)",
                                    },
                                }}>
                                Our Story
                            </Button>
                        </motion.div>
                    </Grid>
                </Grid>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}>
                    <Grid
                        container
                        spacing={3}
                        sx={{ mt: 8, justifyContent: "center" }}>
                        {stats.map((stat, index) => (
                            <Grid size={{ xs: 6, sm: 3 }} key={index}>
                                <Stack
                                    direction="column"
                                    alignItems="center"
                                    sx={{
                                        p: 3,
                                        background: "rgba(255,255,255,0.7)",
                                        borderRadius: 4,
                                        boxShadow:
                                            "0 5px 15px rgba(0,0,0,0.05)",
                                        backdropFilter: "blur(5px)",
                                        border: "1px solid rgba(255,255,255,0.5)",
                                        textAlign: "center",
                                        height: "100%",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            transform: "translateY(-5px)",
                                            boxShadow:
                                                "0 8px 25px rgba(0,0,0,0.1)",
                                            background: "rgba(255,255,255,0.9)",
                                        },
                                    }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: "primary.light",
                                            color: "primary.contrastText",
                                            width: 70,
                                            height: 70,
                                            mb: 2,
                                        }}>
                                        {stat.icon}
                                    </Avatar>
                                    <Typography
                                        variant="h4"
                                        component="div"
                                        fontWeight={800}
                                        color="primary.dark">
                                        {stat.value}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        sx={{ mt: 1 }}>
                                        {stat.label}
                                    </Typography>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </motion.div>
            </Box>
        </Box>
    );
};

export default AboutSection;
