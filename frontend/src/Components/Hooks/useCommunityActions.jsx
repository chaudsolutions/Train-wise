import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { serVer, useToken } from "./useVariable";

export const useCommunityActions = () => {
    const { token } = useToken();
    const [loading, setLoading] = useState(false);

    const joinCommunity = async (communityId, subscriptionId) => {
        setLoading(true);
        try {
            const res = await axios.put(
                `${serVer}/user/joinCommunity/${communityId}`,
                { subscriptionId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data);
            return true;
        } catch (error) {
            toast.error(error.response?.data || "Failed to join community");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteCommunity = async (communityId) => {
        setLoading(true);
        try {
            const res = await axios.delete(
                `${serVer}/admin/community/${communityId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data);
            return true;
        } catch (error) {
            toast.error("Failed to delete community");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { joinCommunity, deleteCommunity, loading };
};
