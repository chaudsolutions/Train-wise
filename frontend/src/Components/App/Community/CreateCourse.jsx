import { useForm } from "react-hook-form";
import { useReactRouter } from "../../Hooks/useReactRouter";
import { serVer, useToken } from "../../Hooks/useVariable";
import ButtonLoad from "../../Animations/ButtonLoad";
import axios from "axios";
import toast from "react-hot-toast";

const CreateCourse = () => {
    const { useParams, useNavigate } = useReactRouter();

    const navigate = useNavigate();

    const { communityId } = useParams();

    const { token } = useToken();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const onSubmit = async (data) => {
        const formData = new FormData();

        // Append text fields
        formData.append("name", data.name);
        formData.append("duration", data.duration);

        // Append video files
        if (data.videos && data.videos.length > 0) {
            for (let i = 0; i < data.videos.length; i++) {
                formData.append("videos", data.videos[i]);
            }
        }

        try {
            const response = await axios.post(
                `${serVer}/creator/createCourse/${communityId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const { data } = response;

            toast.success(data);

            navigate(`/community/access/${communityId}`); // Redirect to the new course page
        } catch (error) {
            console.error("Error creating course:", error);
            alert("Failed to create course. Please try again.");
        }
    };

    return (
        <div className="create-community-container">
            <h1 className="text-center mb-4">Create a New Course</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="community-form">
                {/* Course Name */}
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                        Course Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        {...register("name", {
                            required: "Course name is required",
                        })}
                        className={`form-control ${
                            errors.name ? "is-invalid" : ""
                        }`}
                    />
                    {errors.name && (
                        <div className="invalid-feedback">
                            {errors.name.message}
                        </div>
                    )}
                </div>

                {/* Duration */}
                <div className="mb-3">
                    <label htmlFor="duration" className="form-label">
                        Duration (in weeks)
                    </label>
                    <select
                        id="duration"
                        {...register("duration", {
                            required: "Duration is required",
                        })}
                        className={`form-control ${
                            errors.duration ? "is-invalid" : ""
                        }`}>
                        <option value="">Select duration</option>
                        <option value="4">4 Weeks</option>
                        <option value="8">8 Weeks</option>
                        <option value="12">12 Weeks</option>
                    </select>
                    {errors.duration && (
                        <div className="invalid-feedback">
                            {errors.duration.message}
                        </div>
                    )}
                </div>

                {/* Video Uploads */}
                <div className="mb-3">
                    <label htmlFor="videos" className="form-label">
                        Course Videos
                    </label>
                    <input
                        type="file"
                        id="videos"
                        {...register("videos", {
                            required: "At least one video is required",
                        })}
                        className={`form-control ${
                            errors.videos ? "is-invalid" : ""
                        }`}
                        accept="video/*"
                        multiple // Allow multiple files
                    />
                    {errors.videos && (
                        <div className="invalid-feedback">
                            {errors.videos.message}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="text-center">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}>
                        {isSubmitting ? <ButtonLoad /> : "Create Course"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCourse;
