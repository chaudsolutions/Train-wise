import { useQuery } from "@tanstack/react-query";
import {
    fetchCommunities,
    fetchCommunity,
    fetchCommunityCourses,
    fetchCommunitySingleCourse,
    fetchUser,
    fetchUserMembership,
} from "../useFetch";
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
export const useCommunitiesData = () => {
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
export const useCommunityByIdData = ({ id }) => {
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

// use community courses data
export const useCommunityCoursesData = ({ id }) => {
    const { user } = useAuthContext();

    const {
        data: coursesData,
        isLoading: isCoursesLoading,
        isError: isCoursesError,
        refetch: refetchCourses,
    } = useQuery({
        queryKey: ["communityCourses", id], // Use the new object-based syntax
        queryFn: () => fetchCommunityCourses({ id }),
        enabled: !!id && !!user,
    });

    return {
        coursesData,
        isCoursesLoading,
        isCoursesError,
        refetchCourses,
    };
};

// use single course data
export const useCommunitySingleCourseData = ({ communityId, courseId }) => {
    const { user } = useAuthContext();

    const {
        data: singleCourseData,
        isLoading: isSingleCourseLoading,
        isError: isSingleCourseError,
        refetch: refetchSingleCourse,
    } = useQuery({
        queryKey: ["communitySingleCourse", communityId, courseId], // Use the new object-based syntax
        queryFn: () => fetchCommunitySingleCourse({ communityId, courseId }),
        enabled: !!user && !!communityId && !!courseId,
    });

    return {
        singleCourseData,
        isSingleCourseLoading,
        isSingleCourseError,
        refetchSingleCourse,
    };
};

// use user membership data
export const useIsUserMembershipData = (communityId) => {
    const { user } = useAuthContext();

    const {
        data: isUserMembership,
        isLoading: isUserMembershipLoading,
        isError: isUserMembershipError,
        refetch: refetchIsUserMembership,
    } = useQuery({
        queryKey: ["isUserMembership", communityId], // Use the new object-based syntax
        queryFn: () => fetchUserMembership(communityId),
        enabled: !!user && !!communityId,
    });

    return {
        isUserMembership,
        isUserMembershipLoading,
        isUserMembershipError,
        refetchIsUserMembership,
    };
};
