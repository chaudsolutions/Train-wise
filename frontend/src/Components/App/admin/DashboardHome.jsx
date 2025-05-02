import { Box, Grid, Typography, Card, CardContent } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAdminAnalyticsData } from "../../Hooks/useQueryFetch/useQueryData";
import PageLoader from "../../Animations/PageLoader";

const MetricCard = styled(Card)(({ theme }) => ({
    transition: "transform 0.2s",
    "&:hover": {
        transform: "scale(1.02)",
        boxShadow: theme.shadows[4],
    },
}));

const DashboardHome = () => {
    const { analyticsData, isAnalyticsDataLoading } = useAdminAnalyticsData();

    const { communities, revenue, users } = analyticsData || {};

    const metricsCardArr = [
        {
            name: "Total Revenue",
            total: `$${revenue?.totalRevenue || 0}`,
            others: [
                {
                    name: "Community Creation",
                    value: `$${revenue?.communityCreationRevenue || 0}`,
                },
                {
                    name: "Community Subscriptions",
                    value: `$${revenue?.communitySubscriptionRevenue || 0}`,
                },
            ],
        },
        {
            name: "Communities",
            total: communities?.communities?.length || 0,
            others: [
                {
                    name: "Free",
                    value: communities?.freeCommunities?.length || 0,
                },
                {
                    name: "Paid",
                    value: communities?.paidCommunities?.length || 0,
                },
            ],
        },
        {
            name: "Users",
            total: users?.users?.length || 0,
            others: [
                { name: "Admins", value: users?.adminRoles?.length || 0 },
                { name: "Creators", value: users?.creatorRoles?.length || 0 },
                { name: "Users", value: users?.userRoles?.length || 0 },
            ],
        },
    ];

    if (isAnalyticsDataLoading) {
        return <PageLoader />;
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Grid container spacing={3}>
                {metricsCardArr.map((m) => (
                    <Grid key={m.name} size={{ xs: 12, md: 6, lg: 4 }}>
                        <MetricCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {m.name}
                                </Typography>
                                <Typography
                                    variant="h3"
                                    color="primary"
                                    gutterBottom>
                                    {m.total}
                                </Typography>

                                <Box display="flex" flexWrap="wrap" gap="1rem">
                                    {m.others.map((o, i) => (
                                        <Typography
                                            key={i}
                                            component="p"
                                            variant="body2">
                                            {o.name}: {o.value}
                                        </Typography>
                                    ))}
                                </Box>
                            </CardContent>
                        </MetricCard>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default DashboardHome;
