import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    useTheme,
    Box,
} from "@mui/material";
import { useUserData } from "../../Hooks/useQueryFetch/useQueryData";
import { Link } from "react-router-dom";
import ExploreIcon from "@mui/icons-material/Explore";
import AddIcon from "@mui/icons-material/Add";
import { Settings } from "@mui/icons-material";

const NavMenu = ({ handleDrawerToggle }) => {
    const theme = useTheme();
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
            name: "Admin Dashboard",
            link: "/admin/dashboard",
            icon: <Settings fontSize="large" />,
            show: role === "admin",
        },
    ];

    return (
        <List sx={{ width: "100%" }}>
            {isUserDataLoading ? (
                <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress color="info" />
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
                                    "&.active": {
                                        backgroundColor:
                                            theme.palette.action.selected,
                                        borderLeft: `4px solid ${theme.palette.info.main}`,
                                        "& .MuiListItemIcon-root": {
                                            color: theme.palette.info.main,
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
                                    primary={item.name}
                                    primaryTypographyProps={{
                                        variant: "body1",
                                    }}
                                />
                            </ListItem>
                        )
                )
            )}
        </List>
    );
};

export default NavMenu;
