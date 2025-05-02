import { useState } from "react";
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useTheme,
    CircularProgress,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import {
    ArrowBack as ArrowBackIcon,
    Lock as LockIcon,
    People as PeopleIcon,
    Tag as TagIcon,
    Person as PersonIcon,
    Star as StarIcon,
    FiberManualRecord as DotIcon,
    Category,
} from "@mui/icons-material";
import useResponsive from "../../Hooks/useResponsive";
import { useReactRouter } from "../../Hooks/useReactRouter";
import { useAuthContext } from "../../Context/AuthContext";
import Auth from "../../Custom/Auth/Auth";
import { redirectSessionKey } from "../../Hooks/useVariable";
import {
    useCommunityByIdData,
    useUserData,
} from "../../Hooks/useQueryFetch/useQueryData";
import PageLoader from "../../Animations/PageLoader";
import { loadStripe } from "@stripe/stripe-js";
import { useCommunityActions } from "../../Hooks/useCommunityActions";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentDialog } from "../../Custom/payment/PaymentDialog";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

const CommunityView = () => {
    const [authOpen, setAuthOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const { joinCommunity, deleteCommunity, loading } = useCommunityActions();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const { user } = useAuthContext();

    const { useParams, useNavigate } = useReactRouter();

    const navigate = useNavigate();

    const { communityId } = useParams();

    const { isMobile } = useResponsive();

    const { community, isCommunityLoading, refetchCommunity } =
        useCommunityByIdData({
            id: communityId,
        });

    const { userData, isUserDataLoading } = useUserData();

    const {
        name,
        description,
        category,
        role,
        rules,
        visions,
        subscriptionFee,
        bannerImage,
        members,
        createdBy,
    } = community || {};

    const { _id } = userData || {};

    // check if user is part of community
    const isUserMember =
        members?.some((member) => member.userId._id === _id) ||
        createdBy === _id;
    const isCreator = createdBy?._id === _id;
    const isAdmin = role === "admin";

    const handleJoinCommunity = async () => {
        if (!user) {
            sessionStorage.setItem(redirectSessionKey, location.pathname);
            return setAuthOpen(true);
        }

        if (subscriptionFee === 0 || isUserMember || isCreator || isAdmin) {
            const success = await joinCommunity(communityId);
            if (success) {
                refetchCommunity();
                navigate(`/community/access/${communityId}`);
            }
        } else {
            setPaymentDialogOpen(true);
        }
    };

    const handlePaymentSuccess = async (subscriptionId) => {
        const success = await joinCommunity(communityId, subscriptionId);
        if (success) {
            refetchCommunity();
            navigate(`/community/access/${communityId}`);
        }
    };

    if (isCommunityLoading || isUserDataLoading) {
        return <PageLoader />;
    }

    return (
        <Elements stripe={stripePromise}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                    gap={4}>
                    {/* Main Content */}
                    <Box flex={3}>
                        <Card sx={{ mb: 3, borderRadius: 4 }}>
                            <CardMedia
                                component="img"
                                height={isMobile ? 300 : 400}
                                image={bannerImage}
                                alt={`${name} banner`}
                            />
                            <CardContent>
                                <Typography
                                    variant="h5"
                                    gutterBottom
                                    fontWeight="bold">
                                    About This Community
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    {description}
                                </Typography>

                                <Box
                                    display="flex"
                                    flexWrap="wrap"
                                    gap={1}
                                    mb={3}>
                                    <Chip
                                        icon={<Category />}
                                        label={category}
                                        color="info"
                                        variant="outlined"
                                    />
                                    <Chip
                                        icon={<LockIcon />}
                                        label="Private"
                                        color="info"
                                        variant="outlined"
                                    />
                                    <Chip
                                        icon={<PeopleIcon />}
                                        label={`${
                                            members?.length || 0
                                        } members`}
                                        color="info"
                                        variant="outlined"
                                    />
                                    <Chip
                                        icon={<TagIcon />}
                                        label={
                                            subscriptionFee
                                                ? `$${subscriptionFee}/Month`
                                                : "Free"
                                        }
                                        color="info"
                                        variant="outlined"
                                    />
                                    <Chip
                                        icon={<PersonIcon />}
                                        label={
                                            isCreator ? "You" : createdBy?.name
                                        }
                                        color="info"
                                        variant="outlined"
                                        deleteIcon={<StarIcon color="info" />}
                                        onDelete={() => {}}
                                    />
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="info"
                                    onClick={handleJoinCommunity}
                                    disabled={loading}
                                    sx={{
                                        py: 1,
                                        borderRadius: 2,
                                        fontWeight: 600,
                                        fontSize: "1rem",
                                    }}>
                                    {loading ? (
                                        <CircularProgress
                                            size={24}
                                            color="inherit"
                                        />
                                    ) : isUserMember || isCreator || isAdmin ? (
                                        "Explore Group"
                                    ) : (
                                        "Join Group"
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Community Rules */}
                        <Card sx={{ mb: 3, borderRadius: 4 }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    fontWeight="bold">
                                    Community Rules
                                </Typography>
                                <List>
                                    {rules?.map((rule, index) => (
                                        <ListItem key={index} sx={{ py: 0.5 }}>
                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                <DotIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={`${
                                                    index + 1
                                                }. ${rule}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>

                        {/* Reasons to Join */}
                        <Card sx={{ borderRadius: 4 }}>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    fontWeight="bold">
                                    Reasons to Join
                                </Typography>
                                <List>
                                    {visions?.map((vision, index) => (
                                        <ListItem key={index} sx={{ py: 0.5 }}>
                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                <DotIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText primary={vision} />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>

                        {/* Delete Button (for creator) */}
                        {isCreator && (
                            <Box mt={3} display="flex" justifyContent="center">
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setDeleteConfirmOpen(true)}
                                    disabled={loading}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontWeight: 600,
                                    }}>
                                    Delete Community
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* Sidebar (Desktop only) */}
                    {!isMobile && (
                        <Box flex={1}>
                            <Card sx={{ borderRadius: 4 }}>
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        fontWeight="bold">
                                        Community Details
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        paragraph>
                                        Click the Join Group button to join this
                                        community
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        paragraph>
                                        This group is created by{" "}
                                        {createdBy?.name}
                                    </Typography>
                                    <Chip
                                        label={category}
                                        color="info"
                                        sx={{ mt: 2 }}
                                    />
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </Box>

                {/* Auth Dialog */}
                <Auth authContain={authOpen} setAuthContain={setAuthOpen} />

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteConfirmOpen}
                    onClose={() => setDeleteConfirmOpen(false)}>
                    <DialogTitle>Delete Community</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this community? This
                            action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => deleteCommunity(communityId)}
                            color="error"
                            variant="contained"
                            disabled={loading}>
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogActions>
                </Dialog>

                <PaymentDialog
                    open={paymentDialogOpen}
                    onClose={() => setPaymentDialogOpen(false)}
                    amount={subscriptionFee}
                    communityId={communityId}
                    onPaymentSuccess={handlePaymentSuccess}
                    type="community_subscription"
                />
            </Container>
        </Elements>
    );
};

export const CommunityName = () => {
    const theme = useTheme();

    const { useNavigate } = useReactRouter();

    const { isMobile } = useResponsive();

    const pathnameArr = location.pathname.split("/");
    const communityId = pathnameArr[pathnameArr?.length - 1];

    const { community, isCommunityLoading } = useCommunityByIdData({
        id: communityId,
    });

    const { name, logo } = community || {};

    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
            }}>
            {/* Back Button */}
            <IconButton
                onClick={goBack}
                size="small"
                sx={{
                    color: theme.palette.info.main,
                    "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                    },
                }}>
                <ArrowBackIcon fontSize="small" />
            </IconButton>

            {/* Community Logo and Name */}
            {isCommunityLoading ? (
                <CircularProgress size={15} color="info" />
            ) : (
                <>
                    <Avatar
                        src={logo}
                        alt="community logo"
                        sx={{
                            width: 30,
                            height: 30,
                            border: `1px solid ${theme.palette.divider}`,
                        }}
                    />
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            fontSize: ".9rem",
                            color: theme.palette.text.primary,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: isMobile ? "150px" : "300px",
                        }}>
                        {name}
                    </Typography>
                </>
            )}
        </Box>
    );
};

export default CommunityView;
