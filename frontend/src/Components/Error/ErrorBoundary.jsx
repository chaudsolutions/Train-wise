import { Component } from "react";
import {
    Box,
    Typography,
    Button,
    Paper,
    Divider,
    TextField,
    Container,
} from "@mui/material";

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
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReportSubmit = (e) => {
        e.preventDefault();
        this.setState({ isReporting: true });

        // Here you would typically send the error to your error tracking service
        console.log("Error report:", {
            error: this.state.error?.toString(),
            stack: this.state.errorInfo?.componentStack,
            userMessage: this.state.userMessage,
        });

        // Simulate API call
        setTimeout(() => {
            this.setState({ isReporting: false });
            alert("Thank you for your report! We'll look into this issue.");
        }, 1500);
    };

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
                                    <strong>Help us improve:</strong> Report
                                    this error to our team
                                </Typography>

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={1}
                                    variant="outlined"
                                    placeholder="What were you doing when this happened? (Optional)"
                                    value={this.state.userMessage}
                                    onChange={(e) =>
                                        this.setState({
                                            userMessage: e.target.value,
                                        })
                                    }
                                    sx={{ mb: 2 }}
                                />

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                    }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="secondary"
                                        disabled={this.state.isReporting}>
                                        {this.state.isReporting
                                            ? "Submitting..."
                                            : "Submit Report"}
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
