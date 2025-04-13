import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    useTheme,
    Button,
    TextField,
} from "@mui/material";
import {
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Send as SendIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import Maps from "../../Custom/Maps/Maps";
import { companyName } from "../../Hooks/useVariable";

const ContactUs = () => {
    const theme = useTheme();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        console.log(data);
        // Handle form submission here
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
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
                    Contact Us
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    We'd love to hear from you! Reach out through any of these
                    channels
                </Typography>
            </Box>

            {/* Contact Information and Form */}
            <Grid container spacing={4}>
                {/* Contact Info Column */}
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Card
                        elevation={0}
                        sx={{
                            backgroundColor: theme.palette.info.light,
                            color: theme.palette.info.contrastText,
                            borderRadius: 4,
                            height: "100%",
                        }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography
                                variant="h5"
                                gutterBottom
                                sx={{ fontWeight: 600 }}>
                                Contact Information
                            </Typography>

                            <List>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon
                                        sx={{ color: "inherit", minWidth: 40 }}>
                                        <LocationIcon fontSize="large" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Our Location"
                                        secondary="123 Community Street, Tech City, TC 12345"
                                    />
                                </ListItem>

                                <Divider
                                    variant="inset"
                                    component="li"
                                    sx={{
                                        backgroundColor:
                                            theme.palette.info.contrastText,
                                        opacity: 0.2,
                                        my: 2,
                                    }}
                                />

                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon
                                        sx={{ color: "inherit", minWidth: 40 }}>
                                        <PhoneIcon fontSize="large" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Call Us"
                                        secondary="+1 (234) 567-8900 / +1 (987) 654-3210"
                                    />
                                </ListItem>

                                <Divider
                                    variant="inset"
                                    component="li"
                                    sx={{
                                        backgroundColor:
                                            theme.palette.info.contrastText,
                                        opacity: 0.2,
                                        my: 2,
                                    }}
                                />

                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon
                                        sx={{ color: "inherit", minWidth: 40 }}>
                                        <EmailIcon fontSize="large" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Email Us"
                                        secondary={`Care@${companyName}.com\nContact@${companyName}.com`}
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Contact Form Column */}
                <Grid item size={{ xs: 12, md: 6 }}>
                    <Card
                        elevation={0}
                        sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 4,
                            height: "100%",
                        }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography
                                variant="h5"
                                gutterBottom
                                sx={{ fontWeight: 600 }}>
                                Send Us a Message
                            </Typography>

                            <Box
                                component="form"
                                onSubmit={handleSubmit(onSubmit)}
                                sx={{ mt: 3 }}>
                                <Grid container spacing={3}>
                                    <Grid item size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Your Name"
                                            variant="outlined"
                                            {...register("name", {
                                                required: "Name is required",
                                            })}
                                            error={!!errors.name}
                                            helperText={errors.name?.message}
                                        />
                                    </Grid>
                                    <Grid item size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            fullWidth
                                            label="Email Address"
                                            variant="outlined"
                                            type="email"
                                            {...register("email", {
                                                required: "Email is required",
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message:
                                                        "Invalid email address",
                                                },
                                            })}
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                        />
                                    </Grid>
                                    <Grid item size={12}>
                                        <TextField
                                            fullWidth
                                            label="Subject"
                                            variant="outlined"
                                            {...register("subject", {
                                                required: "Subject is required",
                                            })}
                                            error={!!errors.subject}
                                            helperText={errors.subject?.message}
                                        />
                                    </Grid>
                                    <Grid item size={12}>
                                        <TextField
                                            fullWidth
                                            label="Your Message"
                                            variant="outlined"
                                            multiline
                                            rows={1}
                                            {...register("message", {
                                                required: "Message is required",
                                            })}
                                            error={!!errors.message}
                                            helperText={errors.message?.message}
                                        />
                                    </Grid>
                                    <Grid size={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="info"
                                            size="large"
                                            endIcon={<SendIcon />}
                                            sx={{ borderRadius: 2 }}>
                                            Send Message
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Map Section */}
            <Box
                mt={6}
                sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: theme.shadows[2],
                    width: "100%",
                }}>
                <Maps />
            </Box>
        </Container>
    );
};

export default ContactUs;
