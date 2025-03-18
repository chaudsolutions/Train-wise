import { LinkOne } from "../Buttons/LinkBtn";

export const CommunityOverview = ({ notifications, createdAt }) => {
    return (
        <div className="community-view">
            {/* Admin Notifications */}
            <div className="notifications">
                <h3>Community Notifications</h3>
                <div className="notification-list">
                    <div className="notification">
                        <p className="message">Welcome to the community!</p>
                        <p className="timestamp">
                            {new Date(createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    {notifications?.length > 0 &&
                        notifications?.map((notification) => (
                            <div
                                key={notification?._id}
                                className="notification">
                                <p className="message">
                                    {notification?.message}
                                </p>
                                <p className="timestamp">
                                    {new Date(
                                        notification?.createdAt
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export const CommunityClassroom = ({ isCommunityAdmin, communityId }) => {
    return (
        <div className="classroom-view">
            <p>Here you can access all the courses and learning materials.</p>

            <ul>learning materials</ul>

            {/* button to add courses */}
            {isCommunityAdmin && (
                <div className="mt-5">
                    <LinkOne
                        linkDetails={[
                            {
                                name: "Add Course",
                                url: `/admin/add-course/${communityId}`,
                            },
                        ]}
                    />
                </div>
            )}
        </div>
    );
};
