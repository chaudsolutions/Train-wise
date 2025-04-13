import { useEffect, useState } from "react";
import PageLoader from "../Components/Animations/PageLoader";
import {
    useIsUserMembershipData,
    useUserData,
} from "../Components/Hooks/useQueryFetch/useQueryData";
import { useReactRouter } from "../Components/Hooks/useReactRouter";
import toast from "react-hot-toast";

export const UserMembershipWrapper = ({ children }) => {
    const { useNavigate, useParams } = useReactRouter();

    const navigate = useNavigate();
    const { communityId } = useParams();

    const { isUserMembership, isUserMembershipLoading } =
        useIsUserMembershipData(communityId);

    useEffect(() => {
        // Redirect if the user is not a member
        if (!isUserMembershipLoading && !isUserMembership) {
            toast.error(
                "You're not not a member of this community or your subscription has expired"
            );

            // run a function that removes the user from the membership

            navigate("/"); // Redirect to a "not authorized" page
        }
    }, [isUserMembership, isUserMembershipLoading, navigate]);

    if (isUserMembershipLoading) {
        return <PageLoader />;
    }

    return <>{children}</>;
};

export const CreatorWrapper = ({ children }) => {
    const [isLoad, setIsLoad] = useState(true);
    const { useNavigate } = useReactRouter();

    const navigate = useNavigate();

    const { userData, isUserDataLoading } = useUserData();

    useEffect(() => {
        // Redirect if the user is not a member
        if (userData && userData?.role === "user") {
            toast.error("You're not an admin");

            navigate("/"); // Redirect to a "not authorized" page
        } else {
            setIsLoad(false);
        }
    }, [userData, navigate]);

    if (isUserDataLoading || isLoad) {
        return <PageLoader />;
    }

    return <>{children}</>;
};
