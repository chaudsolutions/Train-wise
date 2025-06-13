// import Hero from "../../Custom/home/Hero";
import SectionOne from "../../Custom/home/SectionOne";
import CoursesSection from "../../Custom/home/CoursesSection";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
// import AboutSection from "../../Custom/home/AboutSection";
import {
    Dialog,
    Slide,
    Button,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
} from "@mui/material";
import IllustrationImg from "../../../assets/illustration.png";

const Transition = (props) => {
    return <Slide direction="left" {...props} />;
};

const Home = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            // Only show if user hasn't seen it before
            if (!localStorage.getItem("hasSeenTutorialPrompt")) {
                setOpenDialog(true);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setOpenDialog(false);
        localStorage.setItem("hasSeenTutorialPrompt", "true");
    };

    const handleLearn = () => {
        handleClose();
        navigate("/tutorial");
    };

    return (
        <>
            <SectionOne />
            <CoursesSection />
            {/* <Hero /> */}
            {/* <AboutSection /> */}

            <Dialog
                open={openDialog}
                TransitionComponent={Transition}
                onClose={handleClose}
                maxWidth="xs">
                <DialogTitle>New to our platform?</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Get started by learning how to create your own community
                        or join an existing one.
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 2,
                        }}>
                        <img
                            src={IllustrationImg}
                            alt="Community illustration"
                            width="150"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Maybe later
                    </Button>
                    <Button
                        onClick={handleLearn}
                        variant="contained"
                        color="primary"
                        sx={{ fontWeight: 600 }}>
                        Learn How
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Home;
