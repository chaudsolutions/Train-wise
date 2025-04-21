import { useEffect, useState } from "react";
import PageLoader from "../Components/Animations/PageLoader";
import {
    useCommunityByIdData,
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
        if (!isUserMembership) {
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
    const { useNavigate, useParams } = useReactRouter();

    const { communityId } = useParams();

    const navigate = useNavigate();

    const { userData, isUserDataLoading } = useUserData();
    const { community, isCommunityLoading } = useCommunityByIdData({
        id: communityId,
    });

    const { _id } = userData || {};
    const { createdBy } = community?.community || {};

    const creator = createdBy === _id;

    useEffect(() => {
        // Redirect if the user is not a member
        if (userData && userData?.role === "user" && !creator) {
            toast.error("You're not the creator of this community");

            navigate("/"); // Redirect to a "not authorized" page
        } else {
            setIsLoad(false);
        }
    }, [navigate, userData, creator]);

    if (isUserDataLoading || isCommunityLoading || isLoad) {
        return <PageLoader />;
    }

    return <>{children}</>;
};

// admin wrapper
export const AdminWrapper = ({ children }) => {
    const [isLoad, setIsLoad] = useState(true);
    const { useNavigate } = useReactRouter();

    const navigate = useNavigate();

    const { userData, isUserDataLoading } = useUserData();

    useEffect(() => {
        // Redirect if the user is not a member
        if (userData && userData?.role !== "admin") {
            toast.error("You're not an admin");

            navigate("/"); // Redirect to a "not authorized" page
        } else {
            setIsLoad(false);
        }
    }, [navigate, userData]);

    if (isUserDataLoading || isLoad) {
        return <PageLoader />;
    }

    return <>{children}</>;
};
