import { useEffect } from "react";
import { localStorageToken, serVer } from "./useVariable";
import axios from "axios";

export const useOnlineStatus = ({ onlineStatus, isUserDataLoading }) => {
    const toggleOnlineStatus = async (status) => {
        const token = localStorage.getItem(localStorageToken);
        try {
            await axios.put(
                `${serVer}/user/toggle-online-status`,
                { status: Boolean(status) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error(
                "Online status update failed:",
                error.response?.data || error.message
            );
        }
    };

    // Set online when component mounts
    useEffect(() => {
        if (!isUserDataLoading && onlineStatus !== true) {
            toggleOnlineStatus(true);
        }
    }, [isUserDataLoading, onlineStatus]);

    // Set offline when component unmounts
    useEffect(() => {
        if (!onlineStatus) {
            return () => {
                toggleOnlineStatus(false).catch(console.error);
            };
        }
    }, [onlineStatus]);
};
