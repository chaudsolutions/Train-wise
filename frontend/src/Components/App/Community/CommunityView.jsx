import { useEffect, useState } from "react";
import { generateCommunities } from "../../Hooks/useMockData";
import "./community.css";
import useResponsive from "../../Hooks/useResponsive";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useReactRouter } from "../../Hooks/useReactRouter";
import { imgLink, logoLink } from "../../Custom/List/CommunitiesList";
import { CiLock } from "react-icons/ci";
import { HiOutlineUsers } from "react-icons/hi2";
import { GoDotFill, GoTag } from "react-icons/go";
import { FaRegCircleUser, FaStar } from "react-icons/fa6";
import { useAuthContext } from "../../Context/AuthContext";
import toast from "react-hot-toast";
import Auth from "../../Custom/Auth/Auth";

const CommunityView = () => {
    useEffect(() => {
        window.scroll(0, 0); // scroll to top on component mount
    }, []);

    const [selectedMedia, setSelectedMedia] = useState({ url: "", type: "" });
    const [authContain, setAuthContain] = useState(false);

    const { user } = useAuthContext();

    const { isMobile } = useResponsive();

    const { oneCommunity } = generateCommunities();

    const {
        title,
        category,
        communityBg,
        creatorName,
        description,
        rules,
        reasons,
        features,
        members,
        price,
    } = oneCommunity[0] || {};

    useEffect(() => {
        const closeAuth = (e) => {
            if (
                authContain &&
                !e.target.closest(".auth") &&
                !e.target.closest(".btn-a") &&
                !e.target.closest(".btn-b")
            ) {
                setAuthContain(false);
            }
        };

        window.addEventListener("click", closeAuth);

        // Cleanup function to remove the event listener
        return () => {
            window.removeEventListener("click", closeAuth);
        };
    }, [authContain]); // Add dependencies to effect

    const mediaImages = [imgLink, imgLink, imgLink, logoLink];

    const mediaVideos = ["", ""];

    // write use-effect to select first image/video
    useEffect(() => {
        if (mediaImages) {
            setSelectedMedia({ url: mediaImages[0], type: "img" });
        }
    }, []);

    const thumbNailsImage = mediaImages.map((t, i) => (
        <li key={i}>
            <img
                src={t}
                alt="thumbNails"
                onClick={() => selectMedia({ url: t, type: "img" })}
            />
        </li>
    ));

    const thumbNailsVideo = mediaVideos.map((t, i) => (
        <li key={i}>
            <video
                poster="/poster.png"
                controls
                onClick={() => selectMedia({ url: t, type: "video" })}>
                <source src={selectedMedia.url} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </li>
    ));

    const rulesList = rules?.map((r, i) => (
        <li key={i}>
            {i + 1}. {r}
        </li>
    ));
    const reasonsList = reasons?.map((r, i) => (
        <li key={i}>
            <GoDotFill size={10} />
            <span>{r}</span>
        </li>
    ));
    const featuresList = features?.map((r, i) => (
        <li key={i}>
            <GoDotFill size={10} />
            <span>{r}</span>
        </li>
    ));

    const selectMedia = ({ url, type }) => {
        setSelectedMedia({ url, type });
    };

    const joinCommunity = async () => {
        if (!user) {
            toast.error("You need to login to join a community");

            setAuthContain(true);
        }
    };

    return (
        <div className={`community ${isMobile ? "" : "desktopView"}`}>
            <div className="mobileView">
                <h1>{title}</h1>

                <div className="mediaContainer">
                    <div
                        className={`${
                            isMobile ? "mediaDisplay" : "desktopMediaDisplay"
                        }`}>
                        {selectedMedia.type === "img" && (
                            <img src={selectedMedia.url} />
                        )}
                        {selectedMedia.type === "video" && (
                            <video controls>
                                <source
                                    src={selectedMedia.url}
                                    type="video/mp4"
                                />
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </div>

                    <ul className="thumbNails">
                        {thumbNailsImage}
                        {thumbNailsVideo}
                    </ul>

                    <ul className="communityInfo">
                        <li>
                            <CiLock size={20} />
                            <span>Private</span>
                        </li>
                        <li>
                            <HiOutlineUsers size={20} />
                            <span>{members} members</span>
                        </li>
                        <li>
                            <GoTag size={20} />
                            <span>{price}</span>
                        </li>
                        <li>
                            <FaRegCircleUser size={20} />
                            <span>{creatorName}</span>
                            <FaStar size={20} className="star" />
                        </li>
                    </ul>

                    {isMobile && (
                        <button className="btn-a" onClick={joinCommunity}>
                            JOIN GROUP
                        </button>
                    )}
                </div>

                <div className="communityMore">
                    <p>Click the Join Group button to join this community</p>
                    <p>This group is created by {creatorName}</p>

                    {/* community rules */}
                    <div>
                        <h4>COMMUNITY RULES:</h4>
                        <ul>{rulesList}</ul>
                    </div>

                    {/* community reasons */}
                    <div>
                        <h4>REASONS TO JOIN:</h4>
                        <ul>{reasonsList}</ul>
                    </div>

                    {/* community features */}
                    <div>
                        <h4>COMMUNITY FEATURES:</h4>
                        <ul>{featuresList}</ul>
                    </div>
                </div>
            </div>

            {!isMobile && (
                <div className="community-card">
                    <img src={communityBg} />

                    <div>
                        <h4>{title}</h4>
                        <p>{description}</p>
                        <strong>{category}</strong>

                        <div>
                            <div>
                                <b>{members}</b> members
                            </div>
                            <div>
                                <b>10</b> online
                            </div>
                        </div>

                        <button className="btn-a" onClick={joinCommunity}>
                            JOIN GROUP
                        </button>
                    </div>
                </div>
            )}

            {/* auth container */}
            {authContain && <Auth setAuthContain={setAuthContain} />}
        </div>
    );
};

export const CommunityName = () => {
    const { useNavigate } = useReactRouter();

    const { oneCommunity } = generateCommunities();

    const { communityLogo, title } = oneCommunity || {};

    const navigate = useNavigate();

    const goBack = () => {
        navigate("/");
    };

    return (
        <div className="communityNav">
            <button onClick={goBack}>
                <IoArrowBackCircleSharp size={30} className="icon" />
            </button>

            <img src={communityLogo} alt="community logo" />
            <span>{title}</span>
        </div>
    );
};

export default CommunityView;
