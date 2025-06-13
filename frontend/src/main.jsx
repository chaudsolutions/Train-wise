import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContextProvider } from "./Components/Context/AuthContext.jsx";
import { ScrollToTop } from "./Components/Custom/Scroll/ScrollToTop.jsx";
import { initErrorLogging } from "./utils/logger.js";

const queryClient = new QueryClient();

// Initialize error logging
initErrorLogging();

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthContextProvider>
                <BrowserRouter>
                    <ScrollToTop />
                    <App />
                </BrowserRouter>
            </AuthContextProvider>
        </QueryClientProvider>
    </StrictMode>
);
