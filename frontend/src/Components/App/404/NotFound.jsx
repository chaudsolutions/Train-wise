import "./notfound.css";
import { useEffect } from "react";
import { useReactRouter } from "../../Hooks/useReactRouter";

const NotFound = () => {
    // scroll up
    useEffect(() => {
        window.scroll(0, 0);
    }, []);

    const { useNavigate } = useReactRouter();

    const navigate = useNavigate();

    const goHome = () => {
        navigate("/");
    };

    return (
        <main className="not-found">
            <img src="/logo.png" alt="logo" height={100} />

            <div>
                <h1>404 Not Found</h1>
                <p>Sorry, this page does not exist.</p>
            </div>

            <button onClick={goHome}>Back to Home</button>
        </main>
    );
};

export default NotFound;
