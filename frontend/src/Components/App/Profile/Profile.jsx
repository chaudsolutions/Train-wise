import { useState, useRef } from "react";
import { Container } from "@mui/material";
import PageLoader from "../../Animations/PageLoader";
import {
    useCategoriesData,
    useUserAnalyticsData,
} from "../../Hooks/useQueryFetch/useQueryData";
import { serVer, useToken } from "../../Hooks/useVariable";
import axios from "axios";
import toast from "react-hot-toast";
import ProfileContainer from "../../Custom/profile/ProfileContainer";

const Profile = () => {
    const { userAnalyticsData, isUserAnalyticsLoading, refetchUserAnalytics } =
        useUserAnalyticsData();
    const { categories, isCategoriesLoading } = useCategoriesData();

    const { user, communities, finances } = userAnalyticsData || {};

    const { token } = useToken();

    const [profileImage, setProfileImage] = useState(false);
    const [btnLoad, setBtnLoad] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.match("image.*")) {
                alert("Please select an image file");
                return;
            }

            if (file.size > 1 * 1024 * 1024) {
                // 1MB limit
                alert("File size should be less than 1MB");
                return;
            }

            const reader = new FileReader();

            // Here you would typically upload to your server
            uploadProfileImage(file);

            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const uploadProfileImage = async (file) => {
        setProfileImage(true);
        try {
            // Create FormData and append the file
            const formData = new FormData();
            formData.append("avatar", file);

            const response = await axios.put(
                `${serVer}/user/upload-avatar`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            await refetchUserAnalytics();

            toast.success(response.data);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error updating profile image");
        } finally {
            setProfileImage(false);
        }
    };

    // function to withdraw balance
    const withdrawBalance = async (amountToWithdraw) => {
        setBtnLoad(true);
        try {
            const res = await axios.put(
                `${serVer}/user/withdraw/${amountToWithdraw}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success(res.data);

            await refetchUserAnalytics();
        } catch (error) {
            toast.error(error?.response?.data);
        } finally {
            setBtnLoad(false);
        }
    };

    if (isUserAnalyticsLoading || isCategoriesLoading) {
        return <PageLoader />;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <ProfileContainer
                categories={categories}
                user={user}
                communities={communities}
                finances={finances}
                handleProfileImage={{
                    triggerFileInput,
                    profileImage,
                    fileInputRef,
                    handleFileChange,
                    withdrawBalance,
                    btnLoad,
                }}
            />
        </Container>
    );
};

export default Profile;
