import { useQuery } from "@tanstack/react-query";
import {
    fetchAdminAnalytics,
    fetchAdminAnalyticsSingleUser,
    fetchCategories,
    fetchCommunities,
    fetchCommunity,
    fetchCommunityCourses,
    fetchCommunitySingleCourse,
    fetchNotifications,
    fetchUser,
    fetchUserAnalytics,
    fetchUserMembership,
    fetchWithdrawals,
} from "../useFetch";
import { useAuthContext } from "../../Context/AuthContext";
import { useReactRouter } from "../useReactRouter";

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

// use categories data
export const useCategoriesData = () => {
    const {
        data: categories,
        isLoading: isCategoriesLoading,
        isError: isCategoriesError,
        refetch: refetchCategories,
    } = useQuery({
        queryKey: ["categories"], // Use the new object-based syntax
        queryFn: fetchCategories,
    });

    return {
        categories,
        isCategoriesLoading,
        isCategoriesError,
        refetchCategories,
    };
};

// use user membership data
export const useUserMembershipData = (communityId) => {
    const { user } = useAuthContext();

    const {
        data: userMembershipData,
        isLoading: isUserMembershipLoading,
        isError: isUserMembershipError,
        refetch: refetchUserMembership,
    } = useQuery({
        queryKey: ["userMembership", user, communityId], // Use the new object-based syntax
        queryFn: () => fetchUserMembership(communityId),
        enabled: !!user && !!communityId,
    });

    return {
        userMembershipData,
        isUserMembershipLoading,
        isUserMembershipError,
        refetchUserMembership,
    };
};

// use user joined community data
export const useUserAnalyticsData = () => {
    const { user } = useAuthContext();
    const profilePage = location.pathname === "/profile";

    const {
        data: userAnalyticsData,
        isLoading: isUserAnalyticsLoading,
        isError: isUserAnalyticsError,
        refetch: refetchUserAnalytics,
    } = useQuery({
        queryKey: ["userAnalytics"],
        queryFn: fetchUserAnalytics,
        enabled: !!user && !!profilePage,
    });

    return {
        userAnalyticsData,
        isUserAnalyticsLoading,
        isUserAnalyticsError,
        refetchUserAnalytics,
    };
};

// use admin analytics data
export const useAdminAnalyticsData = () => {
    const { user } = useAuthContext();
    const { useLocation } = useReactRouter();
    const location = useLocation();

    const adminPage = location.pathname.startsWith("/admin");

    const {
        data: analyticsData,
        isLoading: isAnalyticsDataLoading,
        isError: isAnalyticsDataError,
        refetch: refetchAnalyticsData,
    } = useQuery({
        queryKey: ["analyticsData"],
        queryFn: fetchAdminAnalytics,
        enabled: !!user && !!adminPage,
    });

    return {
        analyticsData,
        isAnalyticsDataLoading,
        isAnalyticsDataError,
        refetchAnalyticsData,
    };
};

// use admin analytics data for single user
export const useAdminAnalyticsSingleUserData = ({ userId }) => {
    const { user } = useAuthContext();
    const { useLocation } = useReactRouter();
    const location = useLocation();

    const adminPage = location.pathname.startsWith("/admin");

    const {
        data: analyticsSingleUserData,
        isLoading: isAnalyticsSingleUserDataLoading,
        isError: isAnalyticsSingleUserDataError,
        refetch: refetchAnalyticsSingleUserData,
    } = useQuery({
        queryKey: ["analyticsSingleUserData", userId],
        queryFn: () => fetchAdminAnalyticsSingleUser({ userId }),
        enabled: !!user && !!adminPage,
    });

    return {
        analyticsSingleUserData,
        isAnalyticsSingleUserDataLoading,
        isAnalyticsSingleUserDataError,
        refetchAnalyticsSingleUserData,
    };
};

// fetch user notifications
export const useUserNotifications = () => {
    const { user } = useAuthContext();

    const {
        data: notificationsData,
        isLoading: isNotificationsDataLoading,
        isError: isNotificationsDataError,
        refetch: refetchNotificationsData,
    } = useQuery({
        queryKey: ["notifications"], // Use the new object-based syntax
        queryFn: fetchNotifications,
        enabled: !!user,
    });

    return {
        notificationsData,
        isNotificationsDataLoading,
        isNotificationsDataError,
        refetchNotificationsData,
    };
};

// fetch user withdrawals
export const useUserWithdrawals = () => {
    const { user } = useAuthContext();

    const {
        data: withdrawalsData,
        isLoading: isWithdrawalsDataLoading,
        isError: isWithdrawalsDataError,
        refetch: refetchWithdrawalsData,
    } = useQuery({
        queryKey: ["withdrawals"], // Use the new object-based syntax
        queryFn: fetchWithdrawals,
        enabled: !!user,
    });

    return {
        withdrawalsData,
        isWithdrawalsDataLoading,
        isWithdrawalsDataError,
        refetchWithdrawalsData,
    };
};
