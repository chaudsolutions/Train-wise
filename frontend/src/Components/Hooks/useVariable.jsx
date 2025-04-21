import { useEffect, useState } from "react";

// local storage token
export const localStorageToken = import.meta.env.VITE_LOCALSTORAGE_TOKEN;

// company name
export const companyName = "Train Wise";

// redirect session key name
export const redirectSessionKey = `${companyName}PricingRedirectAfterLogin`;

// backend api route
export const serVer = import.meta.env.VITE_API_LIVE;

export const useToken = () => {
    const [token, setToken] = useState(localStorageToken);

    useEffect(() => {
        const token = localStorage.getItem(localStorageToken);

        setToken(token);
    }, []);

    return { token };
};
