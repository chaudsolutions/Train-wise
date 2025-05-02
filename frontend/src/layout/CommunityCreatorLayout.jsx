import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import {
    useCommunityByIdData,
    useUserData,
} from "../Components/Hooks/useQueryFetch/useQueryData";
import toast from "react-hot-toast";
import PageLoader from "../Components/Animations/PageLoader";

const CommunityCreatorLayout = () => {
    const [isLoad, setIsLoad] = useState(true);

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

    return <Outlet />;
};

export default CommunityCreatorLayout;
