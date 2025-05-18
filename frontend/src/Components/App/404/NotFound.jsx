import {
    Box,
    Typography,
    Button,
    Container,
    useTheme,
    Avatar,
} from "@mui/material";
import { useReactRouter } from "../../Hooks/useReactRouter";

const NotFound = () => {
    const theme = useTheme();

    const { useNavigate } = useReactRouter();
    const navigate = useNavigate();

    const goHome = () => {
        navigate("/");
    };

    return (
        <Container maxWidth="sm" sx={{ py: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 3,
                }}>
                {/* Logo */}
                <Avatar
                    src="/logo.png"
                    alt="logo"
                    sx={{
                        width: 100,
                        height: 100,
                    }}
                />

                {/* 404 Text */}
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: "3rem",
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        lineHeight: 1,
                    }}>
                    404
                </Typography>

                <Typography
                    variant="h4"
                    fontSize="1.1rem"
                    sx={{
                        fontWeight: 600,
                    }}>
                    Page Not Found
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                        maxWidth: 400,
                        mb: 3,
                    }}>
                    The page you are looking for might have been removed, had
                    its name changed, or is temporarily unavailable.
                </Typography>

                {/* Home Button */}
                <Button
                    variant="contained"
                    color="info"
                    size="large"
                    onClick={goHome}
                    sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: "1rem",
                    }}>
                    Back to Home
                </Button>
            </Box>
        </Container>
    );
};

export default NotFound;
