import {
    Container,
    Typography,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Button,
    Box,
    Paper,
    useTheme,
    CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useReactRouter } from "../../Hooks/useReactRouter";
import toast from "react-hot-toast";
import { categories, serVer, useToken } from "../../Hooks/useVariable";
import { useCommunitiesData } from "../../Hooks/useQueryFetch/useQueryData";
import PageLoader from "../../Animations/PageLoader";

const CreateCommunity = () => {
    const theme = useTheme();

    const { useNavigate } = useReactRouter();

    const { token } = useToken();

    const { isCommunitiesLoading, refetchCommunities } = useCommunitiesData();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            bannerPreview: "",
            logoPreview: "",
        },
    });

    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            // Combine rules and visions into arrays
            const rules = [data.rule1, data.rule2, data.rule3];
            const visions = [data.vision1, data.vision2, data.vision3];

            // Prepare the data for submission
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
            formData.append("bannerImage", data.image1[0]); // Banner image
            formData.append("logo", data.image2[0]); // Logo

            // API call to create a community
            const response = await axios.post(
                `${serVer}/creator/create-community`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const communityId = response.data._id;

            refetchCommunities();

            // Navigate to the newly created community
            navigate(`/community/${communityId}`);

            toast.success("Community created successfully");
        } catch (error) {
            console.error("Error creating community:", error);
            toast.error("Failed to create community. Please try again.");
        }
    };

    if (isCommunitiesLoading) {
        return <PageLoader />;
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    align="center"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        color: theme.palette.info.main,
                        mb: 4,
                    }}>
                    Create a New Community
                </Typography>

                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                    }}>
                    {/* Community Name */}
                    <TextField
                        label="Community Name"
                        variant="outlined"
                        fullWidth
                        {...register("name", {
                            required: "Community name is required",
                        })}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />

                    {/* Community Description */}
                    <TextField
                        label="Description"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={1}
                        {...register("description", {
                            required: "Description is required",
                        })}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                    />

                    {/* Subscription Fee */}
                    <TextField
                        label="Monthly Subscription Fee"
                        variant="outlined"
                        fullWidth
                        type="number"
                        placeholder="0 if free"
                        {...register("subscriptionFee", {
                            required: "Subscription Fee is required",
                        })}
                        error={!!errors.subscriptionFee}
                        helperText={errors.subscriptionFee?.message}
                    />

                    {/* Category Select */}
                    <FormControl fullWidth error={!!errors.category}>
                        <InputLabel>Select Category</InputLabel>
                        <Select
                            label="Select Category"
                            {...register("category", {
                                required: "Category is required",
                            })}
                            defaultValue="">
                            <MenuItem value="" disabled>
                                Select a category
                            </MenuItem>
                            {categories.map((category) => (
                                <MenuItem
                                    key={category.name}
                                    value={category.name}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.category && (
                            <Typography variant="caption" color="error">
                                {errors.category.message}
                            </Typography>
                        )}
                    </FormControl>

                    {/* Community Rules */}
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
                                {...register(`rule${index}`, {
                                    required: `Rule ${index} is required`,
                                })}
                                error={!!errors[`rule${index}`]}
                                helperText={errors[`rule${index}`]?.message}
                            />
                        ))}
                    </Box>

                    {/* Community Visions */}
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
                                {...register(`vision${index}`, {
                                    required: `Vision ${index} is required`,
                                })}
                                error={!!errors[`vision${index}`]}
                                helperText={errors[`vision${index}`]?.message}
                            />
                        ))}
                    </Box>

                    {/* Image Uploads with Preview */}
                    <Box sx={{ display: "flex", gap: 3 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Community Banner Image
                            </Typography>
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
                                    Upload Banner
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        {...register("image1", {
                                            required:
                                                "Banner image is required",
                                            onChange: (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader =
                                                        new FileReader();
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
                                {watch("bannerPreview") && (
                                    <Box
                                        sx={{
                                            mt: 1,
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: 1,
                                            overflow: "hidden",
                                            maxHeight: 200,
                                        }}>
                                        <img
                                            src={watch("bannerPreview")}
                                            alt="Banner preview"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </Box>
                                )}
                                {errors.image1 && (
                                    <Typography variant="caption" color="error">
                                        {errors.image1.message}
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Community Logo
                            </Typography>
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
                                    Upload Logo
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        {...register("image2", {
                                            required: "Logo is required",
                                            onChange: (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader =
                                                        new FileReader();
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
                                {watch("logoPreview") && (
                                    <Box
                                        sx={{
                                            mt: 1,
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: "50%",
                                            width: 100,
                                            height: 100,
                                            overflow: "hidden",
                                            alignSelf: "center",
                                        }}>
                                        <img
                                            src={watch("logoPreview")}
                                            alt="Logo preview"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </Box>
                                )}
                                {errors.image2 && (
                                    <Typography variant="caption" color="error">
                                        {errors.image2.message}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    {/* Submit Button */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 3,
                        }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="info"
                            disabled={isSubmitting}
                            sx={{
                                px: 6,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: "1rem",
                            }}>
                            {isSubmitting ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Create Community"
                            )}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default CreateCommunity;
