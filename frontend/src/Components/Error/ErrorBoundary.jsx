import { Component } from "react";
import Footer from "../Custom/Footer/Footer";
import "./errorBoundary.css";
import Null from "../Animations/Null";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            //   reload function
            const reloadPage = () => {
                window.location.reload(true);
            };
            //   go back home function
            const goHome = () => {
                window.location.href = "/";
            };

            return (
                <div className="errorBoundary">
                    <Null />
                    <div className="errorInfo">
                        <h1>Something went wrong.</h1>
                        <div className="errorInfoBtn">
                            <button onClick={reloadPage}>Reload</button>
                            <strong>OR</strong>
                            <button onClick={goHome}>Back to Home</button>
                        </div>
                        <div className="errorReport">
                            <p>
                                Critical? Click below to report and submit error
                                log
                            </p>
                            <p>{this.state.error?.toString()}</p>
                            {/* <form>
                <textarea placeholder="Optional message describing error and experience" />
                <button type="submit">REPORT</button>
              </form> */}
                        </div>
                    </div>
                    <Footer />
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
