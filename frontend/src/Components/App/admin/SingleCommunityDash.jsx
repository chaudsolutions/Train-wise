import { useParams } from "react-router-dom";
import useResponsive from "../../Hooks/useResponsive";
import { useCommunityByIdData } from "../../Hooks/useQueryFetch/useQueryData";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Avatar,
    Chip,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Divider,
    Badge,
    Stack,
} from "@mui/material";
import Report from "@mui/icons-material/Report";
import Groups from "@mui/icons-material/Groups";
import MonetizationOn from "@mui/icons-material/MonetizationOn";
import AccountBalance from "@mui/icons-material/AccountBalance";
import Category from "@mui/icons-material/Category";
import Person from "@mui/icons-material/Person";
import Event from "@mui/icons-material/Event";
import PageLoader from "../../Animations/PageLoader";

const SingleCommunityDash = () => {
    const { communityId } = useParams();
    const { isMobile } = useResponsive();
    const { community, isCommunityLoading } = useCommunityByIdData({
        id: communityId,
    });

    if (isCommunityLoading) {
        return <PageLoader />;
    }

    if (!community) {
        return (
            <Typography
                variant="h6"
                color="error"
                sx={{ p: 3, textAlign: "center" }}>
                Community not found
            </Typography>
        );
    }

    console.log(community);

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: "auto" }}>
            <Typography
                variant="h4"
                fontSize={{ xs: "1.5rem", sm: "2rem" }}
                sx={{
                    mb: 3,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}>
                <Groups /> {community.name}
            </Typography>

            <Card elevation={3} sx={{ borderRadius: 4, mb: 4 }}>
                {/* Banner Image */}
                <CardMedia
                    component="img"
                    height={isMobile ? "150" : "200"}
                    image={
                        community.bannerImage ||
                        "https://via.placeholder.com/1200x200"
                    }
                    alt={`${community.name} banner`}
                    sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Grid container spacing={2} alignItems="center">
                        {/* Logo and Basic Info */}
                        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                            <Avatar
                                src={community.logo}
                                alt={community.name}
                                sx={{
                                    width: { xs: 80, sm: 100 },
                                    height: { xs: 80, sm: 100 },
                                    mx: "auto",
                                    mb: 2,
                                    bgcolor: "info.main",
                                }}>
                                {community.name?.charAt(0)}
                            </Avatar>
                            <Typography
                                variant="h6"
                                fontSize={{ xs: "1rem", sm: "1.25rem" }}
                                textAlign="center">
                                {community.name}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                textAlign="center">
                                Created by:{" "}
                                {community.createdBy?.name || "Unknown"}
                            </Typography>
                        </Grid>

                        {/* Description and Stats */}
                        <Grid size={{ xs: 12, sm: 8, md: 9 }}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                {community.description}
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Chip
                                        icon={<Groups fontSize="small" />}
                                        label={`Members: ${
                                            community.members?.length || 0
                                        }`}
                                        variant="outlined"
                                        sx={{
                                            width: "100%",
                                            bgcolor: "background.paper",
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Chip
                                        icon={
                                            <MonetizationOn fontSize="small" />
                                        }
                                        label={`Fee: $${community.subscriptionFee.toFixed(
                                            2
                                        )}/mo`}
                                        variant="outlined"
                                        sx={{
                                            width: "100%",
                                            bgcolor: "background.paper",
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Chip
                                        icon={
                                            <AccountBalance fontSize="small" />
                                        }
                                        label={`Balance: $${
                                            community.balance?.toFixed(2) ||
                                            "0.00"
                                        }`}
                                        variant="outlined"
                                        sx={{
                                            width: "100%",
                                            bgcolor: "background.paper",
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Chip
                                        icon={<Category fontSize="small" />}
                                        label={`Category: ${community.category}`}
                                        variant="outlined"
                                        sx={{
                                            width: "100%",
                                            bgcolor: "background.paper",
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Chip
                                        icon={<Person fontSize="small" />}
                                        label={`Creator: ${
                                            community.createdBy?.name ||
                                            "Unknown"
                                        }`}
                                        variant="outlined"
                                        sx={{
                                            width: "100%",
                                            bgcolor: "background.paper",
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Chip
                                        icon={<Report fontSize="small" />}
                                        label={`Reports: ${
                                            community.reports?.length || 0
                                        }`}
                                        variant="outlined"
                                        sx={{
                                            width: "100%",
                                            bgcolor: "background.paper",
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Chip
                                        icon={<Event fontSize="small" />}
                                        label={`Created: ${new Date(
                                            community.createdAt
                                        ).toLocaleDateString()}`}
                                        variant="outlined"
                                        sx={{
                                            width: "100%",
                                            bgcolor: "background.paper",
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Members List */}
            <Paper elevation={2} sx={{ borderRadius: 4, mb: 4 }}>
                <Typography
                    variant="h6"
                    sx={{
                        p: 2,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}>
                    <Groups /> Members ({community.members?.length || 0})
                </Typography>
                <Divider />
                <List>
                    {community.members?.length > 0 ? (
                        community.members.map((member) => (
                            <ListItem
                                key={member.userId._id}
                                sx={{ py: 1, px: { xs: 1, sm: 2 } }}>
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{
                                            bgcolor: "info.main",
                                            width: 40,
                                            height: 40,
                                        }}>
                                        {member.userId?.name?.charAt(0) || "?"}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={member.userId?.name || "Unknown"}
                                    secondary={`Status: ${
                                        member.status
                                    } | Joined: ${new Date(
                                        member.createdAt
                                    ).toLocaleDateString()}`}
                                />
                            </ListItem>
                        ))
                    ) : (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ p: 2 }}>
                            No members found
                        </Typography>
                    )}
                </List>
            </Paper>

            {/* Community Reports */}
            <Paper elevation={2} sx={{ borderRadius: 4 }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                        p: 2,
                        bgcolor: "background.paper",
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                    }}>
                    <Report color="error" />
                    <Typography variant="h6" fontWeight={500}>
                        Community Reports
                    </Typography>
                    <Chip
                        label={`${community.reports?.length || 0} reports`}
                        color="error"
                        size="small"
                        sx={{ ml: 1 }}
                    />
                </Stack>
                <Divider />

                {community.reports?.length > 0 ? (
                    <List>
                        {community.reports.map((report, index) => (
                            <Box key={index}>
                                <ListItem
                                    alignItems="flex-start"
                                    sx={{ py: 2 }}>
                                    <ListItemAvatar>
                                        <Badge
                                            color="error"
                                            overlap="circular"
                                            badgeContent={
                                                <Report fontSize="small" />
                                            }>
                                            <Avatar
                                                src={report.userId?.avatar}
                                                alt={report.userId?.name}
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    bgcolor: "info.main",
                                                }}>
                                                {report.userId?.name?.charAt(
                                                    0
                                                ) || "R"}
                                            </Avatar>
                                        </Badge>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography fontWeight={500}>
                                                {report.userId?.name ||
                                                    "Anonymous"}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="text.primary"
                                                    display="block"
                                                    sx={{ mt: 0.5 }}>
                                                    {report.reason}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    display="block"
                                                    sx={{ mt: 0.5 }}>
                                                    Reported on:{" "}
                                                    {new Date(
                                                        report.createdAt
                                                    ).toLocaleDateString()}
                                                </Typography>
                                            </>
                                        }
                                        sx={{ ml: 1 }}
                                    />
                                </ListItem>
                                {index < community.reports.length - 1 && (
                                    <Divider variant="inset" />
                                )}
                            </Box>
                        ))}
                    </List>
                ) : (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ p: 3, textAlign: "center" }}>
                        No reports for this community
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default SingleCommunityDash;
