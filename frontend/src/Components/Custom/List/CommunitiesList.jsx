import {
    Card,
    CardHeader,
    CardMedia,
    CardContent,
    Avatar,
    Typography,
    Chip,
    Box,
    Badge,
    useTheme,
    Grid,
} from "@mui/material";
import { useReactRouter } from "../../Hooks/useReactRouter";
import GroupsIcon from "@mui/icons-material/Groups";

const CommunitiesList = ({ community }) => {
    const { Link } = useReactRouter();
    const theme = useTheme();

    // Add this format function
    const formatCreatorName = (fullName) => {
        if (!fullName) return "";
        const names = fullName.split(" ");
        if (names.length === 1) return names[0];
        return `${names[0]} ${names[1][0]}.`;
    };

    return (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease",
                    border: "1px solid",
                    borderColor: theme.palette.divider,
                    "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: theme.shadows[6],
                        borderColor: theme.palette.info.main,
                    },
                }}>
                <Box
                    component={Link}
                    to={`/community/${community?._id}`}
                    sx={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                    }}>
                    <CardHeader
                        sx={{
                            p: 0,
                            position: "relative",
                        }}
                        avatar={
                            <Badge
                                badgeContent={`#${community?.category}`}
                                color="info"
                                sx={{
                                    "& .MuiBadge-badge": {
                                        position: "absolute",
                                        fontSize: "1rem",
                                        fontWeight: "bold",
                                        padding: "1rem .5rem",
                                        width: "fit-content",
                                        top: 25,
                                        left: -20,
                                    },
                                }}
                            />
                        }
                    />

                    <CardMedia
                        component="img"
                        height="180"
                        image={community?.bannerImage}
                        alt="Community banner"
                        sx={{
                            objectFit: "cover",
                            [theme.breakpoints.down("sm")]: {
                                height: "150px",
                            },
                        }}
                    />

                    <CardContent sx={{ flexGrow: 1 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                            }}>
                            <Avatar
                                src={community?.logo}
                                alt="Community logo"
                                sx={{
                                    width: 50,
                                    height: 50,
                                    mr: 2,
                                    border: "2px solid",
                                    borderColor: theme.palette.info.light,
                                }}
                            />
                            <Box>
                                <Typography
                                    variant="h6"
                                    component="h3"
                                    fontSize="1.1rem"
                                    noWrap
                                    sx={{
                                        fontWeight: 600,
                                        color: theme.palette.text.primary,
                                    }}>
                                    {community?.name}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        display: "block",
                                        lineHeight: 1.2,
                                    }}>
                                    Created by{" "}
                                    {formatCreatorName(community?.creatorName)}
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
                            }}>
                            {community?.description}
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: "auto",
                            }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <GroupsIcon
                                    fontSize="small"
                                    sx={{
                                        mr: 0.5,
                                        color: theme.palette.text.secondary,
                                    }}
                                />
                                <Typography
                                    variant="caption"
                                    color="text.secondary">
                                    {community?.members?.length || 0} Members
                                </Typography>
                            </Box>

                            <Chip
                                label={
                                    community?.subscriptionFee === 0
                                        ? "Free"
                                        : `$${community?.subscriptionFee}/mo`
                                }
                                color="info"
                                size="small"
                                sx={{
                                    fontWeight: 500,
                                    borderRadius: 1,
                                }}
                            />
                        </Box>
                    </CardContent>
                </Box>
            </Card>
        </Grid>
    );
};

export default CommunitiesList;
