import { useEffect, useState } from "react";
import { Fab, Zoom } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const ScrollToTopBtn = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled down
    const checkScroll = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Scroll to top handler
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        window.addEventListener("scroll", checkScroll);
        return () => window.removeEventListener("scroll", checkScroll);
    }, []);

    return (
        <Zoom in={isVisible}>
            <Fab
                color="primary"
                aria-label="scroll to top"
                size="small"
                onClick={scrollToTop}
                sx={{
                    position: "fixed",
                    bottom: 100,
                    right: 20,
                    width: 50,
                    height: 50,
                }}>
                <KeyboardArrowUpIcon />
            </Fab>
        </Zoom>
    );
};

export default ScrollToTopBtn;
