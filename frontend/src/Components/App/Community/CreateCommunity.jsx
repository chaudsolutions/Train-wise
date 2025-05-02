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
import { serVer, useToken } from "../../Hooks/useVariable";
import {
    useCategoriesData,
    useCommunitiesData,
    useUserData,
} from "../../Hooks/useQueryFetch/useQueryData";
import PageLoader from "../../Animations/PageLoader";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

const PaymentForm = ({
    formData,
    token,
    createCommunity,
    theme,
    onSuccess,
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    const handlePaymentSubmit = async () => {
        if (!formData || !stripe || !elements) {
            toast.error("Stripe is not initialized or form data is missing");
            return;
        }
        setPaymentProcessing(true);
        try {
            const paymentResponse = await axios.post(
                `${serVer}/payment/create-payment-intent`,
                { amount: 100, type: "community_creation" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const { clientSecret } = paymentResponse.data;

            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: { name: "Community Creator" },
                    },
                }
            );

            if (error) throw error;

            if (paymentIntent.status === "succeeded") {
                await createCommunity({
                    ...formData,
                    paymentId: paymentIntent.id,
                });
                onSuccess(); // Close PaymentForm after success
            }
        } catch (error) {
            toast.error(`Payment failed: ${error.message}`);
            toast.error("Payment Failed");
        } finally {
            setPaymentProcessing(false);
        }
    };

    return (
        <Box
            sx={{
                mt: 4,
                p: 3,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
            }}>
            <Typography variant="h6" gutterBottom>
                Payment Information
            </Typography>
            <CardElement
                options={{
                    style: {
                        base: {
                            fontSize: "16px",
                            color: theme.palette.text.primary,
                            "::placeholder": {
                                color: theme.palette.text.secondary,
                            },
                        },
                    },
                }}
            />
            <Button
                variant="contained"
                color="info"
                disabled={paymentProcessing}
                onClick={handlePaymentSubmit}
                sx={{ mt: 3 }}>
                {paymentProcessing ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    "Pay $100 & Create Community"
                )}
            </Button>
        </Box>
    );
};

const CreateCommunity = () => {
    const theme = useTheme();
    const { useNavigate } = useReactRouter();
    const { token } = useToken();
    const { isCommunitiesLoading, refetchCommunities } = useCommunitiesData();
    const { categories, isCategoriesLoading } = useCategoriesData();
    const { userData, isUserDataLoading } = useUserData();

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
    const [showPayment, setShowPayment] = useState(false);
    const [formData, setFormData] = useState(null);

    const userRole = userData?.role; // "admin", "creator", or "user"

    const PaymentBenefitsCard = () => (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                mb: 4,
                backgroundColor: theme.palette.background.paper,
                borderLeft: `4px solid ${theme.palette.info.main}`,
            }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Why Create a Community?
            </Typography>
            <Box
                component="ul"
                sx={{
                    pl: 2,
                    "& li": {
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                    },
                }}>
                <li>🎓 Monetize your expertise</li>
                <li>🤝 Build an engaged community</li>
                <li>💵 Earn $100/month per active member</li>
                <li>📈 Access detailed analytics</li>
                <li>🔒 Secure payment processing</li>
            </Box>
            <Typography variant="body1" sx={{ mt: 2, fontWeight: 500 }}>
                One-time setup fee for regular users:{" "}
                <Box
                    component="span"
                    sx={{ color: "success.main", fontSize: "1.2rem" }}>
                    $100
                </Box>
                {userRole === "admin" || userRole === "creator" ? (
                    <Box component="span" sx={{ ml: 1, color: "info.main" }}>
                        (Waived for {userRole}s)
                    </Box>
                ) : null}
            </Typography>
        </Paper>
    );

    const createCommunity = async (data) => {
        try {
            const rules = [data.rule1, data.rule2, data.rule3];
            const visions = [data.vision1, data.vision2, data.vision3];

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
            formData.append("bannerImage", data.image1[0]);
            formData.append("logo", data.image2[0]);
            if (data.paymentId) {
                formData.append("paymentId", data.paymentId);
            }

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
            navigate(`/community/${communityId}`);
            toast.success("Community created successfully");
        } catch (error) {
            console.error("Error creating community:", error);
            toast.error("Failed to create community. Please try again.");
        }
    };

    const onSubmit = async (data) => {
        setFormData(data);
        if (userRole === "admin" || userRole === "creator") {
            // Admins and creators create directly without payment
            await createCommunity(data);
        } else {
            // Regular users proceed to payment
            setShowPayment(true);
        }
    };

    if (isCommunitiesLoading || isCategoriesLoading || isUserDataLoading) {
        return <PageLoader />;
    }

    return (
        <Elements stripe={stripePromise}>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
                    <PaymentBenefitsCard />
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
                                {isCategoriesLoading ? (
                                    <MenuItem>Loading...</MenuItem>
                                ) : (
                                    categories.map((category) => (
                                        <MenuItem
                                            key={category.name}
                                            value={category.name}>
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
                                    helperText={
                                        errors[`vision${index}`]?.message
                                    }
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
                                                    const file =
                                                        e.target.files[0];
                                                    if (file) {
                                                        const reader =
                                                            new FileReader();
                                                        reader.onload = (
                                                            event
                                                        ) => {
                                                            setValue(
                                                                "bannerPreview",
                                                                event.target
                                                                    .result
                                                            );
                                                        };
                                                        reader.readAsDataURL(
                                                            file
                                                        );
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
                                        <Typography
                                            variant="caption"
                                            color="error">
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
                                                    const file =
                                                        e.target.files[0];
                                                    if (file) {
                                                        const reader =
                                                            new FileReader();
                                                        reader.onload = (
                                                            event
                                                        ) => {
                                                            setValue(
                                                                "logoPreview",
                                                                event.target
                                                                    .result
                                                            );
                                                        };
                                                        reader.readAsDataURL(
                                                            file
                                                        );
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
                                        <Typography
                                            variant="caption"
                                            color="error">
                                            {errors.image2.message}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </Box>
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
                                    <CircularProgress
                                        size={24}
                                        color="inherit"
                                    />
                                ) : userRole === "admin" ||
                                  userRole === "creator" ? (
                                    "Create Community"
                                ) : (
                                    "Review & Continue to Payment"
                                )}
                            </Button>
                        </Box>
                    </Box>
                    {showPayment && userRole === "user" && (
                        <PaymentForm
                            formData={formData}
                            token={token}
                            createCommunity={createCommunity}
                            theme={theme}
                            onSuccess={() => setShowPayment(false)}
                        />
                    )}
                </Paper>
            </Container>
        </Elements>
    );
};

export default CreateCommunity;
