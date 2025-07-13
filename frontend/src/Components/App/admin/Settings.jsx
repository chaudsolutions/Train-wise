import { useForm } from "react-hook-form";
import {
    Box,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Paper,
    Grid,
    FormHelperText,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-hot-toast";
import { serVer, useToken } from "../../Hooks/useVariable";
import { useAdminAnalyticsData } from "../../Hooks/useQueryFetch/useQueryData";
import PageLoader from "../../Animations/PageLoader";
import { useEffect } from "react";

const Settings = () => {
    const { analyticsData, isAnalyticsDataLoading, refetchAnalyticsData } =
        useAdminAnalyticsData();
    const { settings } = analyticsData || {};

    const { token } = useToken();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        // Initialize with default values
        defaultValues: {
            communityCreationFee: settings?.communityCreationFee || 0,
            withdrawalLimit: settings?.withdrawalLimit || 0,
            storagePrice: settings?.storagePrice || 0,
        },
    });

    // Add this useEffect to update form values when adminData loads
    useEffect(() => {
        if (settings) {
            reset({
                communityCreationFee: settings?.communityCreationFee,
                withdrawalLimit: settings?.withdrawalLimit,
                storagePrice: settings?.storagePrice,
            });
        }
    }, [settings, reset]);

    const onSubmit = async (data) => {
        try {
            // Only send changed values
            const payload = {
                ...(data.communityCreationFee !==
                    settings?.communityCreationFee && {
                    communityCreationFee: data.communityCreationFee * 100,
                }),
                ...(data.withdrawalLimit !== settings?.withdrawalLimit && {
                    withdrawalLimit: data.withdrawalLimit,
                }),
                ...(data.storagePrice !== settings?.storagePrice && {
                    storagePrice: data.storagePrice * 100,
                }),
            };

            if (Object.keys(payload).length === 0) {
                return toast.error("No changes detected");
            }

            const res = await axios.put(`${serVer}/admin/settings`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.success(res.data);

            refetchAnalyticsData();
        } catch (error) {
            toast.error(error.response?.data || "Update failed");
        }
    };

    if (isAnalyticsDataLoading) {
        return <PageLoader />;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Admin Settings
            </Typography>

            <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Community Creation Fee"
                                type="number"
                                {...register("communityCreationFee", {
                                    min: { value: 0, message: "Must be ≥ 0" },
                                })}
                                error={!!errors.communityCreationFee}
                                InputProps={{
                                    startAdornment: "$",
                                }}
                            />
                            <FormHelperText error>
                                {errors.communityCreationFee?.message}
                            </FormHelperText>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Withdrawal Limit"
                                type="number"
                                {...register("withdrawalLimit", {
                                    min: { value: 1, message: "Minimum 1" },
                                })}
                                error={!!errors.withdrawalLimit}
                                InputProps={{
                                    endAdornment: "USD",
                                }}
                            />
                            <FormHelperText error>
                                {errors.withdrawalLimit?.message}
                            </FormHelperText>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="5GB storage price"
                                type="number"
                                {...register("storagePrice", {
                                    min: { value: 1, message: "Must be ≥ 1" },
                                })}
                                error={!!errors.storagePrice}
                                InputProps={{
                                    startAdornment: "$",
                                }}
                            />
                            <FormHelperText error>
                                {errors.storagePrice?.message}
                            </FormHelperText>
                        </Grid>

                        <Grid size={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={isSubmitting}
                                startIcon={
                                    isSubmitting && (
                                        <CircularProgress
                                            size={24}
                                            color="inherit"
                                        />
                                    )
                                }
                                sx={{ minWidth: 120 }}>
                                {isSubmitting ? <>Saving...</> : "Save Changes"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default Settings;
