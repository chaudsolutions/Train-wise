import { useLocation } from "react-router-dom";
import { localStorageToken, serVer } from "./useVariable";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";

export const useOnlineStatus = ({ onlineStatus, isUserDataLoading }) => {
    const location = useLocation();
    const [debouncedStatus, setDebouncedStatus] = useState(null);

    const toggleOnlineStatus = async (status) => {
        const token = localStorage.getItem(localStorageToken);
        try {
            const response = await axios.put(
                `${serVer}/user/toggle-online-status`,
                { status: Boolean(status) },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error(
                "Online status update failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    };

    // Determine if we should be online based on current path
    const allowedPaths = [
        /^\/admin\/add-course\/.+/,
        /^\/course\/.+\/community\/.+/,
        /^\/community\/.+/,
    ];

    const shouldStayOnline = allowedPaths.some((pattern) =>
        pattern.test(location.pathname)
    );

    // Set the desired status whenever path or onlineStatus changes
    useEffect(() => {
        if (shouldStayOnline) {
            setDebouncedStatus(true);
        } else {
            setDebouncedStatus(false);
        }
    }, [location.pathname, shouldStayOnline]);

    // Debounce the actual API call
    useDebounce(
        () => {
            if (
                debouncedStatus !== null &&
                debouncedStatus !== onlineStatus &&
                !isUserDataLoading
            ) {
                toggleOnlineStatus(debouncedStatus).catch((e) => {
                    console.error("Debounced status update failed:", e);
                });
            }
        },
        1000, // 1000ms debounce delay
        [debouncedStatus, onlineStatus]
    );

    // Cleanup when unmounting - set offline immediately
    useEffect(() => {
        return () => {
            if (shouldStayOnline) {
                toggleOnlineStatus(false).catch((e) => {
                    console.error("Cleanup status update failed:", e);
                });
            }
        };
    }, [shouldStayOnline]);
};
