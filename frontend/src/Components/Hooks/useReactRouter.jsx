import {
    BrowserRouter,
    Link,
    matchPath,
    Navigate,
    NavLink,
    Route,
    Routes,
    useLocation,
    useMatch,
    useNavigate,
    useParams,
} from "react-router-dom";

export const useReactRouter = () => {
    return {
        BrowserRouter,
        Routes,
        Route,
        Navigate,
        useLocation,
        useNavigate,
        matchPath,
        useParams,
        useMatch,
        NavLink,
        Link,
    };
};
