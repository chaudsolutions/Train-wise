import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    useTheme,
    Box,
    Button,
} from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useUserData } from "../../Hooks/useQueryFetch/useQueryData";
import { Link } from "react-router-dom";
import ExploreIcon from "@mui/icons-material/Explore";
import AddIcon from "@mui/icons-material/Add";
import { Notifications, Person, Settings } from "@mui/icons-material";
import { useAuthContext } from "../../Context/AuthContext";
import Logout from "../Buttons/Logout";

const NavMenu = ({ handleDrawerToggle }) => {
    const theme = useTheme();
    const { user } = useAuthContext();
    const { userData, isUserDataLoading } = useUserData();
    const { role } = userData || {};

    const menuItems = [
        {
            name: "Discover communities",
            link: "/discovery",
            icon: <ExploreIcon fontSize="large" />,
            show: true,
        },
        {
            name: "Create a community",
            link: "/create-a-community",
            icon: <AddIcon fontSize="large" />,
            show: role === "creator" || role === "admin" || !role,
        },
        {
            name: "Profile",
            link: "/profile",
            icon: <Person fontSize="large" />,
            show: user,
        },
        {
            name: "Notifications",
            link: "/notifications",
            icon: <Notifications fontSize="large" />,
            show: user,
        },
        {
            name: "Withdrawals",
            link: "/withdrawals",
            icon: <AttachMoneyIcon fontSize="large" />,
            show: user,
        },
        {
            name: "Admin Dashboard",
            link: "/admin/dashboard",
            icon: <Settings fontSize="large" />,
            show: user && role === "admin",
        },
    ];

    return (
        <List sx={{ width: "100%" }}>
            {isUserDataLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress color="primary" />
                </Box>
            ) : (
                menuItems.map(
                    (item, index) =>
                        item.show && (
                            <ListItem
                                button="true"
                                key={index}
                                component={Link}
                                to={item.link}
                                onClick={handleDrawerToggle}
                                sx={{
                                    px: 3,
                                    py: 2,
                                    color: theme.palette.text.primary,
                                    "&.active": {
                                        backgroundColor:
                                            theme.palette.action.selected,
                                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                                        "& .MuiListItemIcon-root": {
                                            color: theme.palette.primary.main,
                                        },
                                        "& .MuiListItemText-primary": {
                                            fontWeight: 600,
                                        },
                                    },
                                    "&:hover": {
                                        backgroundColor:
                                            theme.palette.action.hover,
                                    },
                                }}>
                                <ListItemIcon sx={{ minWidth: 48 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    color="inherit"
                                    primary={item.name}
                                    primaryTypographyProps={{
                                        variant: "body1",
                                    }}
                                />
                            </ListItem>
                        )
                )
            )}

            <Box display="flex" justifyContent="center" my={3}>
                {user ? (
                    <Logout handleDrawerToggle={handleDrawerToggle} />
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        size="large"
                        to="/sign-in"
                        onClick={handleDrawerToggle}
                        startIcon={<Person />}>
                        Login
                    </Button>
                )}
            </Box>
        </List>
    );
};

export default NavMenu;
