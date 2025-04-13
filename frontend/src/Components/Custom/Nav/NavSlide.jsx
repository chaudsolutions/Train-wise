import { Link } from "react-router-dom";
import Logout from "../Buttons/Logout";
import { useAuthContext } from "../../Context/AuthContext";
import { useUserData } from "../../Hooks/useQueryFetch/useQueryData";
import { Avatar, Box, Button, Typography } from "@mui/material";
import { AccountCircle, ChevronRight } from "@mui/icons-material";

export const AuthContainer = ({ setAuthOpen }) => {
    const { user } = useAuthContext();

    return (
        <>
            {user ? (
                <Logout />
            ) : (
                <Button
                    variant="outlined"
                    color="info"
                    onClick={() => setAuthOpen((prev) => !prev)}>
                    LOGIN
                </Button>
            )}
        </>
    );
};

export const UserProfile = () => {
    const isProfilePage = location.pathname === "/profile";

    const { userData } = useUserData();

    const { name, role } = userData || {};

    return (
        <Box sx={{ p: 3, textAlign: "center" }}>
            <Avatar
                sx={{
                    width: 80,
                    height: 80,
                    mb: 2,
                    mx: "auto",
                }}>
                <AccountCircle sx={{ fontSize: 80 }} />
            </Avatar>

            {isProfilePage ? (
                <>
                    <Typography variant="h6" gutterBottom>
                        {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        @{role}
                    </Typography>
                </>
            ) : (
                <Button
                    component={Link}
                    to="/profile"
                    endIcon={<ChevronRight />}
                    sx={{
                        textTransform: "none",
                        color: "text.primary",
                    }}>
                    My Profile
                </Button>
            )}
        </Box>
    );
};
