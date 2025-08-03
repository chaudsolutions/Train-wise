import axios from "axios";
import { serVer } from "../Components/Hooks/useVariable";
import { getToken } from "../Components/Hooks/useFetch";

const logError = async (errorData) => {
    const token = getToken();

    const payload = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userToken: token ? token : undefined,
        ...errorData,
        error: {
            name: errorData.error?.name,
            message: errorData.error?.message,
            stack: errorData.error?.stack,
        },
        attempts: 0,
    };

    try {
        // 1. Console output (development)
        if (import.meta.env.VITE_ENV === "development") {
            console.error("Error Logged:", payload);
        }

        // Try to send immediately
        await sendError(payload);
    } catch (e) {
        // If fails, store for retry later
        console.log(e);
    }
};

const sendError = async (error) => {
    try {
        // 2. Send to backend API
        await axios.post(`${serVer}/api/log-error`, error);

        return true;
    } catch (apiError) {
        error.attempts = (error.attempts || 0) + 1;
        throw apiError;
    }
};

// Initialize global error handlers
export const initErrorLogging = () => {
    // Window errors
    window.onerror = (message, source, lineno, colno, error) => {
        logError({
            error: error || new Error(message),
            type: "global",
            location: source,
            line: `${lineno}:${colno}`,
        });
    };

    // Unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
        logError({
            error: event.reason,
            type: "promise",
            message: "Unhandled promise rejection",
        });
    });
};

export default logError;
