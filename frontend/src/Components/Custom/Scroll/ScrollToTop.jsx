import { useEffect } from "react";
import { useReactRouter } from "../../Hooks/useReactRouter";

export const ScrollToTop = () => {
    const { useLocation } = useReactRouter();

    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    return null;
};
