import {
    Box,
    Drawer,
    Toolbar,
    List,
    ListItem,
    IconButton,
    Typography,
    Divider,
} from "@mui/material";
import { NavLink } from "react-router-dom"; // Import NavLink
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import CategoryIcon from "@mui/icons-material/Category";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SettingsIcon from "@mui/icons-material/Settings";
import { Logo } from "../Nav/Nav";

const SideNav = ({ isMobile, drawerOpen, handleDrawerToggle, drawerWidth }) => {
    const navItems = [
        {
            text: "Dashboard",
            icon: <DashboardIcon />,
            path: "",
        },
        { text: "Users", icon: <PeopleIcon />, path: "/admin/dashboard/users" },
        {
            text: "Communities",
            icon: <GroupsIcon />,
            path: "communities",
        },
        {
            text: "Create Community",
            icon: <GroupsIcon />,
            path: "create-community",
        },
        {
            text: "Withdrawals",
            icon: <AttachMoneyIcon />,
            path: "withdrawals",
        },
        {
            text: "Categories",
            icon: <CategoryIcon />,
            path: "categories",
        },
        {
            text: "Settings",
            icon: <SettingsIcon />,
            path: "settings",
        },
    ];

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { sm: 0 } }}>
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={drawerOpen}
                onClose={handleDrawerToggle}
                sx={{
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        bgcolor: "primary.main",
                        color: "white",
                    },
                }}>
                <Toolbar
                    sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Logo />
                    {isMobile && (
                        <IconButton
                            onClick={handleDrawerToggle}
                            color="inherit">
                            <ChevronLeftIcon />
                        </IconButton>
                    )}
                </Toolbar>
                <Divider />
                <List>
                    {navItems.map((item) => (
                        <ListItem
                            component={NavLink}
                            to={item.path}
                            key={item.text}
                            onClick={isMobile ? handleDrawerToggle : null} // Close drawer on mobile
                            sx={{
                                py: 1.5,
                                color: "white",
                                "&:hover": { bgcolor: "primary.dark" },
                                "&.active": { bgcolor: "primary.dark" }, // Highlight active link
                            }}>
                            <IconButton sx={{ color: "white" }}>
                                {item.icon}
                            </IconButton>
                            <Typography fontSize=".85rem" sx={{ ml: 1 }}>
                                {item.text}
                            </Typography>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </Box>
    );
};

export default SideNav;
