import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";
import toast from "react-hot-toast";
import { serVer, useToken } from "./useVariable";

export const usePayment = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const { token } = useToken();

    const handlePayment = async (amount, communityId, onSuccess, type) => {
        if (!stripe || !elements) {
            toast.error("Payment system not initialized");
            return false;
        }

        if (type !== "subscription") {
            toast.error("Only subscriptions are supported at this time");
            return false;
        }

        setPaymentProcessing(true);
        try {
            // Step 1: Create SetupIntent
            const paymentResponse = await axios.post(
                `${serVer}/payment/create-subscription`,
                { communityId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { clientSecret, priceId } = paymentResponse.data;

            // Step 2: Confirm SetupIntent
            const { error, setupIntent } = await stripe.confirmCardSetup(
                clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: "Community Member",
                        },
                    },
                }
            );

            if (error) {
                throw error;
            }

            if (setupIntent.status === "succeeded") {
                // Step 3: Finalize subscription
                const finalizeResponse = await axios.post(
                    `${serVer}/payment/finalize-subscription`,
                    {
                        communityId,
                        paymentMethodId: setupIntent.payment_method,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const { subscriptionId } = finalizeResponse.data;

                // Step 4: Call onSuccess with subscriptionId
                await onSuccess(subscriptionId);
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
