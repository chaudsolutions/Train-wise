import { useState } from "react";
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
    Tabs,
    Tab,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Button,
    CircularProgress,
    useTheme,
    FormControlLabel,
    Switch,
} from "@mui/material";
import Report from "@mui/icons-material/Report";
import Groups from "@mui/icons-material/Groups";
import MonetizationOn from "@mui/icons-material/MonetizationOn";
import AccountBalance from "@mui/icons-material/AccountBalance";
import Category from "@mui/icons-material/Category";
import Person from "@mui/icons-material/Person";
import Event from "@mui/icons-material/Event";
import Edit from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PageLoader from "../../Animations/PageLoader";
import { useForm } from "react-hook-form";
import axios from "axios";
import { serVer, useToken } from "../../Hooks/useVariable";
import { useCategoriesData } from "../../Hooks/useQueryFetch/useQueryData";
import toast from "react-hot-toast";

const SingleCommunityDash = () => {
    const { communityId } = useParams();
    const [activeTab, setActiveTab] = useState(0);
    const { community, isCommunityLoading, refetchCommunity } =
        useCommunityByIdData({ id: communityId });
    const { categories, isCategoriesLoading } = useCategoriesData();

    if (isCommunityLoading || isCategoriesLoading) {
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

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: "auto" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}>
                    <Tab
                        label={
                            <Typography
                                variant="body1"
                                fontSize={{ xs: "0.8rem", sm: "1rem" }}
                                fontWeight={500}>
                                View Community
                            </Typography>
                        }
                        icon={<Visibility fontSize="small" />}
                        iconPosition="start"
                    />
                    <Tab
                        label={
                            <Typography
                                variant="body1"
                                fontSize={{ xs: "0.8rem", sm: "1rem" }}
                                fontWeight={500}>
                                Edit Community
                            </Typography>
                        }
                        icon={<Edit fontSize="small" />}
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            {activeTab === 0 ? (
                <CommunityViewTab community={community} />
            ) : (
                <CommunityEditTab
                    community={community}
                    categories={categories}
                    refetchCommunity={refetchCommunity}
                />
            )}
        </Box>
    );
};

// Tab for viewing community details
const CommunityViewTab = ({ community, refetch }) => {
    const { isMobile } = useResponsive();
    const theme = useTheme();
    const { token } = useToken();
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const handleToggleStatus = async () => {
        try {
            setIsUpdatingStatus(true);
            const newStatus = !community.canExplore;

            await axios.patch(
                `${serVer}/admin/community/${community._id}/status`,
                { canExplore: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            refetch();
            toast.success(
                `Community ${
                    newStatus ? "activated" : "deactivated"
                } successfully`
            );
        } catch (error) {
            console.error("Error updating community status:", error);
            toast.error("Failed to update community status. Please try again.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 3,
                    flexWrap: "wrap",
                    gap: 2,
                }}>
                <Typography
                    variant="h4"
                    fontSize={{ xs: "1.5rem", sm: "2rem" }}
                    sx={{
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    }}>
                    <Groups /> {community.name}
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        backgroundColor: community.canExplore
                            ? theme.palette.primary.main
                            : theme.palette.error.light,
                        color: "white",
                        p: { xs: 1, sm: 2 },
                        borderRadius: 2,
                        minWidth: 300,
                    }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flex: 1,
                        }}>
                        {community.canExplore ? (
                            <CheckCircleIcon sx={{ color: "inherit" }} />
                        ) : (
                            <CancelIcon sx={{ color: "error.main" }} />
                        )}
                        <Typography
                            variant="body1"
                            fontSize={{ xs: "0.7rem", md: ".9rem" }}
                            fontWeight={500}>
                            {community.canExplore
                                ? "Community is active and can be explored"
                                : "Community cannot be currently explored"}
                        </Typography>
                    </Box>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={community.canExplore}
                                onChange={handleToggleStatus}
                                disabled={isUpdatingStatus}
                                color={
                                    community.canExplore ? "inherit" : "error"
                                }
                            />
                        }
                        label={
                            isUpdatingStatus ? (
                                <CircularProgress size={20} />
                            ) : community.canExplore ? (
                                "Active"
                            ) : (
                                "Inactive"
                            )
                        }
                        sx={{
                            ml: 0,
                            "& .MuiFormControlLabel-label": {
                                minWidth: 60,
                            },
                        }}
                    />
                </Box>
            </Box>

            <Card elevation={3} sx={{ borderRadius: 4, mb: 4 }}>
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
                        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                            <Avatar
                                src={community.logo}
                                alt={community.name}
                                sx={{
                                    width: { xs: 80, sm: 100 },
                                    height: { xs: 80, sm: 100 },
                                    mx: "auto",
                                    mb: 2,
                                    bgcolor: "primary.main",
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
                                            bgcolor: "primary.main",
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
                                                    bgcolor: "primary.main",
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
        </>
    );
};

// Tab for editing community details
const CommunityEditTab = ({ community, categories, refetchCommunity }) => {
    const theme = useTheme();
    const { token } = useToken();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { isSubmitting },
    } = useForm({
        defaultValues: {
            name: community.name,
            description: community.description,
            subscriptionFee: community.subscriptionFee,
            category: community.category,
            rule1: community.rules?.[0] || "",
            rule2: community.rules?.[1] || "",
            rule3: community.rules?.[2] || "",
            vision1: community.visions?.[0] || "",
            vision2: community.visions?.[1] || "",
            vision3: community.visions?.[2] || "",
            bannerPreview: community.bannerImage || "",
            logoPreview: community.logo || "",
        },
    });

    const onSubmit = async (data) => {
        try {
            const rules = [data.rule1, data.rule2, data.rule3].filter(
                (rule) => rule.trim() !== ""
            );
            const visions = [data.vision1, data.vision2, data.vision3].filter(
                (vision) => vision.trim() !== ""
            );

            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("subscriptionFee", data.subscriptionFee);
            formData.append("category", data.category);
            rules.forEach((rule, index) =>
                formData.append(`rules[${index}]`, rule)
            );
            visions.forEach((vision, index) =>
                formData.append(`visions[${index}]`, vision)
            );

            if (data.image1?.[0]) {
                formData.append("bannerImage", data.image1[0]);
            }
            if (data.image2?.[0]) {
                formData.append("logo", data.image2[0]);
            }

            await axios.put(
                `${serVer}/admin/edit-community/${community._id}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            refetchCommunity();
            toast.success("Community updated successfully");
        } catch (error) {
            console.error("Error updating community:", error);
            toast.error("Failed to update community. Please try again.");
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
            <Typography
                variant="h4"
                component="h1"
                align="center"
                gutterBottom
                sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    mb: 4,
                }}>
                Edit Community
            </Typography>

            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                }}>
                <TextField
                    label="Community Name"
                    variant="outlined"
                    fullWidth
                    {...register("name")}
                />
                <TextField
                    label="Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={1}
                    {...register("description")}
                />
                <TextField
                    label="Monthly Subscription Fee"
                    variant="outlined"
                    fullWidth
                    type="number"
                    placeholder="0 if free"
                    {...register("subscriptionFee")}
                />
                <FormControl fullWidth>
                    <InputLabel>Select Category</InputLabel>
                    <Select
                        label="Select Category"
                        {...register("category")}
                        defaultValue={community.category}>
                        {categories?.map((category) => (
                            <MenuItem key={category.name} value={category.name}>
                                {category.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box
                    sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        p: 2,
                    }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Community Rules
                    </Typography>
                    {[1, 2, 3].map((index) => (
                        <TextField
                            key={index}
                            label={`Rule ${index}`}
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            {...register(`rule${index}`)}
                        />
                    ))}
                </Box>

                <Box
                    sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        p: 2,
                    }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Community Visions
                    </Typography>
                    {[1, 2, 3].map((index) => (
                        <TextField
                            key={index}
                            label={`Vision ${index}`}
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            {...register(`vision${index}`)}
                        />
                    ))}
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        gap: 3,
                        flexDirection: { xs: "column", sm: "row" },
                    }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Community Banner Image
                        </Typography>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            gutterBottom>
                            Current:
                        </Typography>
                        <CardMedia
                            component="img"
                            height="150"
                            image={
                                watch("bannerPreview") ||
                                "https://via.placeholder.com/1200x200"
                            }
                            alt="Current banner"
                            sx={{ objectFit: "cover", mb: 2, borderRadius: 2 }}
                        />
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth>
                                Change Banner
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    {...register("image1", {
                                        onChange: (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setValue(
                                                        "bannerPreview",
                                                        event.target.result
                                                    );
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        },
                                    })}
                                />
                            </Button>
                        </Box>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Community Logo
                        </Typography>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            gutterBottom>
                            Current:
                        </Typography>
                        <Avatar
                            src={watch("logoPreview")}
                            alt="Current logo"
                            sx={{
                                width: 100,
                                height: 100,
                                mx: "auto",
                                mb: 2,
                                bgcolor: "primary.main",
                            }}
                        />
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth>
                                Change Logo
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    {...register("image2", {
                                        onChange: (e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setValue(
                                                        "logoPreview",
                                                        event.target.result
                                                    );
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        },
                                    })}
                                />
                            </Button>
                        </Box>
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 3,
                        gap: 2,
                    }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}>
                        {isSubmitting ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            "Update"
                        )}
                    </Button>

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                            setValue("image1", null);
                            setValue("image2", null);
                        }}>
                        Reset Images
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default SingleCommunityDash;
