import { Container } from "@mui/material";
import { useParams } from "react-router-dom";
import PageLoader from "../../Animations/PageLoader";
import {
    useAdminAnalyticsSingleUserData,
    useCategoriesData,
} from "../../Hooks/useQueryFetch/useQueryData";
import ProfileContainer from "../../Custom/profile/ProfileContainer";
import GoBack from "../../Custom/Buttons/GoBack";

const UserDetails = () => {
    const { userId } = useParams();
    const { analyticsSingleUserData, isAnalyticsSingleUserDataLoading } =
        useAdminAnalyticsSingleUserData({ userId });
    const { categories, isCategoriesLoading } = useCategoriesData();

    if (isAnalyticsSingleUserDataLoading || isCategoriesLoading) {
        return <PageLoader />;
    }

    const { user, communities, finances } = analyticsSingleUserData || {};

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <GoBack />
            <ProfileContainer
                categories={categories}
                user={user}
                communities={communities}
                finances={finances}
            />
        </Container>
    );
};

export default UserDetails;
