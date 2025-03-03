import { Link } from "react-router-dom";
import NavMenu from "./NavMenu";
import Logout from "../Buttons/Logout";
import { IoIosArrowForward } from "react-icons/io";
import { useAuthContext } from "../../Context/AuthContext";
import { useUserData } from "../../Hooks/useQueryFetch/useQueryData";
import { FaUserCircle } from "react-icons/fa";
import useResponsive from "../../Hooks/useResponsive";
import { useState } from "react";
import Auth from "../Auth/Auth";

const NavSlide = ({ isNavActive }) => {
    const { user } = useAuthContext();

    return (
        <div className={`navSlide ${isNavActive ? "activeNav" : ""}`}>
            {user && (
                <div className="profile-link">
                    <UserProfile />
                </div>
            )}

            <NavMenu />
        </div>
    );
};

export const AuthContainer = () => {
    const { user } = useAuthContext();
    const [authContain, setAuthContain] = useState(false);

    return (
        <>
            {user ? (
                <Logout />
            ) : (
                <button
                    className="btn-b"
                    onClick={() => setAuthContain((prev) => !prev)}>
                    LOGIN
                </button>
            )}

            {/* auth container */}
            {authContain && (
                <Auth
                    setAuthContain={setAuthContain}
                    authContain={authContain}
                />
            )}
        </>
    );
};

export const UserProfile = () => {
    // responsive hook
    const isMobile = useResponsive();

    const profileLink = location.pathname === "/profile";

    const { userData, isUserDataLoading } = useUserData();

    const { name } = userData || {};

    return (
        <div className="profile-DP">
            <FaUserCircle size={isMobile ? 70 : 40} />

            {profileLink ? (
                <strong>{isUserDataLoading ? "" : name}</strong>
            ) : (
                <Link to="/profile">
                    <span>My Profile</span>
                    <IoIosArrowForward size={20} />
                </Link>
            )}
        </div>
    );
};

export default NavSlide;
