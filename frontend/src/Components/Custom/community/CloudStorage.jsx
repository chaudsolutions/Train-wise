import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Typography,
    useTheme,
} from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import UpgradeIcon from "@mui/icons-material/CloudUpload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoneyIcon from "@mui/icons-material/AttachMoney";
import CloseIcon from "@mui/icons-material/Close";
import SuccessIcon from "@mui/icons-material/CheckCircle";
import { useSettingsData } from "../../Hooks/useQueryFetch/useQueryData";
import { useState } from "react";
import { serVer } from "../../Hooks/useVariable";
import toast from "react-hot-toast";
import { getToken } from "../../Hooks/useFetch";
import axios from "axios";
import { PaymentDialog } from "../payment/PaymentDialog";

const CloudStorage = ({
    cloudStorageLimit,
    cloudStorageUsed,
    communityId,
    refetchCommunity,
}) => {
    const theme = useTheme();

    const { settingsData, isSettingsLoading } = useSettingsData();

    const { storagePrice } = settingsData || {};

    // Create storage plans based on settings
    const storagePlans = [5, 10, 15].map((gb, index) => ({
        id: index + 1,
        gb,
        price: (index + 1) * (storagePrice || 200), // Default to $5 if not set
    }));

    const [upgradeLoading, setUpgradeLoading] = useState(false);
    const [openStorageDialog, setOpenStorageDialog] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(storagePlans[0]); // Default to 5GB
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentDialog, setPaymentDialog] = useState(false);

    const storagePercentage = (cloudStorageUsed / cloudStorageLimit) * 100;

    const handleStorageUpgrade = async (paidStorage, paymentId) => {
        setUpgradeLoading(true);
        const token = getToken();

        try {
            // Update storage in backend
            const res = await axios.put(
                `${serVer}/creator/storage-upgrade/${communityId}`,
                {
                    storage: paidStorage.gb,
                    price: paidStorage.price,
                    paymentId,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(res.data);
            setPaymentSuccess(true);
            refetchCommunity();

            // Close dialog after success
            setTimeout(() => {
                setOpenStorageDialog(false);
                setPaymentSuccess(false);
            }, 2000);
        } catch (error) {
            toast.error(error?.response?.data || "Upgrade failed");
        } finally {
            setUpgradeLoading(false);
        }
    };

    const handlePlanChange = (e) => {
        const selectedId = e.target.value;
        const plan = storagePlans.find((p) => p.id === selectedId);
        setSelectedPlan(plan);
    };

    const getStorageColor = () => {
        if (storagePercentage > 90) return "error";
        if (storagePercentage > 75) return "warning";
        return "primary";
    };

    const formatStorageSize = (size) => {
        if (size < 1) {
            return `${(size * 1024).toFixed(1) || 0} MB`;
        } else {
            return `${size.toFixed(1) || 0} GB`;
        }
    };

    return (
        <>
            <Grid size={{ xs: 12, md: 6 }}>
                {/* Storage Card */}
                <Paper
                    sx={{
                        p: 2.5,
                        height: "100%",
                        borderRadius: 3,
                        borderLeft: `4px solid ${theme.palette.warning.main}`,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        background:
                            theme.palette.mode === "dark"
                                ? "linear-gradient(45deg, #e65100, #f57c00)"
                                : "linear-gradient(45deg, #fff3e0, #ffe0b2)",
                    }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                        <StorageIcon fontSize="large" color="warning" />
                        <Typography variant="h6" fontWeight="bold">
                            Cloud Storage
                        </Typography>
                    </Box>

                    <Box mb={2}>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            mb={1}>
                            <Typography variant="body2" fontWeight="bold">
                                {formatStorageSize(cloudStorageUsed)} of{" "}
                                {formatStorageSize(cloudStorageLimit)} used
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {storagePercentage?.toFixed(0)}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={storagePercentage}
                            color={getStorageColor()}
                            sx={{ height: 10, borderRadius: 5 }}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => setOpenStorageDialog(true)}
                        endIcon={<UpgradeIcon />}
                        fullWidth
                        disabled={isSettingsLoading}
                        startIcon={
                            isSettingsLoading && (
                                <CircularProgress size={20} color="inherit" />
                            )
                        }
                        sx={{
                            borderRadius: 2,
                            py: 1.5,
                            fontWeight: "bold",
                            color: theme.palette.getContrastText(
                                theme.palette.warning.main
                            ),
                        }}>
                        Upgrade Storage
                    </Button>
                </Paper>
            </Grid>

            {/* Storage Upgrade Dialog */}
            <Dialog
                open={openStorageDialog}
                onClose={() => !upgradeLoading && setOpenStorageDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        overflow: "visible",
                    },
                }}>
                <DialogTitle sx={{ position: "relative" }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <StorageIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                            Add Cloud Storage
                        </Typography>
                    </Box>

                    {!paymentSuccess && (
                        <IconButton
                            aria-label="close"
                            onClick={() => setOpenStorageDialog(false)}
                            disabled={upgradeLoading}
                            sx={{
                                position: "absolute",
                                right: 16,
                                top: 16,
                                color: theme.palette.grey[500],
                            }}>
                            <CloseIcon />
                        </IconButton>
                    )}
                </DialogTitle>

                <DialogContent dividers>
                    {paymentSuccess ? (
                        <Box textAlign="center" py={4}>
                            <SuccessIcon
                                sx={{
                                    fontSize: 80,
                                    color: theme.palette.success.main,
                                    mb: 2,
                                }}
                            />
                            <Typography variant="h5" gutterBottom>
                                Upgrade Successful!
                            </Typography>
                            <Typography color="text.secondary">
                                Your storage has been upgraded to{" "}
                                {selectedPlan.gb} GB
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Typography variant="body1" mb={3}>
                                Select a storage plan for your community:
                            </Typography>

                            <FormControl
                                fullWidth
                                variant="outlined"
                                sx={{ mb: 3 }}>
                                <InputLabel>Storage Plan</InputLabel>
                                <Select
                                    value={selectedPlan.id}
                                    onChange={handlePlanChange}
                                    label="Storage Plan"
                                    disabled={isSettingsLoading}>
                                    {storagePlans.map((plan) => (
                                        <MenuItem key={plan.id} value={plan.id}>
                                            <Box
                                                display="flex"
                                                justifyContent="space-between"
                                                width="100%">
                                                <Box>
                                                    <Typography fontWeight="bold">
                                                        {plan.gb} GB
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography fontWeight="bold">
                                                        $
                                                        {plan.price.toFixed(2) /
                                                            100}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Paper
                                variant="outlined"
                                sx={{ p: 2, borderRadius: 2, mb: 2 }}>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                    gutterBottom>
                                    Plan Details
                                </Typography>
                                <List dense>
                                    <ListItem>
                                        <ListItemText
                                            primary="Storage Capacity"
                                            secondary={`${selectedPlan.gb} GB`}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Cost"
                                            secondary={`$${
                                                selectedPlan.price.toFixed(2) /
                                                100
                                            }`}
                                        />
                                    </ListItem>
                                </List>
                            </Paper>

                            <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                mt={1}>
                                <Typography variant="body2">
                                    Current storage: {cloudStorageLimit} GB
                                </Typography>
                                <ExpandMoreIcon color="action" />
                                <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color="primary">
                                    {cloudStorageLimit + selectedPlan.gb} GB
                                </Typography>
                            </Box>
                        </>
                    )}
                </DialogContent>

                {!paymentSuccess && (
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setOpenStorageDialog(false)}
                            disabled={upgradeLoading}
                            sx={{ borderRadius: 2 }}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setPaymentDialog(true)}
                            disabled={
                                upgradeLoading ||
                                selectedPlan.storage <= cloudStorageLimit
                            }
                            startIcon={
                                upgradeLoading ? (
                                    <CircularProgress
                                        size={20}
                                        color="inherit"
                                    />
                                ) : (
                                    <MoneyIcon />
                                )
                            }
                            sx={{ borderRadius: 2, fontWeight: "bold" }}>
                            {upgradeLoading ? "Processing..." : "Upgrade Now"}
                        </Button>
                    </DialogActions>
                )}
            </Dialog>

            <PaymentDialog
                open={paymentDialog}
                onClose={() => setPaymentDialog(false)}
                amount={selectedPlan.price / 100}
                data={selectedPlan}
                onPaymentSuccess={handleStorageUpgrade}
                type="storage_purchase"
            />
        </>
    );
};

export default CloudStorage;
