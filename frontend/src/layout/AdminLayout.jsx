import { useEffect, useState } from "react";
import {
    AppBar,
    Box,
    CssBaseline,
    IconButton,
    ThemeProvider,
    Toolbar,
    Typography,
    createTheme,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { Outlet, useNavigate } from "react-router-dom";
import useResponsive from "../Components/Hooks/useResponsive";
import SideNav from "../Components/Custom/admin/SideNav";
import { useUserData } from "../Components/Hooks/useQueryFetch/useQueryData";
import toast from "react-hot-toast";
import PageLoader from "../Components/Animations/PageLoader";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#2d3436",
        },
        secondary: {
            main: "#0984e3",
        },
    },
    spacing: 8,
});

const drawerWidth = 240;

const AdminLayout = () => {
    const { isMobile } = useResponsive();
    const [drawerOpen, setDrawerOpen] = useState(!isMobile);
    const [isLoad, setIsLoad] = useState(true);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const navigate = useNavigate();

    const { userData, isUserDataLoading } = useUserData();

    useEffect(() => {
        // Redirect if the user is not a member
        if (userData && userData?.role !== "admin") {
            toast.error("You're not an admin");

            navigate("/"); // Redirect to a "not authorized" page
        } else {
            setIsLoad(false);
        }
    }, [navigate, userData]);

    if (isUserDataLoading || isLoad) {
        return <PageLoader />;
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <AppBar
                    position="fixed"
                    sx={{
                        ml: { md: `${drawerWidth}px` },
                        width: { md: `calc(100% - ${drawerWidth}px)` },
                    }}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{
                                mr: 2,
                                display: { md: isMobile ? "block" : "none" },
                            }}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div">
                            Admin Dashboard
                        </Typography>
                    </Toolbar>
                </AppBar>
                <SideNav
                    isMobile={isMobile}
                    drawerOpen={drawerOpen}
                    handleDrawerToggle={handleDrawerToggle}
                    drawerWidth={drawerWidth}
                />
                <Box
                    component="main"
                    position="relative"
                    sx={{ p: 1, mt: 8, width: "100%" }}>
                    <Outlet /> {/* Nested route components render here */}
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default AdminLayout;
