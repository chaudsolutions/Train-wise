import {
    Box,
    Typography,
    Container,
    Grid,
    Card,
    CardContent,
    Avatar,
    Button,
    useTheme,
} from "@mui/material";
import Groups from "@mui/icons-material/Groups";
import School from "@mui/icons-material/School";
import Public from "@mui/icons-material/Public";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import AboutImg from "../../../assets/aboutImg.png";
import useResponsive from "../../Hooks/useResponsive";
import { Link } from "react-router-dom";

const AboutUs = () => {
    const theme = useTheme();
    const { isMobile } = useResponsive();

    // Team members data
    const teamMembers = [
        {
            name: "Sarah Johnson",
            role: "CEO & Founder",
            bio: "Tech entrepreneur with 10+ years in community building. Passionate about connecting people through knowledge sharing.",
            avatar: "",
        },
        {
            name: "Michael Chen",
            role: "CTO",
            bio: "Software architect specializing in scalable platforms. Leads our technical vision and engineering team.",
            avatar: "",
        },
        {
            name: "Emma Wilson",
            role: "Head of Community",
            bio: "Community engagement expert with background in education and social impact initiatives.",
            avatar: "",
        },
        {
            name: "David Brown",
            role: "Product Director",
            bio: "Product strategist focused on creating intuitive user experiences that foster community growth.",
            avatar: "",
        },
    ];

    // Company values
    const values = [
        {
            icon: <Groups fontSize="large" />,
            title: "Community First",
            description:
                "We prioritize authentic connections and meaningful interactions above all else.",
        },
        {
            icon: <School fontSize="large" />,
            title: "Lifelong Learning",
            description:
                "We believe in the transformative power of continuous knowledge sharing.",
        },
        {
            icon: <Public fontSize="large" />,
            title: "Global Mindset",
            description:
                "We embrace diversity and create inclusive spaces for cross-cultural exchange.",
        },
        {
            icon: <EmojiEvents fontSize="large" />,
            title: "Excellence",
            description:
                "We're committed to delivering exceptional experiences through our platform.",
        },
    ];

    return (
        <Box sx={{ bgcolor: theme.palette.background.default }}>
            {/* Hero Section */}
            <Box
                sx={{
                    position: "relative",
                    height: isMobile ? "60vh" : "80vh",
                    backgroundImage: ` url(${AboutImg})`,
                    backgroundColor: "rgba(0, 0, 0, 0.8)", // Fallback color"
                    backgroundBlendMode: "overlay",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    color: "white",
                }}>
                <Container>
                    <Typography
                        variant={isMobile ? "h3" : "h1"}
                        component="h1"
                        fontSize="2rem"
                        sx={{
                            fontWeight: 800,
                            mb: 3,
                            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                        }}>
                        Connecting Learners Worldwide
                    </Typography>
                    <Typography
                        variant={isMobile ? "h5" : "h4"}
                        component="p"
                        fontSize="1rem"
                        sx={{
                            maxWidth: 800,
                            mx: "auto",
                            mb: 4,
                            textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                        }}>
                        Based in London, we're building the future of
                        community-powered learning
                    </Typography>
                    <Button
                        component={Link}
                        to="/sign-up"
                        variant="contained"
                        size="large"
                        sx={{
                            px: 5,
                            py: 1.5,
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            borderRadius: "50px",
                            background:
                                "linear-gradient(45deg, #1976d2 0%, #5e35b1 100%)",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        }}>
                        Join Our Community
                    </Button>
                </Container>
            </Box>

            {/* Our Story Section */}
            <Container sx={{ py: 8 }}>
                <Grid container spacing={6} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box
                            sx={{
                                position: "relative",
                                borderRadius: 4,
                                overflow: "hidden",
                                boxShadow: 6,
                                height: isMobile ? 300 : 450,
                            }}>
                            <Box
                                component="img"
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                                alt="Our team in London"
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    bgcolor: "rgba(0,0,0,0.7)",
                                    p: 2,
                                    textAlign: "center",
                                    color: "white",
                                }}>
                                <Typography variant="body1">
                                    Our team working at our London headquarters
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography
                            variant="h4"
                            component="h2"
                            sx={{
                                fontWeight: 800,
                                mb: 3,
                                color: theme.palette.primary.dark,
                            }}>
                            Our Story
                        </Typography>
                        <Typography
                            variant="body1"
                            paragraph
                            sx={{ fontSize: "1.1rem", lineHeight: 1.7, mb: 2 }}>
                            Founded in 2023 in the heart of London, our platform
                            emerged from a simple idea: knowledge grows when
                            shared. What started as a small project among
                            university friends has transformed into a global
                            community of learners, educators, and experts.
                        </Typography>
                        <Typography
                            variant="body1"
                            paragraph
                            sx={{ fontSize: "1.1rem", lineHeight: 1.7, mb: 2 }}>
                            Today, we connect over 50,000 members across 500+
                            specialized communities, spanning topics from
                            technology and business to arts and wellness. Our
                            London roots inspire our global perspective,
                            blending tradition with innovation.
                        </Typography>
                        <Typography
                            variant="body1"
                            paragraph
                            sx={{ fontSize: "1.1rem", lineHeight: 1.7, mb: 3 }}>
                            We're committed to creating spaces where curiosity
                            thrives, expertise is valued, and meaningful
                            connections form. Every day, we're inspired by the
                            stories of growth and collaboration happening on our
                            platform.
                        </Typography>
                    </Grid>
                </Grid>
            </Container>

            {/* Our Values Section */}
            <Box
                sx={{
                    py: 8,
                    bgcolor: theme.palette.primary.light,
                    backgroundImage:
                        "linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(94, 53, 177, 0.1) 100%)",
                }}>
                <Container>
                    <Typography
                        variant="h4"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            textAlign: "center",
                            mb: 2,
                            color: theme.palette.primary.dark,
                        }}>
                        Our Core Values
                    </Typography>
                    <Typography
                        variant="h6"
                        component="p"
                        sx={{
                            textAlign: "center",
                            mb: 8,
                            maxWidth: 700,
                            mx: "auto",
                            color: theme.palette.text.secondary,
                        }}>
                        These principles guide everything we do at our community
                        platform
                    </Typography>

                    <Grid container spacing={4}>
                        {values.map((value, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        borderRadius: 4,
                                        boxShadow: 3,
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            transform: "translateY(-10px)",
                                            boxShadow: 6,
                                        },
                                    }}>
                                    <CardContent
                                        sx={{
                                            p: 4,
                                            textAlign: "center",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                        }}>
                                        <Box
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: "50%",
                                                bgcolor:
                                                    theme.palette.primary.main,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                mb: 3,
                                            }}>
                                            <Box sx={{ color: "white" }}>
                                                {value.icon}
                                            </Box>
                                        </Box>
                                        <Typography
                                            variant="h5"
                                            component="h3"
                                            sx={{
                                                fontWeight: 700,
                                                mb: 2,
                                                color: theme.palette.primary
                                                    .dark,
                                            }}>
                                            {value.title}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            color="text.secondary">
                                            {value.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Our Team Section */}
            <Container sx={{ py: 8 }}>
                <Typography
                    variant="h4"
                    component="h2"
                    sx={{
                        fontWeight: 800,
                        textAlign: "center",
                        mb: 2,
                        color: theme.palette.primary.dark,
                    }}>
                    Meet Our Leadership Team
                </Typography>
                <Typography
                    variant="h6"
                    component="p"
                    sx={{
                        textAlign: "center",
                        mb: 6,
                        maxWidth: 700,
                        mx: "auto",
                        color: theme.palette.text.secondary,
                    }}>
                    Passionate individuals driving our mission forward
                </Typography>

                <Grid container spacing={4}>
                    {teamMembers.map((member, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                            <Card
                                sx={{
                                    height: "100%",
                                    borderRadius: 4,
                                    boxShadow: 3,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-10px)",
                                        boxShadow: 6,
                                    },
                                }}>
                                <CardContent
                                    sx={{
                                        p: 4,
                                        textAlign: "center",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                    }}>
                                    <Avatar
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            mb: 3,
                                            bgcolor: theme.palette.primary.main,
                                            fontSize: "3rem",
                                        }}>
                                        {member.name.charAt(0)}
                                    </Avatar>
                                    <Typography
                                        variant="h5"
                                        component="h3"
                                        sx={{
                                            fontWeight: 700,
                                            mb: 1,
                                            color: theme.palette.primary.dark,
                                        }}>
                                        {member.name}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            mb: 2,
                                            color: theme.palette.primary.main,
                                            fontWeight: 500,
                                        }}>
                                        {member.role}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary">
                                        {member.bio}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default AboutUs;
