import { useState } from "react";
import { Logo } from "../Nav/Nav";
import "./auth.css";
import { companyName } from "../../Hooks/useVariable";
import { LoginForm, RegisterForm } from "../Forms/Forms";

const Auth = ({ setAuthContain }) => {
    const [view, setView] = useState("login");

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
