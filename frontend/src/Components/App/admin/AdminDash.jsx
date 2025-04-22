import { useState } from "react";
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
import useResponsive from "../../Hooks/useResponsive";
import { Outlet } from "react-router-dom";
import SideNav from "../../Custom/admin/SideNav";

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

const AdminDash = () => {
    const { isMobile } = useResponsive();
    const [drawerOpen, setDrawerOpen] = useState(!isMobile);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

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
                    sx={{ flexGrow: 1, p: 1, mt: 8 }}>
                    <Outlet /> {/* Nested route components render here */}
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default AdminDash;
