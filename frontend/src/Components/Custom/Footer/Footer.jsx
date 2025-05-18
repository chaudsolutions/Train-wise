import {
    Box,
    Container,
    Grid,
    Link,
    Typography,
    Divider,
    useTheme,
    IconButton,
    Stack,
} from "@mui/material";
import { Logo } from "../Nav/Nav";
import { useReactRouter } from "../../Hooks/useReactRouter";
import { useAuthContext } from "../../Context/AuthContext";
import { Facebook, Twitter, Instagram } from "@mui/icons-material";
import useResponsive from "../../Hooks/useResponsive";

const Footer = () => {
    const { user } = useAuthContext();
    const { NavLink } = useReactRouter();
    const theme = useTheme();
    const { isMobile } = useResponsive();

    const footerLinks = [
        { name: "Contact Us", link: "/contact-us" },
        { name: "FAQs", link: "/frequently-asked-questions" },
        { name: "Privacy", link: "/privacy" },
        { name: "Pricing", link: "/pricing" },
    ];

    const socialLinks = [
        { icon: <Twitter />, link: "#" },
        { icon: <Facebook />, link: "#" },
        { icon: <Instagram />, link: "#" },
    ];

    return (
        <Box
            component="footer"
            sx={{
                background: `linear-gradient(180deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[900]} 100%)`,
                color: theme.palette.common.white,
                py: isMobile ? 2 : 6,
                mt: "auto",
            }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Brand Column */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={3}>
                            <Box>
                                <Logo />
                            </Box>
                            <Typography
                                variant="body1"
                                sx={{
                                    opacity: 0.8,
                                    maxWidth: 400,
                                    fontSize: ".8rem",
                                }}>
                                Connecting people through shared interests and
                                passions. Join our growing community today.
                            </Typography>
                        </Stack>
                    </Grid>

                    {/* Quick Links Column */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography
                            variant="h6"
                            textAlign="center"
                            gutterBottom
                            sx={{
                                fontWeight: 700,
                                letterSpacing: 0.5,
                            }}>
                            Quick Links
                        </Typography>
                        <Stack
                            spacing={1.5}
                            direction="row"
                            justifyContent="center">
                            {footerLinks.map((link, i) => (
                                <Link
                                    key={i}
                                    component={NavLink}
                                    to={link.link}
                                    color="inherit"
                                    underline="none"
                                    sx={{
                                        whiteSpace: "nowrap",
                                        opacity: 0.8,
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            opacity: 1,
                                            color: theme.palette.primary.main,
                                        },
                                        "&.active": {
                                            color: theme.palette.primary.main,
                                            fontWeight: 600,
                                        },
                                    }}>
                                    {link.name}
                                </Link>
                            ))}
                            {user && (
                                <Link
                                    component={NavLink}
                                    to="/profile"
                                    color="inherit"
                                    underline="none"
                                    sx={{
                                        opacity: 0.8,
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            opacity: 1,
                                            color: theme.palette.primary.main,
                                            transform: "translateX(4px)",
                                        },
                                    }}>
                                    Profile
                                </Link>
                            )}
                        </Stack>
                    </Grid>

                    {/* Social Links Column */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Typography
                            variant="h6"
                            textAlign="center"
                            gutterBottom
                            sx={{
                                fontWeight: 700,
                                letterSpacing: 0.5,
                            }}>
                            Follow Us
                        </Typography>
                        <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            justifyContent="center">
                            {socialLinks.map((social, index) => (
                                <IconButton
                                    key={index}
                                    href={social.link}
                                    target="_blank"
                                    rel="noopener"
                                    sx={{
                                        color: theme.palette.common.white,
                                        opacity: 0.8,
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            opacity: 1,
                                            color: theme.palette.primary.main,
                                            transform: "translateY(-2px)",
                                        },
                                    }}>
                                    {social.icon}
                                </IconButton>
                            ))}
                        </Stack>
                    </Grid>
                </Grid>

                <Divider
                    sx={{
                        my: 2,
                        bgcolor: "white",
                    }}
                />

                <Typography
                    variant="body2"
                    align="center"
                    sx={{
                        opacity: 0.6,
                        letterSpacing: 0.5,
                        fontSize: "0.7rem",
                    }}>
                    © {new Date().getFullYear()} CommunityHub. All rights
                    reserved.
                    <br />
                    Built with passion in {new Date().getFullYear()}
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
