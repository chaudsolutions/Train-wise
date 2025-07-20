import axios from "axios";
import { localStorageToken, serVer } from "./useVariable";

export const getToken = () => {
    const token = localStorage.getItem(localStorageToken);

    return JSON.parse(token);
};

// fetch user data from DB
export const fetchUser = async () => {
    const token = getToken();

    const response = await axios.get(`${serVer}/user/data`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    return response.data;
};

// fetch communities
export const fetchCommunities = async () => {
    const response = await axios.get(`${serVer}/api/communities`);

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    return response.data;
};

// fetch random communities
export const fetchRandomCommunities = async () => {
    const response = await axios.get(`${serVer}/api/communities/random`);

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    return response.data;
};

// fetch single community
export const fetchCommunity = async ({ id }) => {
    const response = await axios.get(`${serVer}/api/community/${id}`);

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    return response.data;
};

// fetch community courses
export const fetchCommunityCourses = async ({ id }) => {
    const token = getToken();

    const response = await axios.get(`${serVer}/user/courses/community/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    return response.data;
};

export const fetchCommunitySingleCourse = async ({ communityId, courseId }) => {
    const token = getToken();

    const response = await axios.get(
        `${serVer}/user/course/community/${communityId}/${courseId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    return response.data;
};

// fetch categories
export const fetchCategories = async () => {
    const response = await axios.get(`${serVer}/api/all-categories`);

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    return response.data;
};

// fetch user membership
export const fetchUserMembership = async (communityId) => {
    const token = getToken();

    const response = await axios.get(
        `${serVer}/user/verify-membership/${communityId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    return response.data;
};

// fetch user analytics
export const fetchUserAnalytics = async () => {
    const token = getToken();

    const response = await axios.get(`${serVer}/user/analytics`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    const { user, communities, finances } = response.data;

    return { user, communities, finances };
};

// get admin analytics
export const fetchAdminAnalytics = async () => {
    const token = getToken();

    const response = await axios.get(`${serVer}/admin/dashboard/analytics`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    const { communities, revenue, users, withdrawals, settings, errorLogs } =
        response.data;

    return { communities, revenue, users, withdrawals, settings, errorLogs };
};

// get admin analytics for single user
export const fetchAdminAnalyticsSingleUser = async ({ userId }) => {
    const token = getToken();

    const response = await axios.get(`${serVer}/admin/user/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    const { communities, finances, user } = response.data;

    return { communities, finances, user };
};

// get notifications
export const fetchNotifications = async () => {
    const token = getToken();

    const response = await axios.get(`${serVer}/user/notifications`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    return response.data;
};

// get withdrawals
export const fetchWithdrawals = async () => {
    const token = getToken();

    const response = await axios.get(`${serVer}/user/withdrawals`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    const { withdrawals, paymentDetails } = response.data;

    return { withdrawals, paymentDetails };
};

// fetch settings
export const fetchSettings = async () => {
    const token = getToken();
    const response = await axios.get(`${serVer}/api/settings`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    return response.data;
};

// fetch community calendar
export const fetchCommunityCalendar = async (communityId) => {
    const token = getToken();

    const response = await axios.get(
        `${serVer}/user/community-calendar/${communityId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    return response.data;
};
