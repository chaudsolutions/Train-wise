import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import "./forms.css";
import {
    companyName,
    redirectSessionKey,
    serVer,
} from "../../Hooks/useVariable";
import { useAuthContext } from "../../Context/AuthContext";
import { useReactRouter } from "../../Hooks/useReactRouter";
import axios from "axios";

export const LoginForm = ({ setAuthContainer }) => {
    const { login } = useAuthContext();

    const { useNavigate } = useReactRouter();

    const navigate = useNavigate();

    // react form
    const form = useForm();
    const { register, handleSubmit, formState } = form;
    const { errors, isSubmitting } = formState;

    //  function to login
    const onSubmit = async (data) => {
        const url = `${serVer}/auth/login`;
        const { email, password } = data;

        try {
            const response = await axios.post(url, { email, password });

            if (response.status === 200) {
                //update the auth Context
                login(response.data);

                if (setAuthContainer) {
                    setAuthContainer(false);
                }

                toast.success(`Welcome back to ${companyName}`);

                // Check if there's a saved path
                const redirectPath = sessionStorage.getItem(redirectSessionKey);

                if (redirectPath) {
                    // Remove the saved path from local storage
                    sessionStorage.removeItem(redirectSessionKey);
                    // Redirect to the saved path
                    navigate(redirectPath);
                }
            } else {
                toast.error(response.data);
            }
        } catch (error) {
            const { response } = error;
            toast.error(response.data);
        }
    };

    const onError = () => {
        toast.error("Failed to submit, check inputs and try again");
    };

    return (
        <form
            className="auth-form"
            onSubmit={handleSubmit(onSubmit, onError)}
            noValidate>
            <div className="inputBox">
                <input
                    placeholder="Email"
                    required
                    type="email"
                    {...register("email", {
                        required: "Email is required",
                    })}
                />
                <p>{errors.email?.message}</p>
            </div>
            {/* Password input */}
            <div className="inputBox">
                <input
                    placeholder="Password"
                    required
                    type="password"
                    {...register("password", {
                        required: "Password is required",
                    })}
                />

                <p>{errors.password?.message}</p>
            </div>
            <button className="forgotPassBtn">forgot Password?</button>

            <button className="btn-a" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "" : <>LOGIN</>}
            </button>
        </form>
    );
};

export const RegisterForm = ({ setAuthContainer }) => {
    const { login } = useAuthContext();

    const { useNavigate } = useReactRouter();

    const navigate = useNavigate();

    // react form
    const form = useForm();
    const { register, handleSubmit, formState } = form;
    const { errors, isSubmitting } = formState;

    //  function to register
    const onSubmit = async (data) => {
        const url = `${serVer}/auth/register`;
        const { name, email, password } = data;

        try {
            const response = await axios.post(url, { name, email, password });

            if (response.status === 200) {
                //update the auth Context
                login(response.data);

                if (setAuthContainer) {
                    setAuthContainer(false);
                }

                toast.success(`Welcome back to ${companyName}`);

                // Check if there's a saved path
                const redirectPath = sessionStorage.getItem(redirectSessionKey);

                if (redirectPath) {
                    // Remove the saved path from local storage
                    sessionStorage.removeItem(redirectSessionKey);
                    // Redirect to the saved path
                    navigate(redirectPath);
                }
            } else {
                toast.error(response.data);
            }
        } catch (error) {
            const { response } = error;
            toast.error(response.data);
        }
    };

    const onError = () => {
        toast.error("Failed to submit, check inputs and try again");
    };

    return (
        <form
            className="auth-form"
            onSubmit={handleSubmit(onSubmit, onError)}
            noValidate>
            <div className="inputBox">
                <input
                    placeholder="Full Name"
                    required
                    type="text"
                    {...register("name", {
                        required: "Full Name is required",
                    })}
                />
                <p>{errors.name?.message}</p>
            </div>

            <div className="inputBox">
                <input
                    placeholder="Email"
                    required
                    type="email"
                    {...register("email", {
                        required: "Email is required",
                    })}
                />
                <p>{errors.email?.message}</p>
            </div>
            {/* Password input */}
            <div className="inputBox">
                <input
                    placeholder="Password"
                    required
                    type="password"
                    {...register("password", {
                        required: "Password is required",
                    })}
                />

                <p>{errors.password?.message}</p>
            </div>

            <button className="btn-a" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "" : <>LOGIN</>}
            </button>
        </form>
    );
};
