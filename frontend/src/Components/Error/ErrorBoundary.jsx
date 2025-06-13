import { Component } from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    Divider,
    Container,
} from "@mui/material";
import logError from "../../utils/logger";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            userMessage: "",
            isReporting: false,
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // log error to db
        logError({
            error,
            errorInfo,
            type: "component",
            location: window.location.href,
        });

        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            const reloadPage = () => window.location.reload(true);
            const goHome = () => (window.location.href = "/");

            return (
                <Container
                    maxWidth="md"
                    sx={{
                        minHeight: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "background.default",
                    }}>
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            py: 4,
                        }}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                width: "100%",
                                maxWidth: 600,
                                borderRadius: 2,
                            }}>
                            <Typography
                                variant="h4"
                                component="h1"
                                gutterBottom
                                sx={{
                                    fontWeight: "bold",
                                    color: "error.main",
                                    textAlign: "center",
                                }}>
                                Oops! Something went wrong.
                            </Typography>
                            <Typography
                                variant="body1"
                                component="p"
                                gutterBottom
                                sx={{ mb: 2, textAlign: "center" }}>
                                Our team has been notified.
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 2,
                                    my: 3,
                                }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={reloadPage}
                                    sx={{ px: 4, py: 1.5 }}>
                                    Reload Page
                                </Button>

                                <Typography
                                    variant="body1"
                                    sx={{ color: "text.secondary" }}>
                                    OR
                                </Typography>

                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={goHome}
                                    sx={{ px: 4, py: 1.5 }}>
                                    Back to Home
                                </Button>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Box
                                component="form"
                                onSubmit={this.handleReportSubmit}>
                                <Typography
                                    variant="body1"
                                    gutterBottom
                                    sx={{ mb: 2 }}>
                                    <strong>Thank you:</strong> This error would
                                    be worked on by the team.
                                </Typography>
                            </Box>

                            {import.meta.env.VITE_ENV === "development" && (
                                <Box
                                    sx={{
                                        mt: 4,
                                        p: 2,
                                        bgcolor: "grey.100",
                                        borderRadius: 1,
                                    }}>
                                    <Typography variant="h6" gutterBottom>
                                        Error Details (Development Only)
                                    </Typography>
                                    <pre>{this.state.error?.stack}</pre>
                                    <pre>
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
