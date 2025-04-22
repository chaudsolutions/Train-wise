import { Box, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const PageLoader = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100vh", // Full viewport height
                backgroundColor: theme.palette.background.default,
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: theme.zIndex.modal + 1, // Ensure it's above other content
            }}>
            <CircularProgress
                size={60}
                thickness={3}
                sx={{
                    color: theme.palette.info.main,
                    "& .MuiCircularProgress-circle": {
                        strokeLinecap: "round",
                    },
                }}
            />
        </Box>
    );
};

export default PageLoader;
