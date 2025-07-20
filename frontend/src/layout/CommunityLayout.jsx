import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useReactRouter } from "../Components/Hooks/useReactRouter";
import {
    useUserData,
    useUserMembershipData,
} from "../Components/Hooks/useQueryFetch/useQueryData";
import toast from "react-hot-toast";
import PageLoader from "../Components/Animations/PageLoader";
import { useOnlineStatus } from "../Components/Hooks/useToggleOnlineStatus";
import { RenewSubscriptionDialog } from "../Components/Custom/payment/PaymentDialog";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "../Components/Hooks/useVariable";

const CommunityLayout = () => {
    const [isLoad, setIsLoad] = useState(true);
    const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
    const { useNavigate, useParams } = useReactRouter();

    const navigate = useNavigate();
    const { communityId } = useParams();

    const {
        userMembershipData,
        isUserMembershipLoading,
        refetchUserMembership,
    } = useUserMembershipData(communityId);
    const { userData, isUserDataLoading } = useUserData();

    const { onlineStatus } = userData || {};

    useEffect(() => {
        // Redirect if the user is not a member
        if (userMembershipData && userMembershipData === null) {
            toast.error("You're not not a member of this community");

            navigate("/"); // Redirect to a "not authorized" page
        } else {
            setIsLoad(false);
        }
    }, [userMembershipData, isUserMembershipLoading, navigate]);

    // update membership status if due date for subscription based communities and trigger a dialog to ask if user wants to renew subscription or cancel
    useEffect(() => {
        const currentDate = new Date();
        if (
            userMembershipData &&
            userMembershipData?.communitySubFee > 0 &&
            userMembershipData?.currentPeriodEnd
        ) {
            const membershipDueDate = new Date(
                userMembershipData?.currentPeriodEnd
            );
            if (membershipDueDate <= currentDate) {
                setIsRenewDialogOpen(true);
            }
        }
    }, [userMembershipData]);

    // function to toggle user online status
    useOnlineStatus({ onlineStatus, isUserDataLoading });

    if (isLoad || isUserMembershipLoading || isUserDataLoading) {
        return <PageLoader />;
    }

    return (
        <Elements stripe={stripePromise}>
            <Outlet />

            <RenewSubscriptionDialog
                open={isRenewDialogOpen}
                onClose={() => setIsRenewDialogOpen(false)}
                status={userMembershipData?.status}
                amount={userMembershipData?.communitySubFee || 0}
                communityId={communityId}
                refetchUserMembership={refetchUserMembership}
            />
        </Elements>
    );
};

export default CommunityLayout;
