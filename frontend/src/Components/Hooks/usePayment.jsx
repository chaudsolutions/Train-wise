import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";
import toast from "react-hot-toast";
import { serVer, useToken } from "./useVariable";
import { useCommunityActions } from "./useCommunityActions";

export const usePayment = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const { token } = useToken();

    const handlePayment = async ({
        amount,
        onSuccess,
        type,
        data,
        handleType,
    }) => {
        if (!stripe || !elements) {
            toast.error("Payment system not initialized");
            return false;
        }

        setPaymentProcessing(true);
        try {
            // Step 1: Create SetupIntent
            const paymentResponse = await axios.post(
                `${serVer}/payment/create-payment-intent`,
                { amount, type },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { clientSecret } = paymentResponse.data;

            // Step 2: Confirm SetupIntent
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: handleType.isCommunityCreation
                                ? "Community Creator"
                                : handleType.isCommunityMemberSubscription
                                ? "Community Member Subscription"
                                : handleType.isCommunityMembershipRenewal
                                ? "Community Membership Renewal"
                                : handleType.isStoragePurchase
                                ? "Storage Purchase"
                                : "",
                        },
                    },
                }
            );

            if (error) {
                throw error;
            }

            if (paymentIntent.status === "succeeded") {
                // Step 4: Call onSuccess with subscriptionId
                await onSuccess(
                    handleType.isCommunityCreation ? paymentIntent.id : data,
                    paymentIntent.id
                );
                return true; // Indicate success
            }
        } catch (error) {
            toast.error(`Payment failed: ${error.message}`);
            console.error("Payment error:", error);
            return false;
        } finally {
            setPaymentProcessing(false);
        }
    };

    return { handlePayment, paymentProcessing };
};

export const useRenewalPayment = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [paymentRenewalProcessing, setPaymentRenewalProcessing] =
        useState(false);
    const [paymentCancel, setPaymentCancel] = useState(false);
    const { token } = useToken();

    const { joinCommunity } = useCommunityActions();

    const handlePaymentRenewal = async ({ amount, communityId, type }) => {
        if (!stripe || !elements) {
            toast.error("Payment system not initialized");
            return false;
        }

        setPaymentRenewalProcessing(true);
        try {
            // Step 1: Create SetupIntent
            const paymentResponse = await axios.post(
                `${serVer}/payment/create-payment-intent`,
                { amount, type },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { clientSecret } = paymentResponse.data;

            // Step 2: Confirm SetupIntent
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name:
                                type === "community_subscription_renewal"
                                    ? "Community Member Renewal"
                                    : "Community Creator",
                        },
                    },
                }
            );

            if (error) {
                throw error;
            }

            if (paymentIntent.status === "succeeded") {
                // Step 4: Call onSuccess with subscriptionId
                await joinCommunity(communityId, paymentIntent.id);
                return true; // Indicate success
            }
        } catch (error) {
            toast.error(`Payment failed: ${error.message}`);
            console.error("Payment error:", error);
            return false;
        } finally {
            setPaymentRenewalProcessing(false);
        }
    };

    const handleCancelSubscription = async ({
        communityId,
        refetchUserMembership,
    }) => {
        setPaymentCancel(true);
        try {
            const response = await axios.put(
                `${serVer}/user/cancel-subscription/${communityId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            await refetchUserMembership();

            toast.success(response.data);
        } catch (error) {
            toast.error(error.response?.data || "Cancellation failed");
            console.error("Cancellation error:", error);
        } finally {
            setPaymentCancel(false);
        }
    };

    return {
        handlePaymentRenewal,
        handleCancelSubscription,
        paymentRenewalProcessing,
        paymentCancel,
    };
};
