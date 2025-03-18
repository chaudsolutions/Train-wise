import { useEffect, useState } from "react";
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
import { redirectSessionKey, serVer, useToken } from "../../Hooks/useVariable";
import {
    useCommunityByIdData,
    useUserData,
} from "../../Hooks/useQueryFetch/useQueryData";
import PageLoader from "../../Animations/PageLoader";
import ButtonLoad from "../../Animations/ButtonLoad";
import axios from "axios";

const CommunityView = () => {
    const [selectedMedia, setSelectedMedia] = useState({ url: "", type: "" });
    const [authContain, setAuthContain] = useState(false);
    const [isBtn, setIsBtn] = useState(false);

    const { user } = useAuthContext();

    const { token } = useToken();

    const { useParams, useNavigate } = useReactRouter();

    const navigate = useNavigate();

    const { communityId } = useParams();

    const { isMobile } = useResponsive();

    const { community, isCommunityLoading, refetchCommunity } =
        useCommunityByIdData({
            id: communityId,
        });

    const { userData, isUserDataLoading } = useUserData();

    const {
        name,
        description,
        category,
        rules,
        visions,
        subscriptionFee,
        bannerImage,
        members,
        createdBy,
    } = community?.community || {};

    const { _id } = userData || {};

    // check if user is part of community
    const isUserMember =
        members?.some((member) => member.userId === _id) || createdBy === _id;

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
    const reasonsList = visions?.map((r, i) => (
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

            // save community page to session and redirect once user logs in
            sessionStorage.setItem(redirectSessionKey, location.pathname);

            return setAuthContain(true);
        }

        // enter group direct if user is a member
        if (isUserMember) {
            return navigate(`/community/access/${communityId}`);
        }

        setIsBtn(true);

        if (subscriptionFee === 0) {
            // join directly
            try {
                const res = await axios.put(
                    `${serVer}/user/joinCommunity/${communityId}`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                toast.success(res.data);

                refetchCommunity();

                navigate(`/community/${communityId}/${user}`);
            } catch (error) {
                toast.error("Failed to join community. Please try again.");
                console.error("Error joining community:", error);
            } finally {
                setIsBtn(false);
            }
        } else {
            // handle payment if joining community is not free
            try {
                toast.error("Payment method coming soon");
            } catch (error) {
                toast.error("Failed to handle payment. Please try again.");
                console.error("Error handling payment:", error);
            } finally {
                setIsBtn(false);
            }
        }
    };

    // delete community
    const handleDeleteCom = async () => {
        if (
            !window.confirm("Are you sure you want to delete this community?")
        ) {
            return;
        }

        setIsBtn(true);
        try {
            const res = await axios.delete(
                `${serVer}/creator/delete-community/${communityId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            toast.success(res.data);

            navigate("/");
        } catch (error) {
            toast.error("Failed to delete community. Please try again.");
            console.error("Error deleting community:", error);
        } finally {
            setIsBtn(false);
        }
    };

    if (isCommunityLoading || isUserDataLoading) {
        return <PageLoader />;
    }

    return (
        <div className={`community ${isMobile ? "" : "desktopView"}`}>
            <div className="mobileView">
                <h1>{name}</h1>

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
                            <span>{members?.length} members</span>
                        </li>
                        <li>
                            <GoTag size={20} />
                            <span>
                                {subscriptionFee
                                    ? `$${subscriptionFee}/Month`
                                    : "Free"}
                            </span>
                        </li>
                        <li>
                            <FaRegCircleUser size={20} />
                            <span>
                                {createdBy === _id
                                    ? "You"
                                    : community.creatorName}
                            </span>
                            <FaStar size={20} className="star" />
                        </li>
                    </ul>

                    {isMobile && (
                        <>
                            <button className="btn-a" onClick={joinCommunity}>
                                {isBtn ? (
                                    <ButtonLoad />
                                ) : (
                                    <>
                                        {isUserMember
                                            ? "Explore Group"
                                            : "JOIN GROUP"}
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>

                <div className="communityMore">
                    <p>Click the Join Group button to join this community</p>
                    <p>This group is created by {community?.creatorName}</p>

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
                </div>

                {createdBy === _id && (
                    <button
                        className="btn btn-warning"
                        onClick={handleDeleteCom}>
                        {isBtn ? <ButtonLoad /> : <>Delete Community</>}
                    </button>
                )}
            </div>

            {!isMobile && (
                <div className="community-card">
                    <img src={bannerImage} />

                    <div>
                        <h4>{name}</h4>
                        <p>{description}</p>
                        <strong>{category || ""}</strong>

                        <div>
                            <div>
                                <b>{members?.length}</b> members
                            </div>
                            <div>
                                <b>10</b> online
                            </div>
                        </div>

                        <button className="btn-a" onClick={joinCommunity}>
                            {isBtn ? (
                                <ButtonLoad />
                            ) : (
                                <>
                                    {isUserMember
                                        ? "Explore Group"
                                        : "JOIN GROUP"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* auth container */}
            {authContain && (
                <Auth
                    setAuthContain={setAuthContain}
                    authContain={authContain}
                />
            )}
        </div>
    );
};

export const CommunityName = () => {
    const { useNavigate } = useReactRouter();

    const communityId = location.pathname.split("/")[3];

    const { community, isCommunityLoading } = useCommunityByIdData({
        id: communityId,
    });

    const { name, logo } = community?.community || {};

    const navigate = useNavigate();

    const goBack = () => {
        navigate("/");
    };

    return (
        <div className="communityNav">
            <button onClick={goBack}>
                <IoArrowBackCircleSharp size={30} className="icon" />
            </button>

            {isCommunityLoading ? (
                <ButtonLoad />
            ) : (
                <>
                    <img src={logo} alt="community logo" />
                    <span>{name}</span>
                </>
            )}
        </div>
    );
};

export default CommunityView;
