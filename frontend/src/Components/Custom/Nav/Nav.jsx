import useResponsive from "../../Hooks/useResponsive";
import {
    AppBar,
    Toolbar,
    IconButton,
    Drawer,
    Avatar,
    Button,
    Box,
    Divider,
    useTheme,
    Menu,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import { UserProfile } from "./NavSlide";
import { useReactRouter } from "../../Hooks/useReactRouter";
import NavMenu from "./NavMenu";
import { useAuthContext } from "../../Context/AuthContext";
import { Link } from "react-router-dom";

const Nav = () => {
    const theme = useTheme();

    const { user } = useAuthContext();

    // responsive hook
    const { isMobile } = useResponsive();

    const { Link, useLocation } = useReactRouter();

    // states
    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopMenuAnchor, setDesktopMenuAnchor] = useState(null);
    const desktopMenuOpen = Boolean(desktopMenuAnchor);

    const location = useLocation();

    const isCommunity = location.pathname.startsWith("/community");

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleDesktopMenuOpen = (event) => {
        setDesktopMenuAnchor(event.currentTarget);
    };

    const handleDesktopMenuClose = () => {
        setDesktopMenuAnchor(null);
    };

    return (
        <>
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    backgroundColor: "background.paper",
                    color: "text.primary",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    py: 1,
                }}>
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Box display="flex" alignItems="center">
                        {isMobile && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}>
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Logo />

                        {/* Desktop Menu Button */}
                        {!isMobile && (
                            <>
                                <IconButton
                                    onClick={handleDesktopMenuOpen}
                                    color="primary"
                                    sx={{
                                        transform: desktopMenuOpen
                                            ? "rotate(180deg)"
                                            : "rotate(0)",
                                        transition: "transform 0.3s ease",
                                    }}>
                                    <ExpandMoreIcon />
                                </IconButton>

                                <Menu
                                    anchorEl={desktopMenuAnchor}
                                    open={desktopMenuOpen}
                                    onClose={handleDesktopMenuClose}
                                    PaperProps={{
                                        elevation: 3,
                                        sx: {
                                            mt: 1.5,
                                            minWidth: 200,
                                            borderRadius: 2,
                                            overflow: "visible",
                                            "&:before": {
                                                content: '""',
                                                display: "block",
                                                position: "absolute",
                                                top: 0,
                                                right: 14,
                                                width: 10,
                                                height: 10,
                                                bgcolor: "background.paper",
                                                transform:
                                                    "translateY(-50%) rotate(45deg)",
                                                zIndex: 0,
                                            },
                                        },
                                    }}
                                    transformOrigin={{
                                        horizontal: "right",
                                        vertical: "top",
                                    }}
                                    anchorOrigin={{
                                        horizontal: "right",
                                        vertical: "bottom",
                                    }}>
                                    <NavMenu
                                        isDesktop
                                        handleDrawerToggle={
                                            handleDesktopMenuClose
                                        }
                                    />
                                </Menu>
                            </>
                        )}
                    </Box>

                    <Box display="flex" alignItems="center" gap={2}>
                        {!isCommunity && user && (
                            <Button
                                component={Link}
                                to="/profile"
                                color="inherit"
                                variant="outlined"
                                sx={{ textTransform: "none" }}>
                                Profile
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                }}
                sx={{
                    "& .MuiDrawer-paper": {
                        width: 280,
                        boxSizing: "border-box",
                    },
                }}>
                <Box
                    sx={{
                        width: 280,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                    }}>
                    <Toolbar />
                    {user && (
                        <>
                            <UserProfile />
                            <Divider />
                        </>
                    )}
                    <NavMenu handleDrawerToggle={handleDrawerToggle} />
                </Box>
            </Drawer>
        </>
    );
};

export const Logo = () => {
    return (
        <Box
            component={Link}
            to="/"
            sx={{
                cursor: "pointer",
            }}>
            <Avatar
                src="/logo.png"
                alt="logo"
                sx={{
                    maxWidth: "5rem",
                    width: "fit-content",
                    objectFit: "contain",
                }}
            />
        </Box>
    );
};

export const SVG1 = () => {
    return (
        <div className="styled__IconWrapper-sc-zxv7pb-0 bAPjFs">
            <svg
                viewBox="0 0 12 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M0.702509 13.2926C1.09284 12.8995 1.72829 12.8984 2.12 13.2901L4.58579 15.7559C5.36684 16.5369 6.63316 16.5369 7.41421 15.7559L9.88 13.2901C10.2717 12.8984 10.9072 12.8995 11.2975 13.2926C11.6859 13.6837 11.6848 14.3153 11.295 14.7051L7.41421 18.5859C6.63317 19.3669 5.36684 19.3669 4.58579 18.5859L0.705005 14.7051C0.315239 14.3153 0.314123 13.6837 0.702509 13.2926Z"
                    fill="currentColor"></path>
                <path
                    d="M11.2975 7.28749C10.9072 7.68059 10.2717 7.68171 9.88 7.28999L7.41421 4.82421C6.63316 4.04316 5.36684 4.04316 4.58579 4.82421L2.12 7.28999C1.72829 7.68171 1.09284 7.68059 0.702509 7.28749C0.314123 6.89635 0.315239 6.26476 0.705005 5.87499L4.58579 1.99421C5.36683 1.21316 6.63316 1.21316 7.41421 1.99421L11.295 5.87499C11.6848 6.26476 11.6859 6.89635 11.2975 7.28749Z"
                    fill="currentColor"></path>
            </svg>
        </div>
    );
};

export const DesktopNav = ({ isDesktopNav }) => {
    return (
        <div className={`desktopNav ${isDesktopNav ? "activeDesktopNav" : ""}`}>
            <NavMenu />
        </div>
    );
};

export default Nav;
