import { useState } from "react";
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Divider,
    useTheme,
    Slide,
    Fade,
    Button,
    Grid,
} from "@mui/material";
import Facebook from "@mui/icons-material/Facebook";
import Twitter from "@mui/icons-material/Twitter";
import WhatsApp from "@mui/icons-material/WhatsApp";
import LinkedIn from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import RedditIcon from "@mui/icons-material/Reddit";
import TelegramIcon from "@mui/icons-material/Telegram";
import Close from "@mui/icons-material/Close";
import Link from "@mui/icons-material/Link";

const SocialShareDrawer = ({ open, onClose, url, communityName }) => {
    const title = `Check out this community: ${communityName}`;
    const theme = useTheme();
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const socialPlatforms = [
        {
            name: "Facebook",
            icon: <Facebook fontSize="large" />,
            color: "#1877F2",
            shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                url
            )}`,
        },
        {
            name: "Twitter",
            icon: <Twitter fontSize="large" />,
            color: "#1DA1F2",
            shareUrl: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                url
            )}&text=${encodeURIComponent(title)}`,
        },
        {
            name: "WhatsApp",
            icon: <WhatsApp fontSize="large" />,
            color: "#25D366",
            shareUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(
                `${title} ${url}`
            )}`,
        },
        {
            name: "LinkedIn",
            icon: <LinkedIn fontSize="large" />,
            color: "#0A66C2",
            shareUrl: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                url
            )}&title=${encodeURIComponent(title)}`,
        },
        {
            name: "Email",
            icon: <EmailIcon fontSize="large" />,
            color: "#EA4335",
            shareUrl: `mailto:?subject=${encodeURIComponent(
                title
            )}&body=${encodeURIComponent(`${title}\n\n${url}`)}`,
        },
        {
            name: "Reddit",
            icon: <RedditIcon fontSize="large" />,
            color: "#FF4500",
            shareUrl: `https://www.reddit.com/submit?url=${encodeURIComponent(
                url
            )}&title=${encodeURIComponent(title)}`,
        },
        {
            name: "Telegram",
            icon: <TelegramIcon fontSize="large" />,
            color: "#0088CC",
            shareUrl: `https://t.me/share/url?url=${encodeURIComponent(
                url
            )}&text=${encodeURIComponent(title)}`,
        },
    ];

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            sx={{
                "& .MuiDrawer-paper": {
                    borderRadius: "20px 20px 0 0",
                    maxWidth: 800,
                    mx: "auto",
                    bgcolor: theme.palette.background.paper,
                    boxShadow: theme.shadows[10],
                },
            }}>
            <Box sx={{ p: 3, position: "relative" }}>
                <Typography
                    variant="h6"
                    fontWeight={700}
                    textAlign="center"
                    sx={{ mb: 1 }}>
                    Share this community
                </Typography>
                <Typography
                    variant="body1"
                    component="p"
                    fontWeight={500}
                    fontSize=".9rem"
                    textAlign="center"
                    sx={{ mb: 2 }}>
                    {communityName}
                </Typography>

                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        bgcolor: theme.palette.grey[100],
                        "&:hover": {
                            bgcolor: theme.palette.grey[200],
                        },
                    }}>
                    <Close />
                </IconButton>

                <Divider sx={{ mb: 3 }} />

                <Grid
                    container
                    spacing={2}
                    justifyContent="center"
                    sx={{ mb: 3 }}>
                    {socialPlatforms.map((platform, index) => (
                        <Grid key={platform.name}>
                            <Slide
                                direction="up"
                                in={open}
                                timeout={index * 100 + 300}>
                                <Box>
                                    <IconButton
                                        component="a"
                                        href={platform.shareUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            bgcolor: `${platform.color}10`,
                                            color: platform.color,
                                            width: 64,
                                            height: 64,
                                            "&:hover": {
                                                bgcolor: `${platform.color}20`,
                                                transform: "scale(1.1)",
                                            },
                                            transition: "all 0.3s ease",
                                        }}>
                                        {platform.icon}
                                    </IconButton>
                                    <Typography
                                        variant="caption"
                                        display="block"
                                        textAlign="center"
                                        mt={1}
                                        color="text.secondary">
                                        {platform.name}
                                    </Typography>
                                </Box>
                            </Slide>
                        </Grid>
                    ))}
                </Grid>

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                        sx={{
                            flex: 1,
                            bgcolor: theme.palette.grey[100],
                            borderRadius: "50px",
                            p: "6px 16px",
                            display: "flex",
                            alignItems: "center",
                            overflow: "hidden",
                        }}>
                        <Link
                            sx={{
                                mr: 1,
                                color: theme.palette.text.secondary,
                            }}
                        />
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{ flex: 1, color: theme.palette.text.primary }}>
                            {url}
                        </Typography>
                    </Box>

                    <Fade in={!copied}>
                        <Button
                            variant="contained"
                            onClick={handleCopyLink}
                            sx={{
                                borderRadius: "50px",
                                px: 3,
                                py: 1.5,
                                fontWeight: 700,
                                textTransform: "none",
                                whiteSpace: "nowrap",
                                bgcolor: theme.palette.primary.main,
                                "&:hover": {
                                    bgcolor: theme.palette.primary.dark,
                                },
                            }}>
                            Copy Link
                        </Button>
                    </Fade>

                    <Fade in={copied}>
                        <Typography
                            variant="body2"
                            color="success.main"
                            fontWeight={600}
                            sx={{
                                position: "absolute",
                                right: 16,
                                bgcolor: "background.paper",
                                px: 2,
                                py: 1,
                                borderRadius: "50px",
                                boxShadow: theme.shadows[1],
                            }}>
                            Link copied!
                        </Typography>
                    </Fade>
                </Box>
            </Box>
        </Drawer>
    );
};

export default SocialShareDrawer;
