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
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Grid,
    Avatar,
    Divider,
    Stack,
    useTheme,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PeopleIcon from "@mui/icons-material/People";
import TagIcon from "@mui/icons-material/Tag";
import PersonIcon from "@mui/icons-material/Person";
import StarIcon from "@mui/icons-material/Star";
import DotIcon from "@mui/icons-material/FiberManualRecord";
import CategoryIcon from "@mui/icons-material/Category";
import ShareIcon from "@mui/icons-material/Share";
import ExploreIcon from "@mui/icons-material/Explore";
import HomeIcon from "@mui/icons-material/Home";
import CheckIcon from "@mui/icons-material/CheckCircle";
import useResponsive from "../../Hooks/useResponsive";
import { useReactRouter } from "../../Hooks/useReactRouter";
import { useAuthContext } from "../../Context/AuthContext";
import Auth from "../../Custom/Auth/Auth";
import { redirectSessionKey, stripePromise } from "../../Hooks/useVariable";
import {
    useCommunityByIdData,
    useUserData,
} from "../../Hooks/useQueryFetch/useQueryData";
import PageLoader from "../../Animations/PageLoader";
import { useCommunityActions } from "../../Hooks/useCommunityActions";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentDialog } from "../../Custom/payment/PaymentDialog";
import SocialShareDrawer from "../../Custom/Buttons/SocialShareDrawer";

const CommunityView = () => {
    const theme = useTheme();
    const [authOpen, setAuthOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const { joinCommunity, loading } = useCommunityActions();
    const [selectShare, setSelectShare] = useState(false);

    const { isMobile } = useResponsive();

    const { user } = useAuthContext();

    const { useParams, useNavigate } = useReactRouter();

    const navigate = useNavigate();

    const { communityId } = useParams();

    const { community, isCommunityLoading, refetchCommunity } =
        useCommunityByIdData({
            id: communityId,
        });

    const { userData, isUserDataLoading } = useUserData();

    const {
        name,
        description,
        category,
        rules,
        visions,
        subscriptionFee,
        bannerImage,
        logo,
        members,
        createdBy,
        creatorName,
        canExplore,
    } = community || {};

    const { _id, role } = userData || {};

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

        if (
            subscriptionFee === 0 ||
            isUserMember ||
            isCreator ||
            isAdmin ||
            !canExplore
        ) {
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

    const communityUrl = `${window.location.origin}/community/${community?._id}`;

    if (isCommunityLoading || isUserDataLoading) {
        return <PageLoader />;
    }

    return (
        <Elements stripe={stripePromise}>
            <Box
                sx={{
                    bgcolor: theme.palette.background.default,
                    minHeight: "100vh",
                }}>
                {/* Hero Banner */}
                <Box
                    sx={{
                        position: "relative",
                        height: 400,
                        overflow: "hidden",
                        backgroundColor: theme.palette.primary.dark,
                    }}>
                    {bannerImage ? (
                        <CardMedia
                            component="img"
                            height="100%"
                            width="100%"
                            image={bannerImage}
                            alt={`${name} banner`}
                            sx={{ objectFit: "cover" }}
                        />
                    ) : (
                        <Box
                            sx={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: theme.palette.primary.main,
                                backgroundImage:
                                    "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%)",
                            }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    color: "white",
                                    fontWeight: 700,
                                    textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                                }}>
                                {name}
                            </Typography>
                        </Box>
                    )}
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: "rgba(0,0,0,0.8)",
                            py: 2,
                            px: 3,
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            textAlign: "center",
                        }}>
                        <Container maxWidth="lg">
                            <Typography
                                variant="h3"
                                fontSize="2rem"
                                sx={{
                                    color: "white",
                                    fontWeight: 700,
                                    mb: 1,
                                }}>
                                {name}
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    color: "rgba(255,255,255,0.9)",
                                    fontWeight: 500,
                                }}>
                                {description}
                            </Typography>
                        </Container>
                    </Box>
                </Box>

                <Container maxWidth="lg" sx={{ py: 4, position: "relative" }}>
                    {/* Floating Action Buttons */}
                    <Box
                        sx={{
                            position: "sticky",
                            top: 90,
                            zIndex: 10,
                            mb: 3,
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: 2,
                        }}>
                        <Avatar
                            src={logo}
                            alt={`${name} logo`}
                            sx={{
                                width: 70,
                                height: 70,
                                borderRadius: "50%",
                                boxShadow: theme.shadows[3],
                            }}
                        />
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => setSelectShare(true)}
                            disabled={loading}
                            startIcon={<ShareIcon />}
                            sx={{
                                borderRadius: 50,
                                fontWeight: 600,
                                boxShadow: theme.shadows[4],
                                minWidth: 120,
                            }}>
                            Share
                        </Button>
                        <Button
                            variant="contained"
                            color={
                                isUserMember || isCreator || isAdmin
                                    ? "success"
                                    : "primary"
                            }
                            onClick={handleJoinCommunity}
                            disabled={loading}
                            startIcon={
                                loading ? (
                                    <CircularProgress
                                        size={24}
                                        color="inherit"
                                    />
                                ) : isUserMember || isCreator || isAdmin ? (
                                    <ExploreIcon />
                                ) : (
                                    <HomeIcon />
                                )
                            }
                            sx={{
                                borderRadius: 50,
                                fontWeight: 600,
                                boxShadow: theme.shadows[4],
                                minWidth: 140,
                            }}>
                            {loading
                                ? "Loading..."
                                : isUserMember || isCreator || isAdmin
                                ? `Explore ${isMobile ? "" : "Community"}`
                                : `${isMobile ? "Join" : "Become a Member"}`}
                        </Button>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Main Content */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            {/* Community Details */}
                            <Card
                                sx={{
                                    borderRadius: 4,
                                    mb: 3,
                                    boxShadow: theme.shadows[3],
                                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                                }}>
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        fontWeight="bold"
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            color: theme.palette.primary.dark,
                                        }}>
                                        <CategoryIcon fontSize="small" />
                                        Community Details
                                    </Typography>

                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid size={{ xs: 6, md: 3 }}>
                                            <Box sx={{ textAlign: "center" }}>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary">
                                                    Members
                                                </Typography>
                                                <Typography
                                                    variant="h5"
                                                    fontWeight={700}>
                                                    {members?.length || 0}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 6, md: 3 }}>
                                            <Box sx={{ textAlign: "center" }}>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary">
                                                    Category
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    fontWeight={600}>
                                                    {category}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 6, md: 3 }}>
                                            <Box sx={{ textAlign: "center" }}>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary">
                                                    Access
                                                </Typography>
                                                <Chip
                                                    label={
                                                        subscriptionFee
                                                            ? "Premium"
                                                            : "Free"
                                                    }
                                                    size="small"
                                                    color={
                                                        subscriptionFee
                                                            ? "primary"
                                                            : "success"
                                                    }
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 6, md: 3 }}>
                                            <Box sx={{ textAlign: "center" }}>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary">
                                                    Created By
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    fontWeight={600}>
                                                    {creatorName}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Divider sx={{ my: 3 }} />

                                    <Typography variant="body1" paragraph>
                                        {description}
                                    </Typography>

                                    <Box sx={{ mt: 3 }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary">
                                            Membership Fee:
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                            color={
                                                subscriptionFee
                                                    ? "primary"
                                                    : "success"
                                            }>
                                            {subscriptionFee
                                                ? `$${subscriptionFee}/month`
                                                : "Free to join"}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Community Rules */}
                            <Card
                                sx={{
                                    borderRadius: 4,
                                    mb: 3,
                                    boxShadow: theme.shadows[3],
                                    borderLeft: `4px solid ${theme.palette.warning.main}`,
                                }}>
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        fontWeight="bold"
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            color: theme.palette.warning.dark,
                                        }}>
                                        <LockIcon fontSize="small" />
                                        Community Rules
                                    </Typography>
                                    <List>
                                        {rules?.map((rule, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{ py: 0.5 }}>
                                                <ListItemIcon
                                                    sx={{ minWidth: 32 }}>
                                                    <DotIcon
                                                        fontSize="small"
                                                        color="warning"
                                                    />
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
                            <Card
                                sx={{
                                    borderRadius: 4,
                                    boxShadow: theme.shadows[3],
                                    borderLeft: `4px solid ${theme.palette.success.main}`,
                                }}>
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        fontWeight="bold"
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            color: theme.palette.success.dark,
                                        }}>
                                        <StarIcon fontSize="small" />
                                        Benefits of Joining
                                    </Typography>
                                    <List>
                                        {visions?.map((vision, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{ py: 1 }}>
                                                <ListItemIcon
                                                    sx={{ minWidth: 32 }}>
                                                    <CheckIcon color="success" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={vision}
                                                    primaryTypographyProps={{
                                                        fontWeight: 500,
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Sidebar */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            {/* Creator Info */}
                            <Card
                                sx={{
                                    borderRadius: 4,
                                    mb: 3,
                                    boxShadow: theme.shadows[3],
                                }}>
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        fontWeight="bold"
                                        sx={{
                                            color: theme.palette.primary.dark,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}>
                                        <PersonIcon fontSize="small" />
                                        Community Creator
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                            mt: 2,
                                        }}>
                                        <Avatar
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                bgcolor:
                                                    theme.palette.primary.main,
                                                fontSize: 24,
                                                fontWeight: 700,
                                            }}>
                                            {creatorName?.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography
                                                variant="h6"
                                                fontWeight={600}>
                                                {creatorName}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary">
                                                Community Founder
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Membership Info */}
                            <Card
                                sx={{
                                    borderRadius: 4,
                                    mb: 3,
                                    boxShadow: theme.shadows[3],
                                    bgcolor: theme.palette.primary.light,
                                }}>
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        fontWeight="bold"
                                        sx={{
                                            color: theme.palette.primary
                                                .contrastText,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}>
                                        <PeopleIcon fontSize="small" />
                                        Membership Status
                                    </Typography>
                                    <Box
                                        sx={{
                                            bgcolor: "rgba(255,255,255,0.9)",
                                            p: 2,
                                            borderRadius: 3,
                                            mt: 2,
                                        }}>
                                        {isUserMember ||
                                        isCreator ||
                                        isAdmin ? (
                                            <>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        color: theme.palette
                                                            .success.dark,
                                                    }}>
                                                    <CheckIcon color="success" />
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight={600}>
                                                        You&apos;re a member
                                                    </Typography>
                                                </Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ mt: 1 }}>
                                                    You have full access to this
                                                    community&apos;s content and
                                                    features.
                                                </Typography>
                                            </>
                                        ) : (
                                            <>
                                                <Typography
                                                    variant="body1"
                                                    fontWeight={600}>
                                                    Join to access
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ mt: 1 }}>
                                                    Become a member to
                                                    participate in discussions,
                                                    access exclusive content,
                                                    and connect with other
                                                    members.
                                                </Typography>
                                            </>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Stats Card */}
                            <Card
                                sx={{
                                    borderRadius: 4,
                                    boxShadow: theme.shadows[3],
                                }}>
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        fontWeight="bold"
                                        sx={{
                                            color: theme.palette.primary.dark,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}>
                                        <TagIcon fontSize="small" />
                                        Community Stats
                                    </Typography>
                                    <Stack spacing={2} sx={{ mt: 2 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                            }}>
                                            <Typography variant="body2">
                                                Active Members:
                                            </Typography>
                                            <Typography fontWeight={600}>
                                                {members?.length || 0}
                                            </Typography>
                                        </Box>
                                        <Divider />
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                            }}>
                                            <Typography variant="body2">
                                                Subscription Fee:
                                            </Typography>
                                            <Typography
                                                fontWeight={600}
                                                color={
                                                    subscriptionFee
                                                        ? "primary"
                                                        : "success"
                                                }>
                                                {subscriptionFee
                                                    ? `$${subscriptionFee}/month`
                                                    : "Free"}
                                            </Typography>
                                        </Box>
                                        <Divider />
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                            }}>
                                            <Typography variant="body2">
                                                Category:
                                            </Typography>
                                            <Typography fontWeight={600}>
                                                {category}
                                            </Typography>
                                        </Box>
                                        <Divider />
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                            }}>
                                            <Typography variant="body2">
                                                Privacy:
                                            </Typography>
                                            <Typography fontWeight={600}>
                                                Private Community
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Auth Dialog */}
            <Auth authContain={authOpen} setAuthContain={setAuthOpen} />

            <PaymentDialog
                open={paymentDialogOpen}
                onClose={() => setPaymentDialogOpen(false)}
                amount={subscriptionFee}
                communityId={communityId}
                onPaymentSuccess={handlePaymentSuccess}
                type="community_subscription"
            />

            {/* share drawer */}
            <SocialShareDrawer
                open={selectShare}
                onClose={() => setSelectShare(false)}
                communityName={name}
                url={communityUrl}
            />
        </Elements>
    );
};

export default CommunityView;
