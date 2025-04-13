import axios from "axios";
import { localStorageToken, serVer } from "./useVariable";

// fetch user data from DB
export const fetchUser = async () => {
    const token = localStorage.getItem(localStorageToken);

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
    const token = localStorage.getItem(localStorageToken);

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
    const token = localStorage.getItem(localStorageToken);

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

// fetch user membership
export const fetchUserMembership = async (communityId) => {
    const token = localStorage.getItem(localStorageToken);

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

// fetch user communities
export const fetchUserJoinedCommunities = async () => {
    const token = localStorage.getItem(localStorageToken);

    const response = await axios.get(`${serVer}/user/community-member`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status !== 200) {
        throw new Error("Network response was not ok");
    }

    return response.data;
};
