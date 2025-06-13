import { useState } from "react";
import {
    Box,
    Tabs,
    Tab,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Button,
    Typography,
    Paper,
    useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Import images for create flow
import createAccountImg from "../../../assets/tutorial/login.png";
import createCommunityImg from "../../../assets/tutorial/create-community.png";
import fillCommunityImg from "../../../assets/tutorial/fill-community.png";
import uploadImagesImg from "../../../assets/tutorial/upload-images.png";
import subscriptionImg from "../../../assets/tutorial/subscription.png";
import submitImg from "../../../assets/tutorial/proceed-community.png";

// Import images for join flow
import browseImg from "../../../assets/tutorial/browse.png";
import previewImg from "../../../assets/tutorial/preview.png";
import joinImg from "../../../assets/tutorial/join.png";
import contentImg from "../../../assets/tutorial/content.png";

const TutorialPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [activeStep, setActiveStep] = useState(0);

    const createSteps = [
        {
            label: "Create an Account",
            description:
                "Sign up or log in to get started with community creation",
            image: createAccountImg,
        },
        {
            label: "Navigate to Create Page",
            description: "Go to the 'Create Community' page from the main menu",
            image: createCommunityImg,
        },
        {
            label: "Fill Community Details",
            description:
                "Enter your community name, description, category, and rules",
            image: fillCommunityImg,
        },
        {
            label: "Upload Images",
            description: "Add a banner image and logo for your community",
            image: uploadImagesImg,
        },
        {
            label: "Set Subscription Fee",
            description:
                "Decide if your community will be free or paid. if free, write '0'.",
            image: subscriptionImg,
        },
        {
            label: "Review and Submit",
            description:
                "Complete any required payments and launch your community",
            image: submitImg,
        },
    ];

    const joinSteps = [
        {
            label: "Create an Account",
            description: "Sign up or log in to join communities",
            image: createAccountImg,
        },
        {
            label: "Browse Communities",
            description:
                "Explore communities by category or search for specific ones",
            image: browseImg,
        },
        {
            label: "Preview Community",
            description:
                "View community details, rules, and subscription options",
            image: previewImg,
        },
        {
            label: "Join Community",
            description: "Click 'Join' and complete any required payments",
            image: joinImg,
        },
        {
            label: "Access Content",
            description:
                "Start participating in discussions and accessing exclusive content",
            image: contentImg,
        },
    ];

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setActiveStep(0);
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStart = () => {
        if (activeTab === 0) {
            navigate("/create-a-community");
        } else {
            navigate("/communities");
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
            <Typography variant="h3" align="center" gutterBottom sx={{ mb: 4 }}>
                Community Tutorial
            </Typography>

            <Paper elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        "& .MuiTabs-indicator": {
                            height: 4,
                        },
                    }}>
                    <Tab
                        label="Create a Community"
                        sx={{ py: 3, fontWeight: 600 }}
                    />
                    <Tab
                        label="Join a Community"
                        sx={{ py: 3, fontWeight: 600 }}
                    />
                </Tabs>
            </Paper>

            {activeTab === 0 ? (
                <Stepper activeStep={activeStep} orientation="vertical">
                    {createSteps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel
                                optional={
                                    index === createSteps.length - 1 ? (
                                        <Typography variant="caption">
                                            Final step
                                        </Typography>
                                    ) : null
                                }>
                                <Typography variant="h6">
                                    {step.label}
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        mb: 2,
                                    }}>
                                    <img
                                        src={step.image}
                                        alt={step.label}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: 200,
                                            borderRadius: "8px",
                                            border: "1px solid #e0e0e0",
                                            marginBottom: "16px",
                                        }}
                                    />
                                    <Typography
                                        variant="body1"
                                        sx={{ textAlign: "center" }}>
                                        {step.description}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <div>
                                        <Button
                                            variant="contained"
                                            onClick={handleNext}
                                            sx={{ mt: 1, mr: 1 }}>
                                            {index === createSteps.length - 1
                                                ? "Finish"
                                                : "Continue"}
                                        </Button>
                                        <Button
                                            disabled={index === 0}
                                            onClick={handleBack}
                                            sx={{ mt: 1, mr: 1 }}>
                                            Back
                                        </Button>
                                    </div>
                                </Box>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            ) : (
                <Stepper activeStep={activeStep} orientation="vertical">
                    {joinSteps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel>
                                <Typography variant="h6">
                                    {step.label}
                                </Typography>
                            </StepLabel>
                            <StepContent>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        mb: 2,
                                    }}>
                                    <img
                                        src={step.image}
                                        alt={step.label}
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: 200,
                                            borderRadius: "8px",
                                            border: "1px solid #e0e0e0",
                                            marginBottom: "16px",
                                        }}
                                    />
                                    <Typography
                                        variant="body1"
                                        sx={{ textAlign: "center" }}>
                                        {step.description}
                                    </Typography>
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                    <div>
                                        <Button
                                            variant="contained"
                                            onClick={handleNext}
                                            sx={{ mt: 1, mr: 1 }}>
                                            {index === joinSteps.length - 1
                                                ? "Finish"
                                                : "Continue"}
                                        </Button>
                                        <Button
                                            disabled={index === 0}
                                            onClick={handleBack}
                                            sx={{ mt: 1, mr: 1 }}>
                                            Back
                                        </Button>
                                    </div>
                                </Box>
                            </StepContent>
                        </Step>
                    ))}
                </Stepper>
            )}

            {activeStep ===
                (activeTab === 0 ? createSteps.length : joinSteps.length) && (
                <Paper
                    square
                    elevation={0}
                    sx={{
                        p: 3,
                        backgroundColor: theme.palette.grey[50],
                        borderRadius: 2,
                        textAlign: "center",
                    }}>
                    <Typography variant="h6" gutterBottom>
                        Tutorial completed!
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        You&apos;re now ready to{" "}
                        {activeTab === 0 ? "create" : "join"} a community.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleStart}
                        sx={{ mr: 2, fontWeight: 600 }}>
                        Get Started
                    </Button>
                    <Button
                        onClick={() => setActiveStep(0)}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}>
                        Review Again
                    </Button>
                </Paper>
            )}
        </Box>
    );
};

export default TutorialPage;
