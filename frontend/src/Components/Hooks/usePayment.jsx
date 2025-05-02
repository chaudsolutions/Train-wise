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

    const handlePayment = async (amount, onSuccess, type) => {
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
                            name: "Community Member",
                        },
                    },
                }
            );

            if (error) {
                throw error;
            }

            if (paymentIntent.status === "succeeded") {
                // Step 4: Call onSuccess with subscriptionId
                await onSuccess(paymentIntent.id);
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
