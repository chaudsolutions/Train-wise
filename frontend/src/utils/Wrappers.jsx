import { useEffect, useState } from "react";
import PageLoader from "../Components/Animations/PageLoader";
import {
    useCommunityByIdData,
    useUserData,
} from "../Components/Hooks/useQueryFetch/useQueryData";
import { useReactRouter } from "../Components/Hooks/useReactRouter";
import toast from "react-hot-toast";


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

    useEffect(() => {
        // Redirect if the user is not a member
        if (
            userData &&
            userData?.role === "user" &&
            !community?.createdBy?.creator === _id
        ) {
            toast.error("You're not the creator of this community");

            navigate("/"); // Redirect to a "not authorized" page
        } else {
            setIsLoad(false);
        }
    }, [navigate, userData, community, _id]);

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
