import {
    Box,
    Container,
    Grid,
    Link,
    Typography,
    Divider,
    useTheme,
} from "@mui/material";
import { Logo } from "../Nav/Nav";
import { useReactRouter } from "../../Hooks/useReactRouter";
import { useAuthContext } from "../../Context/AuthContext";

const Footer = () => {
    const { user } = useAuthContext();
    const { NavLink } = useReactRouter();

    const theme = useTheme();

    const footerLinks = [
        { name: "Contact Us", link: "/contact-us" },
        { name: "FAQs", link: "/frequently-asked-questions" },
        { name: "Privacy", link: "/privacy" },
        { name: "Pricing", link: "/pricing" },
    ];

    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: theme.palette.info.dark,
                color: theme.palette.info.contrastText,
                py: 6,
                mt: "auto",
            }}>
            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box width="fit-content">
                            <Logo />
                        </Box>

                        <Typography variant="body1" paragraph>
                            Connecting people through shared interests and
                            passions.
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 6, md: 3 }}>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: 600 }}>
                            Quick Links
                        </Typography>
                        <Box
                            component="ul"
                            sx={{ listStyle: "none", p: 0, m: 0 }}>
                            {footerLinks.map((link, i) => (
                                <li
                                    key={i}
                                    style={{
                                        marginBottom: theme.spacing(1),
                                    }}>
                                    <Link
                                        component={NavLink}
                                        to={link.link}
                                        color="inherit"
                                        underline="hover"
                                        sx={{
                                            "&.active": {
                                                color: theme.palette.info.light,
                                                fontWeight: 500,
                                            },
                                        }}>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            {user && (
                                <li>
                                    <Link
                                        component={NavLink}
                                        to="/profile"
                                        color="inherit"
                                        underline="hover"
                                        sx={{
                                            "&.active": {
                                                color: theme.palette.info.light,
                                                fontWeight: 500,
                                            },
                                        }}>
                                        Profile
                                    </Link>
                                </li>
                            )}
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 6, md: 3 }}>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: 600 }}>
                            Follow Us
                        </Typography>
                    </Grid>
                </Grid>

                <Divider
                    sx={{
                        my: 4,
                        backgroundColor: theme.palette.info.light,
                        opacity: 0.2,
                    }}
                />

                <Typography variant="body2" align="center">
                    © {new Date().getFullYear()} CommunityHub. All rights
                    reserved.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
