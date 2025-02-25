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
