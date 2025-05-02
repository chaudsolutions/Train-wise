import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useReactRouter } from "../Components/Hooks/useReactRouter";
import {
    useUserData,
    useUserMembershipData,
} from "../Components/Hooks/useQueryFetch/useQueryData";
import toast from "react-hot-toast";
import PageLoader from "../Components/Animations/PageLoader";
import { useOnlineStatus } from "../Components/Hooks/useToggleOnlineStatus";

const CommunityLayout = () => {
    const [isLoad, setIsLoad] = useState(true);
    const { useNavigate, useParams } = useReactRouter();

    const navigate = useNavigate();
    const { communityId } = useParams();

    const { userMembershipData, isUserMembershipLoading } =
        useUserMembershipData(communityId);
    const { userData, isUserDataLoading } = useUserData();

    const { onlineStatus } = userData || {};

    useEffect(() => {
        // Redirect if the user is not a member
        if (userMembershipData && userMembershipData === "") {
            toast.error(
                "You're not not a member of this community or your subscription has expired"
            );

            navigate("/"); // Redirect to a "not authorized" page
        } else {
            setIsLoad(false);
        }
    }, [userMembershipData, isUserMembershipLoading, navigate]);

    // function to toggle user online status
    useOnlineStatus({ onlineStatus, isUserDataLoading });

    if (isLoad || isUserMembershipLoading || isUserDataLoading) {
        return <PageLoader />;
    }

    return <Outlet />;
};

export default CommunityLayout;
