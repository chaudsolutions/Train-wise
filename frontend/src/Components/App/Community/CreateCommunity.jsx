import axios from "axios";
import "./createCommunity.css";
import { useForm } from "react-hook-form";
import { useReactRouter } from "../../Hooks/useReactRouter";
import ButtonLoad from "../../Animations/ButtonLoad";
import toast from "react-hot-toast";
import { serVer, useToken } from "../../Hooks/useVariable";

const CreateCommunity = () => {
    const { useNavigate } = useReactRouter();

    const { token } = useToken();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            // Combine rules and visions into arrays
            const rules = [data.rule1, data.rule2, data.rule3];
            const visions = [data.vision1, data.vision2, data.vision3];

            // Prepare the data for submission
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("description", data.description);
            formData.append("subscriptionFee", data.subscriptionFee);
            rules.forEach((rule, index) =>
                formData.append(`rules[${index}]`, rule)
            );
            visions.forEach((vision, index) =>
                formData.append(`visions[${index}]`, vision)
            );
            formData.append("bannerImage", data.image1[0]); // Banner image
            formData.append("logo", data.image2[0]); // Logo

            // API call to create a community
            const response = await axios.post(
                `${serVer}/creator/create-community`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const communityId = response.data._id;

            // Navigate to the newly created community
            navigate(`/community/${communityId}`);

            toast.success("Community created successfully");
        } catch (error) {
            console.error("Error creating community:", error);
            toast.error("Failed to create community. Please try again.");
        }
    };

    return (
        <div className="create-community-container">
            <h1 className="text-center mb-4">Create a New Community</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="community-form">
                {/* Community Name */}
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                        Community Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        {...register("name", {
                            required: "Community name is required",
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

                {/* Community Description */}
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                        Description
                    </label>
                    <textarea
                        id="description"
                        {...register("description", {
                            required: "Description is required",
                        })}
                        className={`form-control ${
                            errors.description ? "is-invalid" : ""
                        }`}
                        rows="4"
                    />
                    {errors.description && (
                        <div className="invalid-feedback">
                            {errors.description.message}
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="subscriptionFee" className="form-label">
                        Monthly Subscription Fee
                    </label>
                    <input
                        placeholder="0 if free"
                        type="number"
                        id="subscriptionFee"
                        {...register("subscriptionFee", {
                            required: "Subscription Fee is required",
                        })}
                        className={`form-control ${
                            errors.subscriptionFee ? "is-invalid" : ""
                        }`}
                    />
                    {errors.subscriptionFee && (
                        <div className="invalid-feedback">
                            {errors.subscriptionFee.message}
                        </div>
                    )}
                </div>

                {/* Community Rules */}
                <div className="mb-3">
                    <label className="form-label">Rules</label>
                    {[1, 2, 3].map((index) => (
                        <div key={index} className="mb-2">
                            <input
                                type="text"
                                id={`rule${index}`}
                                {...register(`rule${index}`, {
                                    required: `Rule ${index} is required`,
                                })}
                                className={`form-control ${
                                    errors[`rule${index}`] ? "is-invalid" : ""
                                }`}
                                placeholder={`Rule ${index}`}
                            />
                            {errors[`rule${index}`] && (
                                <div className="invalid-feedback">
                                    {errors[`rule${index}`].message}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Community Visions */}
                <div className="mb-3">
                    <label className="form-label">Visions</label>
                    {[1, 2, 3].map((index) => (
                        <div key={index} className="mb-2">
                            <input
                                type="text"
                                id={`vision${index}`}
                                {...register(`vision${index}`, {
                                    required: `Vision ${index} is required`,
                                })}
                                className={`form-control ${
                                    errors[`vision${index}`] ? "is-invalid" : ""
                                }`}
                                placeholder={`Vision ${index}`}
                            />
                            {errors[`vision${index}`] && (
                                <div className="invalid-feedback">
                                    {errors[`vision${index}`].message}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Image Uploads */}
                <div className="mb-3">
                    <label htmlFor="image1" className="form-label">
                        Community Banner Image
                    </label>
                    <input
                        type="file"
                        id="image1"
                        {...register("image1", {
                            required: "Banner image is required",
                        })}
                        className={`form-control ${
                            errors.image1 ? "is-invalid" : ""
                        }`}
                        accept="image/*"
                    />
                    {errors.image1 && (
                        <div className="invalid-feedback">
                            {errors.image1.message}
                        </div>
                    )}
                </div>

                <div className="mb-3">
                    <label htmlFor="image2" className="form-label">
                        Community Logo
                    </label>
                    <input
                        type="file"
                        id="image2"
                        {...register("image2", {
                            required: "Logo is required",
                        })}
                        className={`form-control ${
                            errors.image2 ? "is-invalid" : ""
                        }`}
                        accept="image/*"
                    />
                    {errors.image2 && (
                        <div className="invalid-feedback">
                            {errors.image2.message}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="text-center">
                    <button type="submit" className="btn btn-primary">
                        {isSubmitting ? <ButtonLoad /> : <>Create Community</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCommunity;
