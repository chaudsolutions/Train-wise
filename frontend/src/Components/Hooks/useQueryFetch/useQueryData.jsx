import { useQuery } from "@tanstack/react-query";
import { fetchCommunities, fetchCommunity, fetchUser } from "../useFetch";
import { useAuthContext } from "../../Context/AuthContext";

// fetch user details
export const useUserData = () => {
    const { user } = useAuthContext();

    const {
        data: userData,
        isLoading: isUserDataLoading,
        isError: isUserDataError,
        refetch: refetchUserData,
    } = useQuery({
        queryKey: ["user"], // Use the new object-based syntax
        queryFn: fetchUser,
        enabled: !!user,
    });

    return { userData, isUserDataLoading, isUserDataError, refetchUserData };
};

// use communities data
export const useCommunities = () => {
    const {
        data: communities,
        isLoading: isCommunitiesLoading,
        isError: isCommunitiesError,
        refetch: refetchCommunities,
    } = useQuery({
        queryKey: ["communities"], // Use the new object-based syntax
        queryFn: fetchCommunities,
    });

    return {
        communities,
        isCommunitiesLoading,
        isCommunitiesError,
        refetchCommunities,
    };
};

// use single community data by id
export const useCommunityById = ({ id }) => {
    const {
        data: community,
        isLoading: isCommunityLoading,
        isError: isCommunityError,
        refetch: refetchCommunity,
    } = useQuery({
        queryKey: ["community", id], // Use the new object-based syntax
        queryFn: () => fetchCommunity({ id }),
        enabled: !!id,
    });

    return {
        community,
        isCommunityLoading,
        isCommunityError,
        refetchCommunity,
    };
};
