import { useEffect, useState } from "react";
import { Logo } from "../Nav/Nav";
import "./auth.css";
import { companyName } from "../../Hooks/useVariable";
import { LoginForm, RegisterForm } from "../Forms/Forms";

const Auth = ({ setAuthContain, authContain }) => {
    const [view, setView] = useState("login");

    useEffect(() => {
        const closeAuth = (e) => {
            if (
                authContain &&
                !e.target.closest(".auth") &&
                !e.target.closest(".btn-b") &&
                !e.target.closest(".btn-a") &&
                !e.target.closest(".toggle") &&
                !e.target.closest("button")
            ) {
                setAuthContain(false);
            }
        };

        window.addEventListener("click", closeAuth);

        // Cleanup function to remove the event listener
        return () => {
            window.removeEventListener("click", closeAuth);
        };
    }, [authContain, setAuthContain]); // Add dependencies to effect

    return (
        <div className="auth">
            <Logo />
            <h2>
                {view === "login" && <>Log in to {companyName}</>}
                {view === "register" && <>Create your {companyName} account</>}
            </h2>

            {view === "login" && (
                <LoginForm setAuthContainer={setAuthContain} />
            )}
            {view === "register" && (
                <RegisterForm setAuthContainer={setAuthContain} />
            )}

            <p>
                Don&apos;t have an account?{" "}
                {view === "login" && (
                    <button
                        className="btn-b"
                        onClick={() => setView("register")}>
                        Sign up for free
                    </button>
                )}
                {view === "register" && (
                    <button className="btn-b" onClick={() => setView("login")}>
                        Login
                    </button>
                )}
            </p>
        </div>
    );
};

export default Auth;
