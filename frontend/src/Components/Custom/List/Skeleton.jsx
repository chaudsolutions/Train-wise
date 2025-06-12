import { Box, Skeleton, useTheme } from "@mui/material";

const CardSkeleton = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                borderRadius: 4,
                overflow: "hidden",
                boxShadow: theme.shadows[2],
                transition: "all 0.3s ease",
                border: "1px solid",
                borderColor: theme.palette.divider,
                height: "100%",
            }}>
            <Skeleton variant="rectangular" height={180} />
            <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Skeleton
                        variant="circular"
                        width={50}
                        height={50}
                        sx={{ mr: 2 }}
                    />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="80%" height={30} />
                        <Skeleton variant="text" width="60%" />
                    </Box>
                </Box>
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="80%" />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 3,
                    }}>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="30%" />
                </Box>
            </Box>
        </Box>
    );
};

export default CardSkeleton;
