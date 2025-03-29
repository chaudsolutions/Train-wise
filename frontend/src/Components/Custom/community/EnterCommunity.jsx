import { useReactRouter } from "../../Hooks/useReactRouter";
import { LinkOne } from "../Buttons/LinkBtn";
import CourseStockImg from "../../../assets/courseStock.png";

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

export const CommunityClassroom = ({
    isCommunityAdmin,
    communityId,
    courses,
    coursesWatched,
}) => {
    const { Link } = useReactRouter();

    const getThumbnailUrl = (videos) => {
        if (videos && videos.length > 0) {
            const firstVideoUrl = videos[0];
            console.log(firstVideoUrl);

            // List of common video extensions to replace
            const videoExtensions = [
                ".mp4",
                ".mov",
                ".avi",
                ".mkv",
                ".webm",
                ".flv",
                ".wmv",
                ".mpeg",
                ".mpg",
                ".3gp",
            ];

            // Create a regex pattern that matches any of the video extensions
            const videoPattern = new RegExp(
                `(${videoExtensions.join("|")})$`,
                "i" // case insensitive flag
            );

            // Replace the video extension with .jpg
            return firstVideoUrl.replace(videoPattern, ".jpg");
        }
        // Fallback placeholder image
        return CourseStockImg;
    };

    const getProgress = (course) => {
        if (!coursesWatched || !course?.videos) return 0;

        // Find the course in coursesWatched
        const courseWatched = coursesWatched.find(
            (cw) => cw.courseId.toString() === course._id.toString()
        );

        if (!courseWatched || !courseWatched.videos) return 0;

        // Calculate progress
        const totalVideos = course.videos.length;
        const watchedVideos = courseWatched.videos.length;
        const progress = (watchedVideos / totalVideos) * 100;

        return Math.round(progress); // Round to the nearest integer
    };

    return (
        <div className="classroom-view">
            <p>Here you can access all the courses and learning materials.</p>

            {courses && courses.length > 0 ? (
                <div className="course-list">
                    {courses.map((course) => (
                        <div key={course._id} className="course-card">
                            {/* Video Placeholder */}
                            <div className="video-placeholder">
                                <img
                                    src={getThumbnailUrl(course?.videos)}
                                    alt="Course Thumbnail"
                                />
                            </div>

                            {/* Course Details */}
                            <div className="course-details">
                                <h4 className="course-name">{course.name}</h4>
                                <p className="course-duration">
                                    Duration: {course?.duration} weeks
                                </p>
                                <div className="progress-container">
                                    <div className="progress-bar">
                                        <div
                                            className="progress"
                                            style={{
                                                width: `${getProgress(
                                                    course
                                                )}%`,
                                            }} // Example progress (60%)
                                        ></div>
                                    </div>
                                    <span className="progress-text">
                                        {getProgress(course)}% Complete
                                    </span>
                                </div>
                            </div>

                            {/* Link to Course */}
                            <Link
                                to={`/course/${course._id}/community/${communityId}`}
                                className="course-link">
                                View Course
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No courses available yet</p>
            )}

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
