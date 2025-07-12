import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import NoProfilePhoto from "../../assets/no-profile.png";

// local storage token
export const localStorageToken = import.meta.env.VITE_LOCALSTORAGE_TOKEN;

// company name
export const companyName = "Skillbay";

// redirect session key name
export const redirectSessionKey = `${companyName}PricingRedirectAfterLogin`;

export const noProfilePic = NoProfilePhoto;

// backend api route
export const serVer = import.meta.env.VITE_API_LIVE;

// load stripe
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

export const useToken = () => {
    const [token, setToken] = useState(localStorageToken);

    useEffect(() => {
        const token = localStorage.getItem(localStorageToken);

        setToken(token);
    }, []);

    return { token };
};
