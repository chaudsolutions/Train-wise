import useResponsive from "../../Hooks/useResponsive";
import logo from "/logo.png";
import { RxHamburgerMenu } from "react-icons/rx";
import "./nav.css";
import { useEffect, useState } from "react";
import NavSlide, { AuthContainer } from "./NavSlide";
import { useReactRouter } from "../../Hooks/useReactRouter";
import NavMenu from "./NavMenu";
import { useAuthContext } from "../../Context/AuthContext";
import { CommunityName } from "../../App/Community/CommunityView";

const Nav = () => {
    const { user } = useAuthContext();

    // responsive hook
    const { isMobile } = useResponsive();

    const { useMatch, Link } = useReactRouter();

    // states
    const [isNavActive, setIsNavActive] = useState(false);
    const [isDesktopNav, setIsDesktopNav] = useState(false);

    useEffect(() => {
        const closeNav = (e) => {
            if (
                isNavActive &&
                !e.target.closest(".navBtn") &&
                !e.target.closest(".dp-toggle")
            ) {
                setIsNavActive(false);
            }
            if (
                isDesktopNav &&
                !e.target.closest(".desktopNavBtn") &&
                !e.target.closest(".desktopNav")
            ) {
                setIsDesktopNav(false);
            }
        };

        window.addEventListener("click", closeNav);

        // Cleanup function to remove the event listener
        return () => {
            window.removeEventListener("click", closeNav);
        };
    }, [isNavActive, isDesktopNav]); // Add dependencies to effect

    const matchOne = useMatch("/community/:communityId");
    const matchTwo = useMatch("/community/access/:communityId");

    const isCommunity = !!matchOne || !!matchTwo;

    return (
        <>
            <div className="nav">
                <div>
                    {isCommunity ? (
                        <CommunityName />
                    ) : (
                        <>
                            {isMobile && (
                                <button>
                                    <RxHamburgerMenu
                                        size={25}
                                        onClick={() =>
                                            setIsNavActive(
                                                (prevView) => !prevView
                                            )
                                        }
                                        className="navBtn"
                                    />
                                </button>
                            )}
                            <Logo />
                        </>
                    )}

                    {!isMobile && (
                        <button
                            className="desktopNavBtn"
                            onClick={() =>
                                setIsDesktopNav((prevView) => !prevView)
                            }>
                            <SVG1 />
                        </button>
                    )}
                </div>

                <div className="d-flex align-items-center gap-2">
                    {!isCommunity && user && (
                        <Link to="/profile" className="text-dark">
                            Profile
                        </Link>
                    )}
                    <AuthContainer />
                </div>

                {/* desktop nav */}
                {!isMobile && <DesktopNav isDesktopNav={isDesktopNav} />}
            </div>
            {/* nav slider */}
            {isMobile && <NavSlide isNavActive={isNavActive} />}
        </>
    );
};

export const Logo = () => {
    const { user } = useAuthContext();

    // react router
    const { useNavigate, useLocation } = useReactRouter();

    // responsive hook
    const { isMobile } = useResponsive();

    const navigate = useNavigate();

    const { pathname } = useLocation();

    const goHome = () => {
        if (user) {
            pathname === "/dashboard" ? navigate("/") : navigate("/dashboard");
        } else {
            navigate("/");
        }
    };

    return (
        <div className="logo-contain" onClick={goHome}>
            {!isMobile && <span>NAME</span>}
            <img src={logo} alt="logo" height={isMobile ? 50 : 70} />
        </div>
    );
};

export const SVG1 = () => {
    return (
        <div className="styled__IconWrapper-sc-zxv7pb-0 bAPjFs">
            <svg
                viewBox="0 0 12 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M0.702509 13.2926C1.09284 12.8995 1.72829 12.8984 2.12 13.2901L4.58579 15.7559C5.36684 16.5369 6.63316 16.5369 7.41421 15.7559L9.88 13.2901C10.2717 12.8984 10.9072 12.8995 11.2975 13.2926C11.6859 13.6837 11.6848 14.3153 11.295 14.7051L7.41421 18.5859C6.63317 19.3669 5.36684 19.3669 4.58579 18.5859L0.705005 14.7051C0.315239 14.3153 0.314123 13.6837 0.702509 13.2926Z"
                    fill="currentColor"></path>
                <path
                    d="M11.2975 7.28749C10.9072 7.68059 10.2717 7.68171 9.88 7.28999L7.41421 4.82421C6.63316 4.04316 5.36684 4.04316 4.58579 4.82421L2.12 7.28999C1.72829 7.68171 1.09284 7.68059 0.702509 7.28749C0.314123 6.89635 0.315239 6.26476 0.705005 5.87499L4.58579 1.99421C5.36683 1.21316 6.63316 1.21316 7.41421 1.99421L11.295 5.87499C11.6848 6.26476 11.6859 6.89635 11.2975 7.28749Z"
                    fill="currentColor"></path>
            </svg>
        </div>
    );
};

export const DesktopNav = ({ isDesktopNav }) => {
    return (
        <div className={`desktopNav ${isDesktopNav ? "activeDesktopNav" : ""}`}>
            <NavMenu />
        </div>
    );
};

export default Nav;
