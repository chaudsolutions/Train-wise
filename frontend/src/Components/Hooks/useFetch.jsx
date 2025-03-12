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
