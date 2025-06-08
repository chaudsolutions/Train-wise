import {
    Card,
    CardMedia,
    CardContent,
    Avatar,
    Typography,
    Chip,
    Box,
    useTheme,
    IconButton,
    Badge,
    Skeleton,
} from "@mui/material";
import { useReactRouter } from "../../Hooks/useReactRouter";
import GroupsIcon from "@mui/icons-material/Groups";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShareIcon from "@mui/icons-material/Share";
import { useState } from "react";
import SocialShareDrawer from "../Buttons/SocialShareDrawer";
import useResponsive from "../../Hooks/useResponsive";

const CommunitiesList = ({ community, isLoading }) => {
    const { Link } = useReactRouter();
    const theme = useTheme();
    const { isMobile } = useResponsive();
    const [isHovered, setIsHovered] = useState(false);
    const [selectShare, setSelectShare] = useState(false);

    // Format creator name
    const formatCreatorName = (fullName) => {
        if (!fullName) return "";
        const names = fullName.split(" ");
        if (names.length === 1) return names[0];
        return `${names[0]} ${names[1][0]}.`;
    };

    // Handle loading state
    if (isLoading) {
        return (
            <Card
                sx={{
                    height: "100%",
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: theme.shadows[3],
                    transition: "all 0.3s ease",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                }}>
                <Skeleton variant="rectangular" height={180} />
                <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Skeleton
                            variant="circular"
                            width={50}
                            height={50}
                            sx={{ mr: 2 }}
                        />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="70%" height={30} />
                            <Skeleton variant="text" width="50%" />
                        </Box>
                    </Box>
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="80%" />
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 3,
                        }}>
                        <Skeleton variant="text" width="40%" />
                        <Skeleton variant="text" width="30%" />
                    </Box>
                </CardContent>
            </Card>
        );
    }

    const communityUrl = `${window.location.origin}/community/${community?._id}`;

    return (
        <>
            <Card
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease",
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: theme.shadows[3],
                    position: "relative",
                    "&:hover": {
                        transform: "translateY(-10px)",
                        boxShadow: theme.shadows[10],
                    },
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}>
                {/* Banner with category badge */}
                <Box sx={{ position: "relative" }}>
                    <CardMedia
                        component="img"
                        height="180"
                        image={
                            community?.bannerImage ||
                            "https://via.placeholder.com/600x300?text=Community+Banner"
                        }
                        alt="Community banner"
                        sx={{
                            objectFit: "cover",
                            transition: "transform 0.5s ease",
                            transform: isHovered ? "scale(1.05)" : "scale(1)",
                            [theme.breakpoints.down("sm")]: {
                                height: "150px",
                            },
                        }}
                    />

                    {/* Category badge */}
                    <Chip
                        label={`#${community?.category}`}
                        color="primary"
                        sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.5,
                            background:
                                "linear-gradient(45deg, #1976d2 0%, #5e35b1 100%)",
                            color: "white",
                            boxShadow: theme.shadows[2],
                        }}
                    />

                    {/* Hover actions */}
                    {(isHovered || isMobile) && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: 16,
                                left: 16,
                                display: "flex",
                                gap: 1,
                            }}>
                            <IconButton
                                sx={{
                                    bgcolor: "white",
                                    color: theme.palette.error.main,
                                    border: `1px solid ${theme.palette.error.main}`,
                                }}>
                                <FavoriteBorderIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                onClick={() => setSelectShare(true)}
                                sx={{
                                    bgcolor: selectShare
                                        ? "primary.main"
                                        : "white",
                                    color: selectShare
                                        ? "white"
                                        : theme.palette.primary.dark,
                                    border: `1px solid ${theme.palette.primary.main}`,
                                }}>
                                <ShareIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                </Box>

                {/* Community info */}
                <CardContent
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        display: "flex",
                        flexDirection: "column",
                    }}>
                    <Box
                        component={Link}
                        to={`/community/${community?._id}`}
                        sx={{
                            textDecoration: "none",
                            color: "inherit",
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                        }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                mb: 2,
                            }}>
                            <Badge
                                overlap="circular"
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                }}
                                badgeContent={
                                    <Box
                                        sx={{
                                            bgcolor: theme.palette.success.main,
                                            width: 14,
                                            height: 14,
                                            borderRadius: "50%",
                                            border: "2px solid white",
                                        }}
                                    />
                                }>
                                <Avatar
                                    src={community?.logo}
                                    alt="Community logo"
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        mr: 2,
                                        border: "3px solid white",
                                        boxShadow: theme.shadows[2],
                                        bgcolor: theme.palette.background.paper,
                                    }}
                                />
                            </Badge>
                            <Box>
                                <Typography
                                    variant="h6"
                                    component="h3"
                                    noWrap
                                    sx={{
                                        fontWeight: 800,
                                        color: theme.palette.text.primary,
                                        mb: 0.5,
                                        letterSpacing: -0.5,
                                    }}>
                                    {community?.name}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: "block",
                                        lineHeight: 1.2,
                                        color: theme.palette.text.secondary,
                                        fontWeight: 500,
                                    }}>
                                    Created by{" "}
                                    <Box
                                        component="span"
                                        sx={{
                                            color: theme.palette.primary.main,
                                            fontWeight: 600,
                                        }}>
                                        {formatCreatorName(
                                            community?.creatorName
                                        )}
                                    </Box>
                                </Typography>
                            </Box>
                        </Box>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mb: 2,
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                minHeight: 60,
                                fontSize: "0.9rem",
                                lineHeight: 1.6,
                            }}>
                            {community?.description}
                        </Typography>
                    </Box>

                    {/* Stats and pricing */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: "auto",
                            pt: 2,
                            borderTop: `1px solid ${theme.palette.divider}`,
                        }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <GroupsIcon
                                fontSize="small"
                                sx={{
                                    mr: 1,
                                    color: theme.palette.primary.main,
                                }}
                            />
                            <Typography
                                variant="body2"
                                fontWeight={500}
                                color="text.primary">
                                {community?.members?.length || 0} Members
                            </Typography>
                        </Box>

                        <Chip
                            label={
                                community?.subscriptionFee === 0
                                    ? "Free Access"
                                    : `$${community?.subscriptionFee}/mo`
                            }
                            color={
                                community?.subscriptionFee === 0
                                    ? "success"
                                    : "primary"
                            }
                            size="small"
                            sx={{
                                fontWeight: 700,
                                borderRadius: 2,
                                px: 1.5,
                                py: 1,
                                fontSize: "0.8rem",
                                boxShadow: theme.shadows[1],
                            }}
                        />
                    </Box>
                </CardContent>
            </Card>

            <SocialShareDrawer
                open={selectShare}
                onClose={() => setSelectShare(false)}
                url={communityUrl}
                communityName={community?.name}
            />
        </>
    );
};

export default CommunitiesList;
