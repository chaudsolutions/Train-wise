import { useState } from "react";
import PageLoader from "../../../Animations/PageLoader";
import {
    useCommunitySingleCourseData,
    useUserData,
} from "../../../Hooks/useQueryFetch/useQueryData";
import { useReactRouter } from "../../../Hooks/useReactRouter";
import "./Classroom.css"; // Create this CSS file
import axios from "axios";
import { serVer, useToken } from "../../../Hooks/useVariable";
import toast from "react-hot-toast";

const Classroom = () => {
    const { token } = useToken();
    const { useParams } = useReactRouter();
    const { communityId, courseId } = useParams();
    const { singleCourseData, isSingleCourseLoading } =
        useCommunitySingleCourseData({ communityId, courseId });

    const { userData, isUserDataLoading, refetchUserData } = useUserData();

    const { coursesWatched } = userData || {};

    // get current course from user data
    const currentCourse = coursesWatched?.find(
        (course) => course?.courseId === courseId
    );

    const [selectedVideo, setSelectedVideo] = useState(0);

    // Video protection - disable right click and context menu
    const handleContextMenu = (e) => {
        e.preventDefault();
    };

    // Mark video as watched when playback ends
    const handleVideoEnd = async () => {
        // Logic to mark video as watched in backend
        console.log(`Video ${selectedVideo} completed`);

        console.log(currentCourse?.videos?.includes(selectedVideo.toString()));

        if (currentCourse?.videos?.includes(selectedVideo.toString())) {
            return console.log("watched");
        }

        try {
            const res = await axios.put(
                `${serVer}/user/community/${communityId}/course/${courseId}/${selectedVideo}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const { data } = res;

            toast.success(data);

            refetchUserData();
        } catch (error) {
            console.error("Error marking video as watched:", error);
        }
    };

    if (isSingleCourseLoading || isUserDataLoading) {
        return <PageLoader />;
    }

    console.log({ currentCourse });

    return (
        <div className="classroom-container">
            <div className="classroom-header">
                <h1>{singleCourseData?.name}</h1>
                <p>Duration: {singleCourseData?.duration} weeks</p>
            </div>

            <div className="classroom-content">
                {/* Main Video Player (60% on desktop, 100% on mobile) */}
                <div className="video-player">
                    {singleCourseData?.videos?.length > 0 && (
                        <video
                            controls
                            key={selectedVideo}
                            controlsList="nodownload"
                            disablePictureInPicture
                            onContextMenu={handleContextMenu}
                            onEnded={handleVideoEnd}>
                            <source
                                src={singleCourseData.videos[selectedVideo]}
                                type="video/mp4"
                            />
                            Your browser does not support the video tag.
                        </video>
                    )}

                    {/* Video navigation buttons */}
                    <div className="d-flex align-items-center justify-content-between mt-2">
                        <button
                            className="btn btn-info"
                            disabled={selectedVideo === 0}
                            onClick={() =>
                                setSelectedVideo((prev) => prev - 1)
                            }>
                            Previous
                        </button>
                        <button
                            className="btn btn-success"
                            disabled={
                                selectedVideo ===
                                singleCourseData?.videos?.length - 1
                            }
                            onClick={() =>
                                setSelectedVideo((prev) => prev + 1)
                            }>
                            Next
                        </button>
                    </div>
                </div>

                {/* Video Sidebar (desktop) */}
                <div className="video-sidebar">
                    <h3>Course Videos</h3>
                    <ul>
                        {singleCourseData?.videos?.map((video, index) => (
                            <li
                                key={index}
                                className={
                                    selectedVideo === index ? "active" : ""
                                }
                                onClick={() => setSelectedVideo(index)}>
                                Video {index + 1}{" "}
                                {currentCourse?.videos?.includes(
                                    selectedVideo.toString()
                                ) && <small>watched</small>}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Classroom;
