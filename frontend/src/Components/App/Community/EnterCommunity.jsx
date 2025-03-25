import { useState } from "react";
import "./enterCommunity.css"; // Custom CSS for additional styling
import { useReactRouter } from "../../Hooks/useReactRouter";
import {
    useCommunityByIdData,
    useCommunityCoursesData,
    useUserData,
} from "../../Hooks/useQueryFetch/useQueryData";
import PageLoader from "../../Animations/PageLoader";
import useResponsive from "../../Hooks/useResponsive";
import {
    CommunityClassroom,
    CommunityOverview,
} from "../../Custom/community/EnterCommunity";

const EnterCommunity = () => {
    const [activeTab, setActiveTab] = useState("community"); // State to manage active tab

    // Tabs for switching displays
    const tabs = [
        { id: "community", label: "Community" },
        { id: "classroom", label: "Classroom" },
        { id: "about", label: "About" },
        { id: "members", label: "Members" },
    ];

    const { isMobile } = useResponsive();

    const { useParams } = useReactRouter();

    const { communityId } = useParams();

    const { userData, isUserDataLoading } = useUserData();

    const { community, isCommunityLoading } = useCommunityByIdData({
        id: communityId,
    });

    const { coursesData, isCoursesLoading } = useCommunityCoursesData({
        id: communityId,
    });

    const {
        name,
        logo,
        category,
        description,
        bannerImage,
        members,
        createdBy,
        createdAt,
        notifications,
    } = community?.community || {};

    const { _id, coursesWatched } = userData || {};

    const { courses } = coursesData || {};

    const isCommunityAdmin = createdBy === _id;

    if (isCommunityLoading || isUserDataLoading || isCoursesLoading) {
        return <PageLoader />;
    }

    return (
        <div className="m-2 d-flex gap-5">
            <div className="container enter-community">
                {/* Header with community name and logo */}
                <header className="community-header">
                    <img
                        src={logo}
                        alt="Community Logo"
                        className="community-logo"
                    />
                    <h1 className="community-name">{name}</h1>
                </header>

                {/* Tabs for switching displays */}
                <nav className="tabs overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-button ${
                                activeTab === tab.id ? "active" : ""
                            }`}
                            onClick={() => setActiveTab(tab.id)}>
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Main content based on active tab */}
                <main className="main-content">
                    {activeTab === "community" && (
                        <CommunityOverview
                            createdAt={createdAt}
                            notifications={notifications}
                        />
                    )}

                    {activeTab === "classroom" && (
                        <CommunityClassroom
                            isCommunityAdmin={isCommunityAdmin}
                            communityId={communityId}
                            courses={courses}
                            coursesWatched={coursesWatched}
                        />
                    )}

                    {activeTab === "about" && (
                        <div className="about-view">
                            <h3>About</h3>
                            <p>
                                Learn more about this community and its goals.
                            </p>
                        </div>
                    )}

                    {activeTab === "members" && (
                        <div className="members-view">
                            <h3>Members</h3>
                            <p>
                                View and connect with other members of the
                                community.
                            </p>
                        </div>
                    )}
                </main>
            </div>

            {!isMobile && (
                <div className="community-card w-25">
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnterCommunity;
