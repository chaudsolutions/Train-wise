import axios from "axios";
import { localStorageToken, serVer } from "../Components/Hooks/useVariable";

const ERROR_STORAGE_KEY = "pendingErrorLogs";
const MAX_RETRIES = 5;
const RETRY_DELAY = 60 * 5000; // 5 seconds

const logError = async (errorData) => {
    const token = localStorage.getItem(localStorageToken);

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
        storeError(payload);
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

const storeError = (error) => {
    const errors = JSON.parse(localStorage.getItem(ERROR_STORAGE_KEY) || "[]");

    // Limit to 50 errors max
    if (errors.length >= 50) {
        errors.shift(); // Remove oldest error
    }

    errors.push(error);
    localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(errors));
};

const retryPendingErrors = async () => {
    const pendingErrors = JSON.parse(
        localStorage.getItem(ERROR_STORAGE_KEY) || "[]"
    );
    const successful = [];
    const failed = [];

    for (const error of pendingErrors) {
        try {
            if (error.attempts < MAX_RETRIES) {
                // Exponential backoff: delay = 2^attempts * 1000 ms
                const delay = Math.pow(2, error.attempts) * 1000;
                await new Promise((resolve) => setTimeout(resolve, delay));

                await sendError(error);
                successful.push(error);
            } else {
                failed.push(error);
                console.warn("Max retries exceeded for error:", error);
                localStorage.removeItem(ERROR_STORAGE_KEY);
            }
        } catch (e) {
            failed.push(error);
        }
    }

    // Update storage with only failed attempts
    localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(failed));

    return successful.length;
};

// Initialize global error handlers
export const initErrorLogging = () => {
    // Initial retry on load
    retryPendingErrors();

    // Retry when coming online
    window.addEventListener("online", retryPendingErrors);

    // Regular retry every 5 minutes
    setInterval(retryPendingErrors, RETRY_DELAY);

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
