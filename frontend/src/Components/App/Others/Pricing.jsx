import { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useAuthContext } from "../../Context/AuthContext";
import { useReactRouter } from "../../Hooks/useReactRouter";
import toast from "react-hot-toast";
import { redirectSessionKey } from "../../Hooks/useVariable";

const Pricing = () => {
    useEffect(() => {
        window.scroll(0, 0); // scroll to top on component mount
    }, []);

    const { useNavigate } = useReactRouter();

    const navigate = useNavigate();

    const { user } = useAuthContext();

    const features = [
        `1 group`,
        `All features`,
        `Unlimited courses`,
        `Unlimited members`,
        `2.0% transaction fee`,
    ];

    const subscribe = async () => {
        // redirect to login if user is not logged in
        if (!user) {
            toast.error("Login In to Subscribe");

            // save pricing page to session and redirect once user logs in
            sessionStorage.setItem(redirectSessionKey, location.pathname);

            navigate("/login");
        } else {
            // run subscription function
        }
    };

    return (
        <div className="home">
            <header>
                <h1>Simple Pricing</h1>
                <p>
                    1 plan with everything included. No hidden fees. Get started
                    with a 3-day free trial. Cancel anytime.
                </p>
            </header>

            <div className="pricing-card">
                <h2>$99/month</h2>

                <ul>
                    {features.map((f, i) => (
                        <li key={i}>
                            <FaCheckCircle size={25} className="icon" />
                            <div>
                                <b>{f.split(" ")[0]}</b>{" "}
                                <span>
                                    {f.split(" ").slice(1, 3).join(" ")}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>

                <button onClick={subscribe} className="btn-a">
                    Subscribe
                </button>
            </div>
        </div>
    );
};

export default Pricing;
