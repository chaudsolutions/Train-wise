import { useState } from "react";
import {
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Container,
    Paper,
    Box,
    TextField,
    Avatar,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    useTheme,
    IconButton,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { serVer, useToken } from "../../Hooks/useVariable";
import {
    useAdminAnalyticsData,
    useCategoriesData,
} from "../../Hooks/useQueryFetch/useQueryData";
import { Link } from "react-router-dom";

const AdminCreateCommunity = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [user, setUser] = useState(null);
    const [community, setCommunity] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const theme = useTheme();
    const { token } = useToken();
    const { categories, isCategoriesLoading } = useCategoriesData();
    const { refetchAnalyticsData } = useAdminAnalyticsData();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm();

    const steps = ["Community Details", "Assign Owner", "Complete"];

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
        setUser(null);
    };

    const handleSearchUser = async (email) => {
        if (!email) {
            toast.error("Please enter an email address");
            return;
        }

        setUser(null); // Reset user before searching

        try {
            setSearchLoading(true);
            const response = await axios.put(
                `${serVer}/admin/find-user-by-email`,
                { email: email.trim().toLowerCase() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data) {
                setUser(response.data);
            } else {
                toast.error("User not found");
            }
        } catch (error) {
            console.error("Error searching for user:", error);
            toast.error("Failed to find user. Please try again.");
        } finally {
            setSearchLoading(false);
        }
    };

    const createCommunityForUser = async () => {
        if (!user) {
            toast.error("Please select a user first");
            return;
        }

        try {
            setFormSubmitting(true);
            const formData = new FormData();

            // Append form values
            const values = watch();
            formData.append("name", values.name);
            formData.append("description", values.description);
            formData.append("subscriptionFee", values.subscriptionFee);
            formData.append("category", values.category);

            // Append rules and visions
            [1, 2, 3].forEach((i) => {
                formData.append(`rules[${i - 1}]`, values[`rule${i}`]);
                formData.append(`visions[${i - 1}]`, values[`vision${i}`]);
            });

            // Append images
            if (values.image1?.[0])
                formData.append("bannerImage", values.image1[0]);
            if (values.image2?.[0]) formData.append("logo", values.image2[0]);

            // Append user ID
            formData.append("userId", user._id);

            // Create community
            const res = await axios.post(
                `${serVer}/admin/create-community-for-user`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            refetchAnalyticsData();

            setCommunity(res.data);

            handleNext();
        } catch (error) {
            console.error("Error creating community:", error);
            toast.error("Failed to create community. Please try again.");
        } finally {
            setFormSubmitting(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <CommunityForm
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        categories={categories}
                        isLoading={isCategoriesLoading}
                    />
                );
            case 1:
                return (
                    <AssignUserForm
                        onSearch={handleSearchUser}
                        user={user}
                        isLoading={searchLoading}
                    />
                );
            case 2:
                return <SuccessStep />;
            default:
                return <div>Unknown step</div>;
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
                <Typography
                    variant="h4"
                    align="center"
                    fontSize={{ xs: "1.3rem", md: "2rem" }}
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        mb: 4,
                    }}>
                    Create Community as Admin
                </Typography>

                <Stepper
                    activeStep={activeStep}
                    alternativeLabel
                    sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {activeStep === steps.length ? (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Community Created Successfully!
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleReset}
                            sx={{ mt: 3 }}>
                            Create Another Community
                        </Button>
                    </Box>
                ) : (
                    <>
                        <Box sx={{ mb: 4 }}>
                            {renderStepContent(activeStep)}
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                variant="outlined">
                                Back
                            </Button>

                            {activeStep === 0 && (
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit(handleNext)}
                                    disabled={isCategoriesLoading}>
                                    Assign Owner
                                </Button>
                            )}

                            {activeStep === 1 && (
                                <Button
                                    variant="contained"
                                    onClick={createCommunityForUser}
                                    disabled={!user || formSubmitting}>
                                    {formSubmitting ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        "Create Community"
                                    )}
                                </Button>
                            )}

                            {activeStep === 2 && (
                                <Button
                                    variant="contained"
                                    onClick={handleReset}>
                                    Create Another
                                </Button>
                            )}
                        </Box>
                    </>
                )}
            </Paper>
        </Container>
    );
};

// Step 1: Community Details Form
const CommunityForm = ({
    register,
    errors,
    watch,
    setValue,
    categories,
    isLoading,
}) => {
    const theme = useTheme();

    return (
        <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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

            <TextField
                label="Monthly Subscription Fee"
                variant="outlined"
                fullWidth
                type="number"
                placeholder="0 if free"
                {...register("subscriptionFee", {
                    required: "Subscription Fee is required",
                    min: { value: 0, message: "Fee cannot be negative" },
                })}
                error={!!errors.subscriptionFee}
                helperText={errors.subscriptionFee?.message}
            />

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
                    {isLoading ? (
                        <MenuItem>Loading categories...</MenuItem>
                    ) : (
                        categories.map((category) => (
                            <MenuItem key={category.name} value={category.name}>
                                {category.name}
                            </MenuItem>
                        ))
                    )}
                </Select>
                {errors.category && (
                    <Typography variant="caption" color="error">
                        {errors.category.message}
                    </Typography>
                )}
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
                        {...register(`rule${index}`, {
                            required: `Rule ${index} is required`,
                        })}
                        error={!!errors[`rule${index}`]}
                        helperText={errors[`rule${index}`]?.message}
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
                        {...register(`vision${index}`, {
                            required: `Vision ${index} is required`,
                        })}
                        error={!!errors[`vision${index}`]}
                        helperText={errors[`vision${index}`]?.message}
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
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}>
                        <Button variant="outlined" component="label" fullWidth>
                            Upload Banner
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                {...register("image1", {
                                    required: "Banner image is required",
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
                        <Button variant="outlined" component="label" fullWidth>
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
        </Box>
    );
};

// Step 2: Assign User Form
const AssignUserForm = ({ onSearch, user, isLoading }) => {
    const [email, setEmail] = useState("");

    const handleSearch = () => {
        onSearch(email);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="h6" gutterBottom>
                Assign Community Owner
            </Typography>

            <TextField
                label="User Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={handleSearch}
                                disabled={isLoading}
                                edge="end">
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            {isLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {user && !isLoading && (
                <Card sx={{ mt: 2 }}>
                    <CardContent>
                        <Grid
                            container
                            direction="column"
                            alignItems="center"
                            justifyContent="center"
                            spacing={2}
                            p={2}>
                            <Grid>
                                <Avatar
                                    src={user.avatar}
                                    sx={{ width: 64, height: 64 }}>
                                    {user.name?.charAt(0) || "U"}
                                </Avatar>
                            </Grid>
                            <Grid>
                                <Typography variant="h6">
                                    {user.name}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="textSecondary">
                                    {user.email}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {!user && !isLoading && (
                <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mt: 2, textAlign: "center" }}>
                    Enter a user&apos;s email and click search to find them
                </Typography>
            )}
        </Box>
    );
};

// Step 3: Success Step
const SuccessStep = ({ community }) => {
    return (
        <Box sx={{ textAlign: "center", py: 4 }}>
            <CheckCircleIcon
                sx={{ fontSize: 80, color: "success.main", mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
                Community Created Successfully!
            </Typography>
            <Typography variant="body1" color="textSecondary">
                The community has been assigned to the selected user.
            </Typography>

            <Button
                variant="contained"
                color="success"
                component={Link}
                to={`/admin/dashboard/community/${community.id}`}
                sx={{ mt: 4 }}>
                View Community
            </Button>
        </Box>
    );
};

export default AdminCreateCommunity;
