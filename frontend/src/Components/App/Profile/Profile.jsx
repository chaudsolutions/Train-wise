import { GoDotFill } from "react-icons/go";
import PageLoader from "../../Animations/PageLoader";
import { UserProfile } from "../../Custom/Nav/NavSlide";
import { useUserData } from "../../Hooks/useQueryFetch/useQueryData";
import "./profile.css";
import { LinkOne } from "../../Custom/Buttons/LinkBtn";

const Profile = () => {
    const { userData, isUserDataLoading } = useUserData();

    const { createdAt, role } = userData || {};

    if (isUserDataLoading) {
        return <PageLoader />;
    }

    console.log({ userData });

    return (
        <div className="profile container mt-4 row row-cols-2 gap-4">
            <div className="profileCon border p-2 rounded d-flex flex-column align-items-center gap-4">
                <UserProfile />

                <button className="btn btn-success">EDIT PROFILE</button>

                <div>
                    <div>
                        <GoDotFill size={30} color="green" />
                        Online Now
                    </div>
                    <div>Joined {new Date(createdAt)?.toDateString()}</div>
                </div>
            </div>

            <div className="profileAct border p-2 rounded d-flex flex-column gap-4">
                <h5>Communities</h5>

                {/* membership list here for users and community owned by creator here */}

                {role === "creator" && (
                    <LinkOne
                        linkDetails={[
                            {
                                name: "Create a Community",
                                url: "/create-a-community",
                            },
                        ]}
                    />
                )}
            </div>
        </div>
    );
};

export default Profile;
