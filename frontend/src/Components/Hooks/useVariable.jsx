import { useEffect, useState } from "react";

// local storage token
export const localStorageToken = import.meta.env.VITE_LOCALSTORAGE_TOKEN;

// company name
export const companyName = "NAME";

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

export const categories = [
    { icon: "🎨", name: "Hobbies" },
    { icon: "🎸", name: "Music" },
    { icon: "💰", name: "Money" },
    { icon: "🙏", name: "Spirituality" },
    { icon: "💻", name: "Tech" },
    { icon: "🥕", name: "Health" },
    { icon: "⚽", name: "Sports" },
    { icon: "📚", name: "Self-improvement" },
    { icon: "❤️", name: "Relationships" },
];
